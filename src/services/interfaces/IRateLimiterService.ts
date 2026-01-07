export interface IRateLimiterService {
  /**
   * 檢查並記錄登入嘗試
   * @param key - 識別符（通常是 email）
   * @returns 剩餘嘗試次數
   * @throws 當超過限制時拋出錯誤
   */
  consumeLoginAttempt(key: string): Promise<number>;

  /**
   * 重置登入嘗試計數器
   * @param key - 識別符（通常是 email）
   */
  resetLoginAttempts(key: string): Promise<void>;

  /**
   * 檢查是否已被鎖定
   * @param key - 識別符
   * @returns 是否已鎖定
   */
  isBlocked(key: string): Promise<boolean>;
}
