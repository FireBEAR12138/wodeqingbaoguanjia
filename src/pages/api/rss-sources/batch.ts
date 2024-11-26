import type { NextApiRequest, NextApiResponse } from 'next';
import { sql } from '../../../lib/db';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const { sources } = req.body;

    // 批量插入
    for (const source of sources) {
      await sql`
        INSERT INTO rss_sources (category, name, source_type, url)
        VALUES (${source.category}, ${source.name}, ${source.source_type}, ${source.url})
      `;
    }

    res.status(200).json({ message: 'Sources imported successfully' });
  } catch (error) {
    console.error('Error importing sources:', error);
    res.status(500).json({ error: 'Failed to import sources' });
  }
} 