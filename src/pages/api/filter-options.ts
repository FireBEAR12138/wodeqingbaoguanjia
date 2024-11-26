import type { NextApiRequest, NextApiResponse } from 'next';
import { sql } from '../../lib/db';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // 获取所有唯一的分类
    const categoriesResult = await sql`
      SELECT DISTINCT category 
      FROM rss_sources 
      WHERE category IS NOT NULL 
      ORDER BY category
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
      categories: categoriesResult.rows.map(row => row.category),
      sources: sourcesResult.rows.map(row => row.name),
      sourceTypes: sourceTypesResult.rows.map(row => row.source_type)
    });
  } catch (error) {
    console.error('Error fetching filter options:', error);
    res.status(500).json({ error: 'Failed to fetch filter options' });
  }
} 