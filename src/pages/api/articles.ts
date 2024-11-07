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
    
    // 构建查询条件数组
    const conditions = [];
    const values = [];
    let paramIndex = 1;

    if (startDate) {
      conditions.push(`a.pub_date >= $${paramIndex}`);
      values.push(startDate);
      paramIndex++;
    }
    
    if (endDate) {
      conditions.push(`a.pub_date <= $${paramIndex}`);
      values.push(endDate);
      paramIndex++;
    }
    
    if (author) {
      conditions.push(`a.author ILIKE $${paramIndex}`);
      values.push(`%${author}%`);
      paramIndex++;
    }
    
    if (source) {
      conditions.push(`s.name ILIKE $${paramIndex}`);
      values.push(`%${source}%`);
      paramIndex++;
    }
    
    if (sourceType) {
      conditions.push(`s.source_type = $${paramIndex}`);
      values.push(sourceType);
      paramIndex++;
    }

    // 构建WHERE子句
    const whereClause = conditions.length > 0 
      ? `WHERE ${conditions.join(' AND ')}`
      : '';

    // 构建基础查询
    const baseQuery = `
      SELECT 
        a.*,
        s.name as source_name,
        s.source_type
      FROM rss_articles a
      JOIN rss_sources s ON a.source_id = s.id
      ${whereClause}
    `;

    // 获取总数
    const countResult = await sql.query(
      `SELECT COUNT(*) FROM (${baseQuery}) as count_query`,
      values
    );
    const total = parseInt(countResult.rows[0].count);

    // 获取分页数据
    const result = await sql.query(
      `${baseQuery}
       ORDER BY a.pub_date ${timeOrder === 'desc' ? 'DESC' : 'ASC'}
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      [...values, Number(pageSize), offset]
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