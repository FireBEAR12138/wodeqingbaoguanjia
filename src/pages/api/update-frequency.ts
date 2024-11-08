import type { NextApiRequest, NextApiResponse } from 'next';
import { sql } from '../../lib/db';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const { frequency } = req.body;
    
    // 更新环境变量中的更新频率
    await sql`
      INSERT INTO system_settings (key, value)
      VALUES ('rss_update_frequency', ${frequency})
      ON CONFLICT (key) 
      DO UPDATE SET value = ${frequency}
    `;

    return res.status(200).json({ message: 'Update frequency saved' });
  } catch (error) {
    console.error('Update frequency API error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
} 