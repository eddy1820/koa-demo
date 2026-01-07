import { injectable, inject } from 'inversify';
import { TYPES } from '../container/identifiers';
import { IUserRepository } from '../repositories/interfaces/IUserRepository';
import { IAccountRepository } from '../repositories/interfaces/IAccountRepository';
import { IUserService } from './interfaces/IUserService';
import { CreateUserInput, UpdateUserInput } from '../schemas/user.schema';

@injectable()
export class UserService implements IUserService {
  constructor(
    @inject(TYPES.IUserRepository) private userRepository: IUserRepository,
    @inject(TYPES.IAccountRepository) private accountRepository: IAccountRepository
  ) {}

  async createUser(data: CreateUserInput) {
    const account = await this.accountRepository.findById(data.accountId);
    if (!account) {
      throw new Error('Account not found');
    }

    const existingUserByAccount = await this.userRepository.findByAccountId(
      data.accountId
    );
    if (existingUserByAccount) {
      throw new Error('Account already has a user profile');
    }

    const existingUserByUsername = await this.userRepository.findByUsername(
      data.username
    );
    if (existingUserByUsername) {
      throw new Error('Username already exists');
    }

    const user = await this.userRepository.create(data);

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
      throw new Error('User not found');
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

  async updateUser(id: number, data: UpdateUserInput, requestingUserId: number) {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new Error('User not found');
    }

    if (user.accountId !== requestingUserId) {
      throw new Error('Unauthorized to update this user');
    }

    if (data.username && data.username !== user.username) {
      const existingUser = await this.userRepository.findByUsername(data.username);
      if (existingUser) {
        throw new Error('Username already exists');
      }
    }

    const updatedUser = await this.userRepository.update(id, data);
    if (!updatedUser) {
      throw new Error('Failed to update user');
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
