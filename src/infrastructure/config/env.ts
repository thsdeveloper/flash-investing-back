import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3001),
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default('7d'),
  JWT_REFRESH_SECRET: z.string().min(32),
  JWT_REFRESH_EXPIRES_IN: z.string().default('30d'),
  BCRYPT_ROUNDS: z.coerce.number().default(10),
  PLUGGY_CLIENT_ID: z.string().min(1),
  PLUGGY_CLIENT_SECRET: z.string().min(1),
  PLUGGY_BASE_URL: z.string().url().default('https://api.pluggy.ai'),
});

export const env = envSchema.parse(process.env);