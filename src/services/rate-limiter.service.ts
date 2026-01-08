import { injectable } from 'inversify';
import { RateLimiterMemory, RateLimiterRes } from 'rate-limiter-flexible';
import { IRateLimiterService } from './interfaces/IRateLimiterService';
import { TooManyAttemptsError } from '../errors/AppError';

@injectable()
export class RateLimiterService implements IRateLimiterService {
  private rateLimiter: RateLimiterMemory;

  constructor() {
    this.rateLimiter = new RateLimiterMemory({
      points: 3, // 最多 3 次嘗試
      duration: 60 * 15, // 15 分鐘（900 秒）
      blockDuration: 60 * 15, // 鎖定 15 分鐘
    });
  }

  async consumeLoginAttempt(key: string): Promise<number> {
    try {
      const result = await this.rateLimiter.consume(key, 1);
      // result.remainingPoints 是剩餘次數
      return result.remainingPoints;
    } catch (rejRes) {
      // 當 remainingPoints < 0 時會拋出錯誤
      if (rejRes instanceof Error) {
        throw rejRes;
      }
      // rejRes 是 RateLimiterRes 物件
      if (rejRes instanceof RateLimiterRes || (rejRes && typeof rejRes === 'object')) {
        throw new TooManyAttemptsError();
      }
      throw rejRes;
    }
  }

  async resetLoginAttempts(key: string): Promise<void> {
    await this.rateLimiter.delete(key);
  }

  async isBlocked(key: string): Promise<boolean> {
    try {
      const result = await this.rateLimiter.get(key);
      if (!result) return false;
      return result.remainingPoints <= 0;
    } catch {
      return false;
    }
  }
}
