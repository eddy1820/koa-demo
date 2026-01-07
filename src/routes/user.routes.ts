import Router from '@koa/router';
import jwt from 'koa-jwt';
import { container } from '../container/container';
import { TYPES } from '../container/identifiers';
import { UserController } from '../controllers/user.controller';
import { validate } from '../middlewares/validator.middleware';
import { createUserSchema, updateUserSchema } from '../schemas/user.schema';
import { env } from '../config/env';

const router = new Router({ prefix: '/users' });
const userController = container.get<UserController>(TYPES.UserController);

router.use(jwt({
  secret: env.JWT_SECRET,
  algorithms: ['HS256']
}));

router.post('/', validate(createUserSchema), userController.createUser);
router.get('/', userController.getAllUsers);
router.get('/:id', userController.getUserById);
router.put('/:id', validate(updateUserSchema), userController.updateUser);

export default router;
