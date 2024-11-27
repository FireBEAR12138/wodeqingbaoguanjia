import type { NextApiRequest, NextApiResponse } from 'next';
import { sql } from '../../lib/db';

// 处理搜索结果高亮的辅助函数
const highlightText = (text: string | null, searchQuery: string): string => {
  if (!text || !searchQuery) return text || '';
  const searchRegex = new RegExp(searchQuery, 'gi');
  return text.replace(searchRegex, (match: string) => `<mark>${match}</mark>`);
};

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
      sourceTypes,
      searchQuery
    } = req.query;

    // 构建基础查询条件
    const conditions = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (searchQuery) {
      conditions.push(`(
        a.title ILIKE $${paramIndex} OR 
        a.description ILIKE $${paramIndex} OR 
        a.ai_summary ILIKE $${paramIndex}
      )`);
      params.push(`%${searchQuery}%`);
      paramIndex++;
    }

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

    // 修改查询以支持搜索相关度排序
    const orderClause = searchQuery
      ? `
        CASE 
          WHEN a.title ILIKE $${paramIndex} THEN 1
          WHEN a.description ILIKE $${paramIndex} THEN 2
          WHEN a.ai_summary ILIKE $${paramIndex} THEN 3
          ELSE 4
        END,
        a.pub_date ${timeOrder === 'desc' ? 'DESC' : 'ASC'}
      `
      : `a.pub_date ${timeOrder === 'desc' ? 'DESC' : 'ASC'}`;

    if (searchQuery) {
      params.push(`%${searchQuery}%`);
      paramIndex++;
    }

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
      ORDER BY ${orderClause}
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    params.push(Number(pageSize), (Number(page) - 1) * Number(pageSize));

    const result = await sql.query(query, params);
    const total = result.rows[0]?.full_count ? parseInt(result.rows[0].full_count) : 0;

    // 处理搜索结果高亮
    const articles = result.rows.map(row => {
      let processedRow = { ...row };
      if (searchQuery) {
        processedRow.title = highlightText(row.title, searchQuery as string);
        processedRow.description = highlightText(row.description, searchQuery as string);
        processedRow.ai_summary = highlightText(row.ai_summary, searchQuery as string);
      }
      delete processedRow.full_count;
      return processedRow;
    });

    res.status(200).json({
      articles,
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