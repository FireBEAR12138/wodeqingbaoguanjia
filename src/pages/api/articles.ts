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
      categories,
      sources,
      sourceTypes
    } = req.query;

    let query = `
      SELECT 
        a.*,
        s.name as source_name,
        s.source_type,
        s.category
      FROM rss_articles a
      JOIN rss_sources s ON a.source_id = s.id
      WHERE 1=1
    `;
    
    const params: any[] = [];
    let paramIndex = 1;

    if (startDate) {
      query += ` AND a.pub_date >= $${paramIndex}`;
      params.push(new Date(startDate as string));
      paramIndex++;
    }

    if (endDate) {
      query += ` AND a.pub_date <= $${paramIndex}`;
      params.push(new Date(endDate as string));
      paramIndex++;
    }

    if (categories) {
      const categoryList = (categories as string).split(',');
      query += ` AND s.category = ANY($${paramIndex})`;
      params.push(categoryList);
      paramIndex++;
    }

    if (sources) {
      const sourceList = (sources as string).split(',');
      query += ` AND s.name = ANY($${paramIndex})`;
      params.push(sourceList);
      paramIndex++;
    }

    if (sourceTypes) {
      const typeList = (sourceTypes as string).split(',');
      query += ` AND s.source_type = ANY($${paramIndex})`;
      params.push(typeList);
      paramIndex++;
    }

    // 计算总数
    const countResult = await sql.query(
      `SELECT COUNT(*) FROM (${query}) as count_query`,
      params
    );
    const total = parseInt(countResult.rows[0].count);

    // 添加排序和分页
    query += ` ORDER BY a.pub_date ${timeOrder === 'desc' ? 'DESC' : 'ASC'}`;
    query += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(Number(pageSize), (Number(page) - 1) * Number(pageSize));

    const result = await sql.query(query, params);

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