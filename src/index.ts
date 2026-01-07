import 'reflect-metadata';
import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import cors from '@koa/cors';
import { DataSource } from 'typeorm';
import { container } from './container/container';
import { TYPES } from './container/identifiers';
import { env } from './config/env';
import { errorMiddleware } from './middlewares/error.middleware';
import router from './routes';

const app = new Koa();

app.use(errorMiddleware);
app.use(cors({ origin: env.CORS_ORIGIN }));
app.use(bodyParser());

app.use(router.routes());
app.use(router.allowedMethods());

app.use((ctx) => {
  ctx.body = { status: 'ok', message: 'Server is running' };
});

// Initialize DataSource from container
const dataSource = container.get<DataSource>(TYPES.DataSource);

dataSource
  .initialize()
  .then(() => {
    console.log('Database connected successfully');

    app.listen(env.PORT,  () => {
      console.log(`Server running on http://localhost:${env.PORT}`);
      console.log(`Environment: ${env.NODE_ENV}`);
    });
  })
  .catch((error) => {
    console.error('Database connection failed:', error);
    process.exit(1);
  });
