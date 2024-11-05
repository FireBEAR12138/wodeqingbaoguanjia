import { NextApiRequest, NextApiResponse } from 'next';
import { pool } from '../../db/connection';
import { Article, ArticleFilter } from '../../types/article';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  try {
    const {
      page = 1,
      pageSize = 10,
      timeOrder = 'desc',
      startDate,
      endDate,
      author,
      source,
      sourceType
    } = req.query;

    let query = `
      SELECT 
        a.id, 
        a.title, 
        a.link, 
        a.description, 
        a.ai_summary, 
        a.pub_date, 
        a.author,
        s.name as source_name,
        s.source_type
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

    if (author) {
      query += ` AND a.author ILIKE $${paramIndex}`;
      params.push(`%${author}%`);
      paramIndex++;
    }

    if (source) {
      query += ` AND s.name ILIKE $${paramIndex}`;
      params.push(`%${source}%`);
      paramIndex++;
    }

    if (sourceType) {
      query += ` AND s.source_type = $${paramIndex}`;
      params.push(sourceType);
      paramIndex++;
    }

    // 计算总数
    const countResult = await pool.query(
      `SELECT COUNT(*) FROM (${query}) as count_query`,
      params
    );
    const total = parseInt(countResult.rows[0].count);

    // 添加排序和分页
    query += ` ORDER BY a.pub_date ${timeOrder === 'desc' ? 'DESC' : 'ASC'}`;
    query += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(pageSize, (Number(page) - 1) * Number(pageSize));

    const result = await pool.query(query, params);

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