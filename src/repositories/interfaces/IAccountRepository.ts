import { Account } from '../../entities/Account.entity';

export interface IAccountRepository {
  findByEmail(email: string): Promise<Account | null>;
  findById(id: number): Promise<Account | null>;
  create(email: string, hashedPassword: string): Promise<Account>;
}
