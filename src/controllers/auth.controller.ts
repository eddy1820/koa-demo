import { injectable, inject } from 'inversify';
import { Context } from 'koa';
import { TYPES } from '../container/identifiers';
import { IAuthService } from '../services/interfaces/IAuthService';
import { success, error } from '../utils/response.util';
import { RegisterInput, LoginInput } from '../schemas/auth.schema';
import { AppError } from '../errors/AppError';

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
    } catch (err) {
      if (err instanceof AppError) {
        error(ctx, err.message, err.statusCode);
      } else if (err instanceof Error) {
        error(ctx, err.message, 500);
      } else {
        error(ctx, 'An unexpected error occurred', 500);
      }
    }
  };

  login = async (ctx: Context) => {
    try {
      const { email, password } = ctx.request.body as LoginInput;
      const result = await this.authService.login(email, password);
      success(ctx, result, 'Login successful');
    } catch (err) {
      if (err instanceof AppError) {
        error(ctx, err.message, err.statusCode);
      } else if (err instanceof Error) {
        error(ctx, err.message, 500);
      } else {
        error(ctx, 'An unexpected error occurred', 500);
      }
    }
  };
}
