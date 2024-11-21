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
    
    // 获取开始位置
    const startIndex = parseInt(req.query.startIndex as string) || 0;
    console.log(`Starting from index: ${startIndex}`);

    // 获取所有源
    const { rows: sources } = await sql`
      SELECT id, name, url 
      FROM rss_sources 
      ORDER BY id
    `;

    if (sources.length === 0) {
      console.log('No sources found');
      return res.status(200).json({ message: 'No sources found' });
    }

    if (startIndex >= sources.length) {
      console.log('All sources processed');
      return res.status(200).json({ message: 'All sources processed' });
    }

    console.log(`Found ${sources.length} total sources, processing source ${startIndex + 1} of ${sources.length}`);

    // 处理当前源
    const currentSource = sources[startIndex];
    console.log(`Processing source: ${currentSource.name} (${currentSource.url})`);
    await fetchAndProcessRSS(currentSource.id);

    // 如果还有其他源，触发下一个更新
    if (startIndex + 1 < sources.length) {
      try {
        const baseUrl = process.env.VERCEL_URL 
          ? `https://${process.env.VERCEL_URL}` 
          : 'http://localhost:3000';
        
        const nextIndex = startIndex + 1;
        console.log(`Triggering update for source ${nextIndex + 1} of ${sources.length}`);
        
        // 异步触发下一次更新，包含下一个索引
        fetch(`${baseUrl}/api/update-rss?startIndex=${nextIndex}`, {
          method: 'GET'
        }).catch(console.error);
      } catch (error) {
        console.error('Error triggering next update:', error);
      }
    } else {
      console.log('All sources have been processed');
    }

    console.log(`Completed updating source: ${currentSource.name}`);
    res.status(200).json({ 
      message: 'RSS update completed successfully',
      updatedSource: currentSource.name,
      currentIndex: startIndex,
      totalSources: sources.length,
      remainingSources: sources.length - (startIndex + 1)
    });
  } catch (error) {
    console.error('Error updating RSS:', error);
    res.status(500).json({ error: 'Failed to update RSS feeds' });
  }
} 