import type { NextApiRequest, NextApiResponse } from 'next';
import { fetchAndProcessRSS } from '../../services/rssFetcher';

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
    console.log('Request query:', req.query);
    
    const sourceId = req.query.sourceId ? Number(req.query.sourceId) : undefined;
    
    const result = await fetchAndProcessRSS(sourceId);
    
    console.log('RSS update completed:', result);
    res.status(200).json({ 
      message: 'RSS update completed successfully',
      ...result
    });
  } catch (error) {
    console.error('Error updating RSS:', error);
    res.status(500).json({ 
      error: 'Failed to update RSS feeds',
      details: error instanceof Error ? error.message : String(error)
    });
  }
} 