import { CreateUserInput, UpdateUserInput } from '../../schemas/user.schema';
import { Gender } from '../../entities/User.entity';

export interface IUserService {
  createUser(
    data: CreateUserInput,
    accountId: number
  ): Promise<{
    id: number;
    username: string;
    age: number;
    gender: Gender;
    accountId: number;
    createdAt: Date;
    updatedAt: Date;
  }>;

  getUserById(id: number): Promise<{
    id: number;
    username: string;
    age: number;
    gender: Gender;
    accountId: number;
    createdAt: Date;
    updatedAt: Date;
  }>;

  getAllUsers(): Promise<
    Array<{
      id: number;
      username: string;
      age: number;
      gender: Gender;
      accountId: number;
      createdAt: Date;
      updatedAt: Date;
    }>
  >;

  updateUser(
    data: UpdateUserInput,
    accountId: number
  ): Promise<{
    id: number;
    username: string;
    age: number;
    gender: Gender;
    accountId: number;
    createdAt: Date;
    updatedAt: Date;
  }>;
}
