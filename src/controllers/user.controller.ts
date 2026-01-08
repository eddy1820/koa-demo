import { injectable, inject } from 'inversify';
import { Context } from 'koa';
import { TYPES } from '../container/identifiers';
import { IUserService } from '../services/interfaces/IUserService';
import { success, error } from '../utils/response.util';
import { CreateUserInput, UpdateUserInput } from '../schemas/user.schema';
import { AppError, InvalidUserIdError } from '../errors/AppError';

@injectable()
export class UserController {
  constructor(
    @inject(TYPES.IUserService) private userService: IUserService
  ) {}

  createUser = async (ctx: Context) => {
    try {
      const accountId = ctx.state.user.id;
      const data = ctx.request.body as CreateUserInput;
      const result = await this.userService.createUser(data, accountId);
      success(ctx, result, 'User created successfully', 201);
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

  getUserById = async (ctx: Context) => {
    try {
      const id = parseInt(ctx.params.id, 10);

      if (isNaN(id)) {
        throw new InvalidUserIdError();
      }

      const result = await this.userService.getUserById(id);
      success(ctx, result, 'User retrieved successfully');
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

  getAllUsers = async (ctx: Context) => {
    try {
      const result = await this.userService.getAllUsers();
      success(ctx, result, 'Users retrieved successfully');
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

  updateUser = async (ctx: Context) => {
    try {
      const accountId = ctx.state.user.id;
      const data = ctx.request.body as UpdateUserInput;

      const result = await this.userService.updateUser(data, accountId);
      success(ctx, result, 'User updated successfully');
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
