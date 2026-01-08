import { User } from '../../entities/User.entity';
import { CreateUserData, UpdateUserInput } from '../../schemas/user.schema';

export interface IUserRepository {
  findAll(): Promise<User[]>;
  findById(id: number): Promise<User | null>;
  findByUsername(username: string): Promise<User | null>;
  findByAccountId(accountId: number): Promise<User | null>;
  create(data: CreateUserData): Promise<User>;
  update(id: number, data: UpdateUserInput): Promise<User | null>;
}
