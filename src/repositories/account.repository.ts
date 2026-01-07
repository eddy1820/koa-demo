import { injectable, inject } from 'inversify';
import { DataSource, Repository } from 'typeorm';
import { TYPES } from '../container/identifiers';
import { Account } from '../entities/Account.entity';
import { IAccountRepository } from './interfaces/IAccountRepository';

@injectable()
export class AccountRepository implements IAccountRepository {
  private repository: Repository<Account>;

  constructor(@inject(TYPES.DataSource) dataSource: DataSource) {
    this.repository = dataSource.getRepository(Account);
  }

  async findByEmail(email: string): Promise<Account | null> {
    return this.repository.findOne({ where: { email } });
  }

  async create(email: string, hashedPassword: string): Promise<Account> {
    const account = this.repository.create({
      email,
      password: hashedPassword,
    });
    return this.repository.save(account);
  }

  async findById(id: number): Promise<Account | null> {
    return this.repository.findOne({ where: { id } });
  }
}
