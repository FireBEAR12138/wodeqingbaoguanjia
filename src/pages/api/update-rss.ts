import type { NextApiRequest, NextApiResponse } from 'next';
import { fetchAndProcessRSS } from '../../services/rssFetcher';

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
    await fetchAndProcessRSS();
    console.log('RSS update completed');
    res.status(200).json({ message: 'RSS update completed successfully' });
  } catch (error) {
    console.error('Error updating RSS:', error);
    res.status(500).json({ error: 'Failed to update RSS feeds' });
  }
} 