import { rssUpdateJob } from './config/cron';
import express from 'express';

const app = express();

// 启动定时任务
rssUpdateJob.start();

// API路由用于 Vercel Cron
app.post('/api/update-rss', async (req, res) => {
  try {
    await rssUpdateJob.fireOnTick();
    res.status(200).json({ message: 'RSS update completed' });
  } catch (error) {
    console.error('Error updating RSS:', error);
    res.status(500).json({ error: 'Failed to update RSS' });
  }
});

export default app; 