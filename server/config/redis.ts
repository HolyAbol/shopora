import { createClient } from 'redis';

const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
});

redisClient.on('error', (err) => {
  console.error('Redis Client Error:', err);
});
redisClient.on('ready', () => {
  console.log('Redis client is ready');
});

redisClient.on('end', () => {
  console.log('Redis connection closed');
});
await redisClient.connect();
export default redisClient;
