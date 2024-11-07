import type { NextApiRequest, NextApiResponse } from 'next';
import { sql } from '../../lib/db';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // 创建 RSS 源表
    await sql`
      CREATE TABLE IF NOT EXISTS rss_sources (
        id SERIAL PRIMARY KEY,
        category VARCHAR(50) NOT NULL,
        name VARCHAR(100) NOT NULL,
        source_type VARCHAR(20) NOT NULL,
        url TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // 创建文章表
    await sql`
      CREATE TABLE IF NOT EXISTS rss_articles (
        id SERIAL PRIMARY KEY,
        source_id INTEGER REFERENCES rss_sources(id),
        title TEXT NOT NULL,
        link TEXT NOT NULL,
        description TEXT,
        pub_date TIMESTAMP WITH TIME ZONE,
        author VARCHAR(100),
        ai_summary TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(link)
      )
    `;

    // 插入测试数据
    await sql`
      INSERT INTO rss_sources (category, name, source_type, url)
      VALUES 
        ('资讯', '虎嗅', 'website', 'https://rss.huxiu.com/'),
        ('商业', '财富中文网', 'website', 'https://plink.anyfeeder.com/fortunechina/shangye'),
        ('AI', 'The Verge - AI', 'website', 'https://www.theverge.com/rss/ai-artificial-intelligence/index.xml')
      ON CONFLICT DO NOTHING
    `;

    res.status(200).json({ message: 'Database initialized successfully' });
  } catch (error) {
    console.error('Database initialization error:', error);
    res.status(500).json({ error: 'Failed to initialize database' });
  }
} 