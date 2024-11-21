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

// 添加重试机制
async function retry<T>(
    fn: () => Promise<T>,
    retries = 3,
    delay = 1000
): Promise<T> {
    try {
        return await fn();
    } catch (error) {
        if (retries === 0) throw error;
        await new Promise(resolve => setTimeout(resolve, delay));
        return retry(fn, retries - 1, delay * 2);
    }
}

// 处理单个文章
async function processArticle(
    item: RSSItem,
    sourceId: number,
    sourceName: string
): Promise<boolean> {
    try {
        if (!item.link) {
            console.log('Skipping item without link');
            return false;
        }

        const exists = await checkArticleExists(item.link);
        if (exists) {
            console.log(`Article already exists: ${item.link}`);
            return false;
        }

        console.log(`Generating AI summary for: ${item.title}`);
        const aiSummary = await retry(() => 
            generateAISummary(
                item.content || item.description || '',
                item.title || '无标题'
            )
        );

        await saveArticle({
            sourceId,
            title: item.title || '无标题',
            link: item.link,
            description: item.content || item.description || '',
            pubDate: item.pubDate ? new Date(item.pubDate) : new Date(),
            author: item.author || '未知作者',
            aiSummary
        });

        return true;
    } catch (error) {
        console.error(`Error processing article ${item.title}:`, error);
        return false;
    }
}

// 处理单个源
async function processSource(source: any): Promise<number> {
    try {
        console.log(`Processing source: ${source.name} (${source.url})`);
        const parser = new Parser<{items: RSSItem[]}>();

        const feed = await retry(() => parser.parseURL(source.url));
        console.log(`Fetched ${feed.items.length} items from feed`);

        let newItemsCount = 0;
        const batchSize = 5; // 每批处理5篇文章

        for (let i = 0; i < feed.items.length; i += batchSize) {
            const batch = feed.items.slice(i, i + batchSize);
            const results = await Promise.all(
                batch.map(item => processArticle(item, source.id, source.name))
            );
            newItemsCount += results.filter(Boolean).length;
        }

        // 更新源的最后更新时间
        await sql`
            UPDATE rss_sources 
            SET last_update = CURRENT_TIMESTAMP 
            WHERE id = ${source.id}
        `;

        return newItemsCount;
    } catch (error) {
        console.error(`Error processing source ${source.name}:`, error);
        return 0;
    }
}

export async function fetchAndProcessRSS(sourceId?: number) {
    console.log('Fetching RSS sources from database...');
    const { rows: sources } = sourceId 
        ? await sql`SELECT * FROM rss_sources WHERE id = ${sourceId}`
        : await sql`SELECT * FROM rss_sources`;
    console.log(`Found ${sources.length} RSS sources`);

    let totalNewItems = 0;
    for (const source of sources) {
        try {
            const newItems = await processSource(source);
            totalNewItems += newItems;
            console.log(`Added ${newItems} new items from ${source.name}`);
        } catch (error) {
            console.error(`Error processing source ${source.name}:`, error);
        }
    }

    return { totalNewItems };
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