import { rateLimit } from 'express-rate-limit';
import { RedisStore } from 'rate-limit-redis';
import redisClient from './redis.ts';

const makeStore = (prefix: string) =>
  new RedisStore({
    sendCommand: (...args: string[]) => redisClient.sendCommand(args),
    prefix,
  });

export function createGeneralRateLimit() {
  return rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 100,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    store: makeStore('rl:general:'),
    passOnStoreError: true,
    message: {
      message: 'Too many requests. Please try again later.',
    },
  });
}

export function createLoginRateLimit() {
  return rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 5,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    store: makeStore('rl:login:'),
    passOnStoreError: true,
    message: {
      message: 'Too many login attempts. Please try again later.',
    },
  });
}

export const adminReadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 1000,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  store: makeStore('rl:admin-read:'),
  passOnStoreError: true,
  keyGenerator: (req) => String(req.user?.userId),
  message: { error: 'Too many requests, please try again later' },
});

export const adminWriteLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  store: makeStore('rl:admin-write:'),
  passOnStoreError: true,
  keyGenerator: (req) => String(req.user?.userId),
  message: { error: 'Too many requests, please try again later' },
});
