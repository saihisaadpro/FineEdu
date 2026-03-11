import rateLimit from 'express-rate-limit';

/** Global API rate limiter — 200 requests per 15 minutes per IP */
export const globalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests — please try again later' },
});
