import { Container } from 'inversify';
import { TYPES } from '../identifiers';
import { IAuthService } from '../../services/interfaces/IAuthService';
import { IUserService } from '../../services/interfaces/IUserService';
import { IRateLimiterService } from '../../services/interfaces/IRateLimiterService';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { RateLimiterService } from '../../services/rate-limiter.service';

export function bindServices(container: Container): void {
  container
    .bind<IAuthService>(TYPES.IAuthService)
    .to(AuthService)
    .inSingletonScope();

  container
    .bind<IUserService>(TYPES.IUserService)
    .to(UserService)
    .inSingletonScope();

  container
    .bind<IRateLimiterService>(TYPES.IRateLimiterService)
    .to(RateLimiterService)
    .inSingletonScope();
}
