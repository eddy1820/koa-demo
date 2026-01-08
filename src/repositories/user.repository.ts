import { injectable, inject } from 'inversify';
import { DataSource, Repository } from 'typeorm';
import { TYPES } from '../container/identifiers';
import { User, Gender } from '../entities/User.entity';
import { CreateUserData, UpdateUserInput } from '../schemas/user.schema';
import { IUserRepository } from './interfaces/IUserRepository';

@injectable()
export class UserRepository implements IUserRepository {
  private repository: Repository<User>;

  constructor(@inject(TYPES.DataSource) dataSource: DataSource) {
    this.repository = dataSource.getRepository(User);
  }

  async findAll(): Promise<User[]> {
    return this.repository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findById(id: number): Promise<User | null> {
    return this.repository.findOne({ where: { id } });
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.repository.findOne({ where: { username } });
  }

  async findByAccountId(accountId: number): Promise<User | null> {
    return this.repository.findOne({ where: { accountId } });
  }

  async create(data: CreateUserData): Promise<User> {
    const user = this.repository.create({
      username: data.username,
      age: data.age,
      gender: data.gender as Gender,
      accountId: data.accountId,
    });
    return this.repository.save(user);
  }

  async update(id: number, data: UpdateUserInput): Promise<User | null> {
    const updateData: Partial<User> = {};
    if (data.username !== undefined) updateData.username = data.username;
    if (data.age !== undefined) updateData.age = data.age;
    if (data.gender !== undefined) updateData.gender = data.gender as Gender;

    if (Object.keys(updateData).length > 0) {
      await this.repository.update(id, updateData);
    }
    return this.findById(id);
  }
}
