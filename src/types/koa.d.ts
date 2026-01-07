import { JwtPayload } from '../utils/jwt.util';

declare module 'koa' {
  interface DefaultState {
    user: JwtPayload;
  }
}
