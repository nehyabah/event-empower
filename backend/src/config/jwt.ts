import { env } from './env.js';

export const jwtConfig = {
  accessToken: {
    secret: env.ACCESS_TOKEN_SECRET,
    expiresIn: '15m',
  },
  refreshToken: {
    secret: env.REFRESH_TOKEN_SECRET,
    expiresIn: '7d',
  },
  cookie: {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: env.NODE_ENV === 'production' ? 'strict' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/',
  },
} as const;
