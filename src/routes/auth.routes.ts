import Router from '@koa/router';
import { container } from '../container/container';
import { TYPES } from '../container/identifiers';
import { AuthController } from '../controllers/auth.controller';
import { validate } from '../middlewares/validator.middleware';
import { registerSchema, loginSchema } from '../schemas/auth.schema';

const router = new Router({ prefix: '/auth' });
const authController = container.get<AuthController>(TYPES.AuthController);

router.post('/register', validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);

export default router;
