import type { NextApiRequest, NextApiResponse } from 'next';
import { sql } from '../../lib/db';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const { 
      page = '1', 
      pageSize = '10',
      timeOrder = 'desc',
      startDate,
      endDate,
      author,
      source,
      sourceType
    } = req.query;
    
    const offset = (Number(page) - 1) * Number(pageSize);
    
    // 构建基础查询
    let query = sql`
      SELECT 
        a.*,
        s.name as source_name,
        s.source_type
      FROM rss_articles a
      JOIN rss_sources s ON a.source_id = s.id
      WHERE 1=1
    `;

    // 添加筛选条件
    if (startDate) {
      query = sql`${query} AND a.pub_date >= ${startDate}`;
    }
    
    if (endDate) {
      query = sql`${query} AND a.pub_date <= ${endDate}`;
    }
    
    if (author) {
      query = sql`${query} AND a.author ILIKE ${`%${author}%`}`;
    }
    
    if (source) {
      query = sql`${query} AND s.name ILIKE ${`%${source}%`}`;
    }
    
    if (sourceType) {
      query = sql`${query} AND s.source_type = ${sourceType}`;
    }

    // 获取总数
    const countResult = await sql`
      SELECT COUNT(*) FROM (${query}) as count_query
    `;
    const total = parseInt(countResult.rows[0].count);

    // 添加排序和分页
    const result = await sql`
      ${query}
      ORDER BY a.pub_date ${timeOrder === 'desc' ? sql`DESC` : sql`ASC`}
      LIMIT ${Number(pageSize)} OFFSET ${offset}
    `;

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