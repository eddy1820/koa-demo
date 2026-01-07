import { injectable, inject } from 'inversify';
import { Context } from 'koa';
import { TYPES } from '../container/identifiers';
import { IAuthService } from '../services/interfaces/IAuthService';
import { success, error } from '../utils/response.util';
import { RegisterInput, LoginInput } from '../schemas/auth.schema';

@injectable()
export class AuthController {
  constructor(
    @inject(TYPES.IAuthService) private authService: IAuthService
  ) {}

  register = async (ctx: Context) => {
    try {
      const { email, password } = ctx.request.body as RegisterInput;
      const result = await this.authService.register(email, password);
      success(ctx, result, 'Registration successful', 201);
    } catch (err: any) {
      if (err.message === 'Account already exists') {
        error(ctx, err.message, 409);
      } else {
        error(ctx, err.message, 500);
      }
    }
  };

  login = async (ctx: Context) => {
    try {
      const { email, password } = ctx.request.body as LoginInput;
      const result = await this.authService.login(email, password);
      success(ctx, result, 'Login successful');
    } catch (err: any) {
      const message = err.message;

      // 1. 帳號已鎖定
      if (message.includes('Account is locked')) {
        error(ctx, message, 429); // 429 Too Many Requests
        return;
      }

      // 2. 密碼錯誤（帶剩餘次數）
      if (message.includes('Invalid credentials')) {
        error(ctx, message, 401); // 401 Unauthorized
        return;
      }

      // 3. 其他錯誤
      error(ctx, message, 500);
    }
  };
}
