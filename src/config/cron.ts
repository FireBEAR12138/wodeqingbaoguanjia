import { CronJob } from 'cron';
import { fetchAndProcessRSS } from '../services/rssFetcher';

// 每小时执行一次
export const rssUpdateJob = new CronJob('0 * * * *', async () => {
    console.log('Starting RSS update job');
    await fetchAndProcessRSS();
    console.log('RSS update job completed');
}); 