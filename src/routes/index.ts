import Router from '@koa/router';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';

const router = new Router({ prefix: '/api' });

router.use(authRoutes.routes(), authRoutes.allowedMethods());
router.use(userRoutes.routes(), userRoutes.allowedMethods());

export default router;
