import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('3000').transform(Number),

  DB_HOST: z.string(),
  DB_PORT: z.string().transform(Number),
  DB_USER: z.string(),
  DB_PASSWORD: z.string(),
  DB_NAME: z.string(),

  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  JWT_EXPIRES_IN: z
    .string()
    .default('86400')
    .transform((val) => {
      // 如果是純數字字符串，轉換為數字
      const num = Number(val);
      if (!isNaN(num)) {
        return num;
      }
      // 否則保持字符串格式（如 "24h", "7d"）
      return val;
    }), // JWT expiration: number (seconds) or string ("24h", "7d")

  CORS_ORIGIN: z.string().default('*'),
});

export type Env = z.infer<typeof envSchema>;
export const env = envSchema.parse(process.env);
