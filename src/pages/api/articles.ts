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

    // 构建基础查询条件
    const conditions = [];
    const params: any[] = [];
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

    if (categories) {
      const categoryList = (categories as string).split(',');
      conditions.push(`s.category = ANY($${paramIndex})`);
      params.push(categoryList);
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

    const whereClause = conditions.length > 0 
      ? `WHERE ${conditions.join(' AND ')}`
      : '';

    // 使用单个查询获取总数和分页数据
    const query = `
      WITH filtered_articles AS (
        SELECT 
          a.*,
          s.name as source_name,
          s.source_type,
          s.category
        FROM rss_articles a
        JOIN rss_sources s ON a.source_id = s.id
        ${whereClause}
      ),
      total_count AS (
        SELECT COUNT(*) as total FROM filtered_articles
      )
      SELECT 
        a.*,
        (SELECT total FROM total_count) as full_count
      FROM filtered_articles a
      ORDER BY a.pub_date ${timeOrder === 'desc' ? 'DESC' : 'ASC'}
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    params.push(Number(pageSize), (Number(page) - 1) * Number(pageSize));

    const result = await sql.query(query, params);
    const total = result.rows[0]?.full_count ? parseInt(result.rows[0].full_count) : 0;

    res.status(200).json({
      articles: result.rows.map(row => ({
        ...row,
        full_count: undefined // 移除多余的计数字段
      })),
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