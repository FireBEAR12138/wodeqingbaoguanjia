import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";
import Parser from 'rss-parser';
import { pool } from '../db/connection';
import { RSSItem } from '../types/article';
import { fetchTwitterFeed } from './twitterFetcher';

const bedrock = new BedrockRuntimeClient({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
    }
});

export async function fetchAndProcessRSS() {
    const parser = new Parser<{items: RSSItem[]}>();
    
    const { rows: sources } = await pool.query('SELECT * FROM rss_sources');
    
    for (const source of sources) {
        try {
            let feed;
            if (source.source_type === 'twitter') {
                feed = await fetchTwitterFeed(source.url);
            } else {
                feed = await parser.parseURL(source.url);
            }
            
            for (const item of feed.items) {
                if (!item.link) continue;
                
                // 检查文章是否已存在
                const exists = await checkArticleExists(item.link);
                if (exists) continue;
                
                // 生成AI摘要
                const aiSummary = await generateAISummary(item.content || item.description || '');
                
                // 存储文章
                await saveArticle({
                    sourceId: source.id,
                    title: item.title || '无标题',
                    link: item.link,
                    description: item.content || item.description || '',
                    pubDate: item.pubDate ? new Date(item.pubDate) : new Date(),
                    author: item.author || '未知作者',
                    aiSummary
                });
            }
        } catch (error) {
            console.error(`Error processing RSS source ${source.name}:`, error);
        }
    }
}

async function generateAISummary(content: string): Promise<string> {
    const prompt = `请用中文简要总结以下内容（200字以内）：\n\n${content}`;
    
    const response = await bedrock.send(new InvokeModelCommand({
        modelId: process.env.MODEL_ID,
        contentType: "application/json",
        accept: "application/json",
        body: JSON.stringify({
            anthropic_version: "bedrock-2023-05-31",
            max_tokens: 300,
            messages: [{ role: "user", content: prompt }]
        })
    }));
    
    const result = JSON.parse(new TextDecoder().decode(response.body));
    return result.content[0].text;
}

async function checkArticleExists(link: string): Promise<boolean> {
    const { rows } = await pool.query(
        'SELECT EXISTS(SELECT 1 FROM rss_articles WHERE link = $1)',
        [link]
    );
    return rows[0].exists;
}

async function saveArticle(article: {
    sourceId: number;
    title: string;
    link: string;
    description: string;
    pubDate: Date;
    author?: string;
    aiSummary: string;
}): Promise<void> {
    await pool.query(
        `INSERT INTO rss_articles 
         (source_id, title, link, description, pub_date, author, ai_summary)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
            article.sourceId,
            article.title,
            article.link,
            article.description,
            article.pubDate,
            article.author,
            article.aiSummary
        ]
    );
} 