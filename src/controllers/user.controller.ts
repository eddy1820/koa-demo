import { injectable, inject } from 'inversify';
import { Context } from 'koa';
import { TYPES } from '../container/identifiers';
import { IUserService } from '../services/interfaces/IUserService';
import { success, error } from '../utils/response.util';
import { CreateUserInput, UpdateUserInput } from '../schemas/user.schema';

@injectable()
export class UserController {
  constructor(
    @inject(TYPES.IUserService) private userService: IUserService
  ) {}

  createUser = async (ctx: Context) => {
    try {
      const data = ctx.request.body as CreateUserInput;
      const result = await this.userService.createUser(data);
      success(ctx, result, 'User created successfully', 201);
    } catch (err: any) {
      if (err.message === 'Account not found') {
        error(ctx, err.message, 404);
      } else if (
        err.message === 'Username already exists' ||
        err.message === 'Account already has a user profile'
      ) {
        error(ctx, err.message, 409);
      } else {
        error(ctx, err.message, 500);
      }
    }
  };

  getUserById = async (ctx: Context) => {
    try {
      const id = parseInt(ctx.params.id, 10);

      if (isNaN(id)) {
        error(ctx, 'Invalid user ID', 400);
        return;
      }

      const result = await this.userService.getUserById(id);
      success(ctx, result, 'User retrieved successfully');
    } catch (err: any) {
      if (err.message === 'User not found') {
        error(ctx, err.message, 404);
      } else {
        error(ctx, err.message, 500);
      }
    }
  };

  getAllUsers = async (ctx: Context) => {
    try {
      const result = await this.userService.getAllUsers();
      success(ctx, result, 'Users retrieved successfully');
    } catch (err: any) {
      error(ctx, err.message, 500);
    }
  };

  updateUser = async (ctx: Context) => {
    try {
      const id = parseInt(ctx.params.id, 10);

      if (isNaN(id)) {
        error(ctx, 'Invalid user ID', 400);
        return;
      }

      const data = ctx.request.body as UpdateUserInput;
      const requestingUserId = ctx.state.user.id;

      const result = await this.userService.updateUser(id, data, requestingUserId);
      success(ctx, result, 'User updated successfully');
    } catch (err: any) {
      if (err.message === 'User not found') {
        error(ctx, err.message, 404);
      } else if (err.message === 'Unauthorized to update this user') {
        error(ctx, err.message, 403);
      } else if (err.message === 'Username already exists') {
        error(ctx, err.message, 409);
      } else {
        error(ctx, err.message, 500);
      }
    }
  };
}
