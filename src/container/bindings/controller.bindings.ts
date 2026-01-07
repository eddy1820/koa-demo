import { Container } from 'inversify';
import { TYPES } from '../identifiers';
import { AuthController } from '../../controllers/auth.controller';
import { UserController } from '../../controllers/user.controller';

export function bindControllers(container: Container): void {
  container
    .bind<AuthController>(TYPES.AuthController)
    .to(AuthController)
    .inSingletonScope();

  container
    .bind<UserController>(TYPES.UserController)
    .to(UserController)
    .inSingletonScope();
}
