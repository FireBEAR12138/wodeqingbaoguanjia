import type { NextApiRequest, NextApiResponse } from 'next';
import { fetchAndProcessRSS } from '../../services/rssFetcher';

export const config = {
  maxDuration: 60 // 设置最大执行时间为60秒（Hobby计划的最大值）
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    console.log('Starting manual RSS update...');
    
    // 使用 sourceId 参数来支持分批处理
    const sourceId = req.query.sourceId ? Number(req.query.sourceId) : undefined;
    
    await fetchAndProcessRSS(sourceId);
    
    console.log('RSS update completed');
    res.status(200).json({ message: 'RSS update completed successfully' });
  } catch (error) {
    console.error('Error updating RSS:', error);
    res.status(500).json({ error: 'Failed to update RSS feeds' });
  }
} 