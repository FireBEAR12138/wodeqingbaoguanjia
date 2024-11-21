import type { NextApiRequest, NextApiResponse } from 'next';
import { fetchAndProcessRSS } from '../../services/rssFetcher';
import { sql } from '../../lib/db';

export const config = {
  maxDuration: 60
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    console.log('Starting RSS update...');
    console.log('Request method:', req.method);
    
    // 获取所有源
    const { rows: sources } = await sql`SELECT id FROM rss_sources ORDER BY id`;
    console.log(`Found ${sources.length} sources to update`);

    // 处理第一个源
    if (sources.length > 0) {
      const firstSource = sources[0];
      console.log(`Processing source ID: ${firstSource.id}`);
      await fetchAndProcessRSS(firstSource.id);

      // 如果还有其他源，触发下一个源的更新
      if (sources.length > 1) {
        const nextSourceId = sources[1].id;
        console.log(`Triggering update for next source: ${nextSourceId}`);
        
        // 使用 fetch 触发下一个源的更新
        try {
          const baseUrl = process.env.VERCEL_URL 
            ? `https://${process.env.VERCEL_URL}` 
            : 'http://localhost:3000';
          
          await fetch(`${baseUrl}/api/update-rss?sourceId=${nextSourceId}`, {
            method: 'GET'
          });
        } catch (error) {
          console.error('Error triggering next source update:', error);
        }
      }
    }

    console.log('Current batch completed');
    res.status(200).json({ message: 'RSS update batch completed successfully' });
  } catch (error) {
    console.error('Error updating RSS:', error);
    res.status(500).json({ error: 'Failed to update RSS feeds' });
  }
} 