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

export async function fetchAndProcessRSS(sourceId?: number) {
    const parser = new Parser<{items: RSSItem[]}>();
    
    console.log('Fetching RSS sources from database...');
    const { rows: sources } = sourceId 
        ? await sql`SELECT * FROM rss_sources WHERE id = ${sourceId}`
        : await sql`SELECT * FROM rss_sources`;
    console.log(`Found ${sources.length} RSS sources`);
    
    for (const source of sources) {
        try {
            console.log(`Processing source: ${source.name} (${source.url})`);
            
            // 直接使用源 URL，不需要额外拼接
            const feedUrl = source.url;
            
            console.log(`Fetching feed from: ${feedUrl}`);
            const feed = await parser.parseURL(feedUrl);
            console.log(`Fetched ${feed.items.length} items from feed`);
            
            let newItemsCount = 0;
            for (const item of feed.items) {
                if (!item.link) {
                    console.log('Skipping item without link');
                    continue;
                }
                
                // 检查文章是否已存在
                const exists = await checkArticleExists(item.link);
                if (exists) {
                    console.log(`Article already exists: ${item.link}`);
                    continue;
                }
                
                console.log(`Generating AI summary for: ${item.title}`);
                const aiSummary = await generateAISummary(
                    item.content || item.description || '',
                    item.title || '无标题'
                );
                
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
                newItemsCount++;
            }

            console.log(`Added ${newItemsCount} new items from ${source.name}`);

            // 更新源的最后更新时间
            await sql`
                UPDATE rss_sources 
                SET last_update = CURRENT_TIMESTAMP 
                WHERE id = ${source.id}
            `;
            
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

async function generateAISummary(content: string, title: string): Promise<string> {
    const prompt = `请用中文简要总结以下内容（200字以内）：\n\n标题：${title}\n\n内容：${content}\noutput:`;
    
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