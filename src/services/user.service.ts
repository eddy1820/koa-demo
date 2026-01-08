import { injectable, inject } from 'inversify';
import { TYPES } from '../container/identifiers';
import { IUserRepository } from '../repositories/interfaces/IUserRepository';
import { IAccountRepository } from '../repositories/interfaces/IAccountRepository';
import { IUserService } from './interfaces/IUserService';
import { CreateUserInput, UpdateUserInput } from '../schemas/user.schema';
import {
  AccountNotFoundError,
  UserNotFoundError,
  UserProfileNotFoundError,
  UsernameAlreadyExistsError,
  UserProfileAlreadyExistsError,
} from '../errors/AppError';

@injectable()
export class UserService implements IUserService {
  constructor(
    @inject(TYPES.IUserRepository) private userRepository: IUserRepository,
    @inject(TYPES.IAccountRepository) private accountRepository: IAccountRepository
  ) {}

  async createUser(data: CreateUserInput, accountId: number) {
    const account = await this.accountRepository.findById(accountId);
    if (!account) {
      throw new AccountNotFoundError();
    }

    const existingUserByAccount = await this.userRepository.findByAccountId(
      accountId
    );
    if (existingUserByAccount) {
      throw new UserProfileAlreadyExistsError();
    }

    const existingUserByUsername = await this.userRepository.findByUsername(
      data.username
    );
    if (existingUserByUsername) {
      throw new UsernameAlreadyExistsError();
    }

    const user = await this.userRepository.create({
      ...data,
      accountId,
    });

    return {
      id: user.id,
      username: user.username,
      age: user.age,
      gender: user.gender,
      accountId: user.accountId,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  async getUserById(id: number) {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new UserNotFoundError();
    }

    return {
      id: user.id,
      username: user.username,
      age: user.age,
      gender: user.gender,
      accountId: user.accountId,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  async getAllUsers() {
    const users = await this.userRepository.findAll();

    return users.map((user) => ({
      id: user.id,
      username: user.username,
      age: user.age,
      gender: user.gender,
      accountId: user.accountId,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }));
  }

  async updateUser(data: UpdateUserInput, accountId: number) {
    const user = await this.userRepository.findByAccountId(accountId);
    if (!user) {
      throw new UserProfileNotFoundError();
    }

    if (data.username && data.username !== user.username) {
      const existingUser = await this.userRepository.findByUsername(data.username);
      if (existingUser) {
        throw new UsernameAlreadyExistsError();
      }
    }

    const updatedUser = await this.userRepository.update(user.id, data);
    if (!updatedUser) {
      throw new UserNotFoundError('Failed to update user');
    }

    return {
      id: updatedUser.id,
      username: updatedUser.username,
      age: updatedUser.age,
      gender: updatedUser.gender,
      accountId: updatedUser.accountId,
      createdAt: updatedUser.createdAt,
      updatedAt: updatedUser.updatedAt,
    };
  }
}
