import { injectable } from 'inversify';
import { DataSource } from 'typeorm';
import { env } from './env';
import { Account } from '../entities/Account.entity';
import { User } from '../entities/User.entity';
import { MetricsSubscriber } from '../subscribers/metrics.subscriber';
import { container } from '../container/container';
import { TYPES } from '../container/identifiers';
import { MetricsService } from '../services/metrics.service';

@injectable()
export class DatabaseConfig {
  private dataSource: DataSource;
  private poolMonitorInterval?: NodeJS.Timeout;

  constructor() {
    this.dataSource = new DataSource({
      type: 'postgres',
      host: env.DB_HOST,
      port: env.DB_PORT,
      username: env.DB_USER,
      password: env.DB_PASSWORD,
      database: env.DB_NAME,
      synchronize: env.NODE_ENV === 'development',
      logging: env.NODE_ENV === 'development',
      entities: [Account, User],
      migrations: [],
      subscribers: [MetricsSubscriber],
    });
  }

  async initialize(): Promise<void> {
    await this.dataSource.initialize();

    // Start monitoring connection pool
    this.monitorConnectionPool();
  }

  private monitorConnectionPool(): void {
    this.poolMonitorInterval = setInterval(() => {
      try {
        const metricsService = container.get<MetricsService>(TYPES.IMetricsService);

        // Type assertion for PostgreSQL driver with connection pool
        interface PostgresDriver {
          master?: {
            pool?: {
              options?: { max?: number };
              totalCount?: number;
            };
          };
        }

        const driver = this.dataSource.driver as unknown as PostgresDriver;

        // Get connection pool information
        if (driver.master?.pool) {
          const pool = driver.master.pool;

          // Total pool size
          const poolSize = pool.options?.max ?? 10;
          metricsService.dbConnectionPoolSize.set(poolSize);

          // Active connections
          const activeConnections = pool.totalCount ?? 0;
          metricsService.dbConnectionPoolActive.set(activeConnections);
        }
      } catch (error) {
        // Silently fail if metrics service is not available
        console.warn('Failed to update connection pool metrics:', error);
      }
    }, 10000); // Update every 10 seconds
  }

  public async cleanup(): Promise<void> {
    if (this.poolMonitorInterval) {
      clearInterval(this.poolMonitorInterval);
      this.poolMonitorInterval = undefined;
    }

    if (this.dataSource.isInitialized) {
      await this.dataSource.destroy();
    }
  }

  getDataSource(): DataSource {
    return this.dataSource;
  }
}

// Keep legacy export for backward compatibility during migration
export const AppDataSource = new DatabaseConfig().getDataSource();
