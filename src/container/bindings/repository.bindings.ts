import { Container } from 'inversify';
import { TYPES } from '../identifiers';
import { IAccountRepository } from '../../repositories/interfaces/IAccountRepository';
import { IUserRepository } from '../../repositories/interfaces/IUserRepository';
import { AccountRepository } from '../../repositories/account.repository';
import { UserRepository } from '../../repositories/user.repository';

export function bindRepositories(container: Container): void {
  container
    .bind<IAccountRepository>(TYPES.IAccountRepository)
    .to(AccountRepository)
    .inSingletonScope();

  container
    .bind<IUserRepository>(TYPES.IUserRepository)
    .to(UserRepository)
    .inSingletonScope();
}
