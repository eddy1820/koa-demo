import { injectable, inject } from 'inversify';
import { TYPES } from '../container/identifiers';
import { IAccountRepository } from '../repositories/interfaces/IAccountRepository';
import { IRateLimiterService } from './interfaces/IRateLimiterService';
import { IAuthService } from './interfaces/IAuthService';
import { MetricsService } from './metrics.service';
import { hashPassword, comparePassword } from '../utils/password.util';
import { generateToken } from '../utils/jwt.util';
import {
  AccountAlreadyExistsError,
  AccountLockedError,
  InvalidCredentialsError,
  TooManyAttemptsError,
} from '../errors/AppError';

@injectable()
export class AuthService implements IAuthService {
  constructor(
    @inject(TYPES.IAccountRepository) private accountRepository: IAccountRepository,
    @inject(TYPES.IRateLimiterService) private rateLimiter: IRateLimiterService,
    @inject(TYPES.IMetricsService) private metricsService: MetricsService
  ) {}

  async register(email: string, password: string) {
    const existing = await this.accountRepository.findByEmail(email);
    if (existing) {
      // Track duplicate registration attempt
      this.metricsService.userRegistrationTotal.inc({ status: 'duplicate' });
      throw new AccountAlreadyExistsError();
    }

    const hashedPassword = await hashPassword(password);
    const account = await this.accountRepository.create(email, hashedPassword);
    const token = generateToken({ id: account.id, email: account.email });

    // Track successful registration
    this.metricsService.userRegistrationTotal.inc({ status: 'success' });

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
      // Track account locked failure
      this.metricsService.userLoginFailedTotal.inc({ reason: 'account_locked' });
      throw new AccountLockedError();
    }

    // 2. 查找帳號
    const account = await this.accountRepository.findByEmail(email);
    if (!account) {
      // Email 不存在也要記錄失敗（防止用戶枚舉）
      try {
        const remaining = await this.rateLimiter.consumeLoginAttempt(email);
        // Track invalid credentials failure
        this.metricsService.userLoginFailedTotal.inc({ reason: 'invalid_credentials' });
        throw new InvalidCredentialsError(remaining);
      } catch (error) {
        if (error instanceof TooManyAttemptsError) {
          this.metricsService.userLoginFailedTotal.inc({ reason: 'account_locked' });
          throw new AccountLockedError();
        }
        throw error;
      }
    }

    // 3. 驗證密碼
    const isValid = await comparePassword(password, account.password);
    if (!isValid) {
      // 密碼錯誤，記錄失敗次數
      try {
        const remaining = await this.rateLimiter.consumeLoginAttempt(email);
        // Track invalid credentials failure
        this.metricsService.userLoginFailedTotal.inc({ reason: 'invalid_credentials' });
        throw new InvalidCredentialsError(remaining);
      } catch (error) {
        // 如果是 rate limiter 拋出的 TooManyAttemptsError（已鎖定）
        if (error instanceof TooManyAttemptsError) {
          this.metricsService.userLoginFailedTotal.inc({ reason: 'account_locked' });
          throw new AccountLockedError();
        }
        // 如果是 InvalidCredentialsError，直接拋出
        throw error;
      }
    }

    // 4. 密碼正確，重置失敗計數器並生成 token
    await this.rateLimiter.resetLoginAttempts(email);
    const token = generateToken({ id: account.id, email: account.email });

    // Track successful login
    this.metricsService.userLoginTotal.inc();

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
