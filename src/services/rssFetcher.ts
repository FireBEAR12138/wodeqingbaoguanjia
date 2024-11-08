import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";
import Parser from 'rss-parser';
import { sql } from '../lib/db';
import { RSSItem } from '../types/article';

const bedrock = new BedrockRuntimeClient({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
    }
});

const RSSHUB_BASE_URL = 'https://rsshubservice-be5b67e615d6.herokuapp.com';

export async function fetchAndProcessRSS() {
    const parser = new Parser<{items: RSSItem[]}>();
    
    const { rows: sources } = await sql`SELECT * FROM rss_sources`;
    
    for (const source of sources) {
        try {
            // 处理 URL，如果是 Twitter 源，使用 RSSHub URL
            const feedUrl = source.source_type === 'twitter' 
                ? `${RSSHUB_BASE_URL}${source.url}`
                : source.url;

            const feed = await parser.parseURL(feedUrl);
            
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

async function checkArticleExists(link: string): Promise<boolean> {
    const result = await sql`
        SELECT EXISTS(SELECT 1 FROM rss_articles WHERE link = ${link})
    `;
    return result.rows[0].exists;
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

async function saveArticle(article: {
    sourceId: number;
    title: string;
    link: string;
    description: string;
    pubDate: Date;
    author: string;
    aiSummary: string;
}): Promise<void> {
    await sql`
        INSERT INTO rss_articles 
        (source_id, title, link, description, pub_date, author, ai_summary)
        VALUES 
        (${article.sourceId}, ${article.title}, ${article.link}, 
         ${article.description}, ${article.pubDate.toISOString()}, ${article.author}, 
         ${article.aiSummary})
    `;
} 