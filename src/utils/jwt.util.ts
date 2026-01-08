import jwt from 'jsonwebtoken';
import { env } from '../config/env';

export interface JwtPayload {
  id: number;
  email: string;
}

export function generateToken(payload: JwtPayload): string {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
    algorithm: 'HS256',
  });
}
