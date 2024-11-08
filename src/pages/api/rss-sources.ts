import type { NextApiRequest, NextApiResponse } from 'next';
import { sql } from '../../lib/db';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    switch (req.method) {
      case 'GET':
        const { rows } = await sql`
          SELECT * FROM rss_sources 
          ORDER BY category, name
        `;
        return res.status(200).json(rows);

      case 'POST':
        const { category, name, source_type, url } = req.body;
        const result = await sql`
          INSERT INTO rss_sources (category, name, source_type, url)
          VALUES (${category}, ${name}, ${source_type}, ${url})
          RETURNING *
        `;
        return res.status(201).json(result.rows[0]);

      case 'PUT':
        const { id, ...updateData } = req.body;
        const updated = await sql`
          UPDATE rss_sources
          SET 
            category = ${updateData.category},
            name = ${updateData.name},
            source_type = ${updateData.source_type},
            url = ${updateData.url}
          WHERE id = ${id}
          RETURNING *
        `;
        return res.status(200).json(updated.rows[0]);

      case 'DELETE':
        const { id: deleteId } = req.query;
        await sql`
          DELETE FROM rss_sources WHERE id = ${deleteId}
        `;
        return res.status(204).end();

      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('RSS sources API error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
} 