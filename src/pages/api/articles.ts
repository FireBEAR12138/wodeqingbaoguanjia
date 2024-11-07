import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '../../lib/db';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const { page = '1', pageSize = '10' } = req.query;
    const offset = (Number(page) - 1) * Number(pageSize);

    // 获取文章总数
    const countResult = await db.query('SELECT COUNT(*) FROM rss_articles');
    const total = parseInt(countResult.rows[0].count);

    // 获取分页的文章数据
    const result = await db.query(
      `SELECT 
        a.*,
        s.name as source_name,
        s.source_type
      FROM rss_articles a
      JOIN rss_sources s ON a.source_id = s.id
      ORDER BY a.pub_date DESC
      LIMIT $1 OFFSET $2`,
      [pageSize, offset]
    );

    res.status(200).json({
      articles: result.rows,
      total,
      page: Number(page),
      pageSize: Number(pageSize),
      totalPages: Math.ceil(total / Number(pageSize))
    });
  } catch (error) {
    console.error('Database query error:', error);
    res.status(500).json({ error: 'Failed to fetch articles' });
  }
} 