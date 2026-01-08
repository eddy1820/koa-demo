import 'reflect-metadata';
import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import cors from '@koa/cors';
import { Server } from 'http';
import { container } from './container/container';
import { TYPES } from './container/identifiers';
import { env } from './config/env';
import { errorMiddleware } from './middlewares/error.middleware';
import { createMetricsMiddleware } from './middlewares/metrics.middleware';
import { MetricsService } from './services/metrics.service';
import { DatabaseConfig } from './config/database';
import router from './routes';
import metricsRouter from './routes/metrics.routes';

const app = new Koa();

// Get services from container
const metricsService = container.get<MetricsService>(TYPES.IMetricsService);
const databaseConfig = container.get<DatabaseConfig>(TYPES.DatabaseConfig);

app.use(errorMiddleware);
app.use(createMetricsMiddleware(metricsService));
app.use(cors({ origin: env.CORS_ORIGIN }));
app.use(bodyParser());

// Mount metrics router first (no JWT auth required)
app.use(metricsRouter.routes());
app.use(metricsRouter.allowedMethods());

// Mount API routes (with JWT auth)
app.use(router.routes());
app.use(router.allowedMethods());

app.use((ctx) => {
  ctx.body = { status: 'ok', message: 'Server is running' };
});

let server: Server;

// Graceful shutdown function
async function gracefulShutdown(signal: string): Promise<void> {
  console.log(`\n${signal} received. Starting graceful shutdown...`);

  try {
    // Close HTTP server (stop accepting new connections)
    if (server) {
      await new Promise<void>((resolve, reject) => {
        server.close((err) => {
          if (err) {
            console.error('Error closing HTTP server:', err);
            reject(err);
          } else {
            console.log('HTTP server closed');
            resolve();
          }
        });
      });
    }

    // Cleanup metrics service (clear intervals)
    console.log('Cleaning up metrics service...');
    metricsService.cleanup();

    // Cleanup database (clear intervals and close connection)
    console.log('Cleaning up database connection...');
    await databaseConfig.cleanup();

    console.log('Graceful shutdown completed');
    process.exit(0);
  } catch (error) {
    console.error('Error during graceful shutdown:', error);
    process.exit(1);
  }
}

// Register shutdown handlers
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Initialize DataSource and start server
databaseConfig
  .initialize()
  .then(() => {
    console.log('Database connected successfully');

    server = app.listen(env.PORT, () => {
      console.log(`Server running on http://localhost:${env.PORT}`);
      console.log(`Environment: ${env.NODE_ENV}`);
    });
  })
  .catch((error) => {
    console.error('Database connection failed:', error);
    process.exit(1);
  });
