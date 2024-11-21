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
    
    // 获取所有源，不再使用 LIMIT 1
    const { rows: sources } = await sql`
      SELECT id, name, url 
      FROM rss_sources 
      ORDER BY id
    `;

    if (sources.length === 0) {
      console.log('No sources found');
      return res.status(200).json({ message: 'No sources found' });
    }

    console.log(`Found ${sources.length} sources to process`);

    // 处理第一个源
    const currentSource = sources[0];
    console.log(`Processing source: ${currentSource.name} (${currentSource.url})`);
    await fetchAndProcessRSS(currentSource.id);

    // 如果还有其他源，触发下一个更新
    if (sources.length > 1) {
      try {
        const baseUrl = process.env.VERCEL_URL 
          ? `https://${process.env.VERCEL_URL}` 
          : 'http://localhost:3000';
        
        console.log(`Triggering update for remaining ${sources.length - 1} sources`);
        
        // 异步触发下一次更新，不等待响应
        fetch(`${baseUrl}/api/update-rss`, {
          method: 'GET'
        }).catch(console.error);
      } catch (error) {
        console.error('Error triggering next update:', error);
      }
    }

    console.log(`Completed updating source: ${currentSource.name}`);
    res.status(200).json({ 
      message: 'RSS update completed successfully',
      updatedSource: currentSource.name,
      remainingSources: sources.length - 1
    });
  } catch (error) {
    console.error('Error updating RSS:', error);
    res.status(500).json({ error: 'Failed to update RSS feeds' });
  }
} 