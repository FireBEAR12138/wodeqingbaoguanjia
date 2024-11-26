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

    // 获取所有唯一的源类型
    const sourceTypesResult = await sql`
      SELECT DISTINCT source_type 
      FROM rss_sources 
      WHERE source_type IS NOT NULL 
      ORDER BY source_type
    `;

    res.status(200).json({
      categories: categoriesResult.rows.map(row => row.category),
      sourceTypes: sourceTypesResult.rows.map(row => row.source_type)
    });
  } catch (error) {
    console.error('Error fetching source options:', error);
    res.status(500).json({ error: 'Failed to fetch source options' });
  }
} 