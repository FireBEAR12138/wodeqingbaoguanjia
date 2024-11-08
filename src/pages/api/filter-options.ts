import type { NextApiRequest, NextApiResponse } from 'next';
import { sql } from '../../lib/db';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // 获取所有唯一的作者
    const authorsResult = await sql`
      SELECT DISTINCT author 
      FROM rss_articles 
      WHERE author IS NOT NULL 
      ORDER BY author
    `;

    // 获取所有唯一的订阅源
    const sourcesResult = await sql`
      SELECT DISTINCT name 
      FROM rss_sources 
      ORDER BY name
    `;

    // 获取所有唯一的来源类型
    const sourceTypesResult = await sql`
      SELECT DISTINCT source_type 
      FROM rss_sources 
      ORDER BY source_type
    `;

    res.status(200).json({
      authors: authorsResult.rows.map(row => row.author),
      sources: sourcesResult.rows.map(row => row.name),
      sourceTypes: sourceTypesResult.rows.map(row => row.source_type)
    });
  } catch (error) {
    console.error('Error fetching filter options:', error);
    res.status(500).json({ error: 'Failed to fetch filter options' });
  }
} 