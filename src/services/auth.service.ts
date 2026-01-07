import { injectable, inject } from 'inversify';
import { TYPES } from '../container/identifiers';
import { IAccountRepository } from '../repositories/interfaces/IAccountRepository';
import { IRateLimiterService } from './interfaces/IRateLimiterService';
import { IAuthService } from './interfaces/IAuthService';
import { hashPassword, comparePassword } from '../utils/password.util';
import { generateToken } from '../utils/jwt.util';

@injectable()
export class AuthService implements IAuthService {
  constructor(
    @inject(TYPES.IAccountRepository) private accountRepository: IAccountRepository,
    @inject(TYPES.IRateLimiterService) private rateLimiter: IRateLimiterService
  ) {}

  async register(email: string, password: string) {
    const existing = await this.accountRepository.findByEmail(email);
    if (existing) {
      throw new Error('Account already exists');
    }

    const hashedPassword = await hashPassword(password);
    const account = await this.accountRepository.create(email, hashedPassword);
    const token = generateToken({ id: account.id, email: account.email });

    return {
      user: {
        id: account.id,
        email: account.email,
        createdAt: account.createdAt,
      },
      token,
    };
  }

  async login(email: string, password: string) {
    // 1. 先檢查是否已被鎖定
    const isBlocked = await this.rateLimiter.isBlocked(email);
    if (isBlocked) {
      throw new Error(
        'Account is locked due to too many failed login attempts. Please try again after 15 minutes.'
      );
    }

    // 2. 查找帳號
    const account = await this.accountRepository.findByEmail(email);
    if (!account) {
      // Email 不存在也要記錄失敗（防止用戶枚舉）
      const remaining = await this.rateLimiter.consumeLoginAttempt(email);
      throw new Error(`Invalid credentials. ${remaining} attempts remaining.`);
    }

    // 3. 驗證密碼
    const isValid = await comparePassword(password, account.password);
    if (!isValid) {
      // 密碼錯誤，記錄失敗次數
      try {
        const remaining = await this.rateLimiter.consumeLoginAttempt(email);
        throw new Error(
          `Invalid credentials. ${remaining} attempts remaining.`
        );
      } catch (err: any) {
        // 如果是 rate limiter 拋出的錯誤（已鎖定）
        if (err.message.includes('too many failed login attempts')) {
          throw err;
        }
        // 否則拋出帶剩餘次數的錯誤
        throw new Error(
          `Invalid credentials. 0 attempts remaining. Account locked.`
        );
      }
    }

    // 4. 密碼正確，重置失敗計數器並生成 token
    await this.rateLimiter.resetLoginAttempts(email);
    const token = generateToken({ id: account.id, email: account.email });

    return {
      user: {
        id: account.id,
        email: account.email,
        createdAt: account.createdAt,
      },
      token,
    };
  }
}
