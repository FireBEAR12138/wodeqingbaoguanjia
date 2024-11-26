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
      authors,
      sources,
      sourceTypes
    } = req.query;

    // 构建基础查询条件
    const conditions = [];
    const params = [];
    let paramIndex = 1;

    if (startDate) {
      conditions.push(`a.pub_date >= $${paramIndex}`);
      params.push(new Date(startDate as string));
      paramIndex++;
    }

    if (endDate) {
      conditions.push(`a.pub_date <= $${paramIndex}`);
      params.push(new Date(endDate as string));
      paramIndex++;
    }

    if (authors) {
      const authorList = (authors as string).split(',');
      conditions.push(`a.author = ANY($${paramIndex})`);
      params.push(authorList);
      paramIndex++;
    }

    if (sources) {
      const sourceList = (sources as string).split(',');
      conditions.push(`s.name = ANY($${paramIndex})`);
      params.push(sourceList);
      paramIndex++;
    }

    if (sourceTypes) {
      const typeList = (sourceTypes as string).split(',');
      conditions.push(`s.source_type = ANY($${paramIndex})`);
      params.push(typeList);
      paramIndex++;
    }

    // 构建 WHERE 子句
    const whereClause = conditions.length > 0 
      ? `WHERE ${conditions.join(' AND ')}`
      : '';

    // 计算总数
    const countQuery = `
      SELECT COUNT(*) 
      FROM rss_articles a
      JOIN rss_sources s ON a.source_id = s.id
      ${whereClause}
    `;
    
    const countResult = await sql.query(countQuery, params);
    const total = parseInt(countResult.rows[0].count);

    // 获取分页数据
    const offset = (Number(page) - 1) * Number(pageSize);
    const dataQuery = `
      SELECT 
        a.*,
        s.name as source_name,
        s.source_type,
        s.category
      FROM rss_articles a
      JOIN rss_sources s ON a.source_id = s.id
      ${whereClause}
      ORDER BY a.pub_date ${timeOrder === 'desc' ? 'DESC' : 'ASC'}
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    
    params.push(Number(pageSize), offset);
    const result = await sql.query(dataQuery, params);

    res.status(200).json({
      articles: result.rows,
      total,
      page: Number(page),
      pageSize: Number(pageSize),
      totalPages: Math.ceil(total / Number(pageSize))
    });
  } catch (error) {
    console.error('Error fetching articles:', error);
    res.status(500).json({ error: 'Failed to fetch articles' });
  }
} 