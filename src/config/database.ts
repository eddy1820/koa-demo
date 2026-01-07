import { injectable } from 'inversify';
import { DataSource } from 'typeorm';
import { env } from './env';
import { Account } from '../entities/Account.entity';
import { User } from '../entities/User.entity';

@injectable()
export class DatabaseConfig {
  private dataSource: DataSource;

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
      subscribers: [],
    });
  }

  async initialize(): Promise<void> {
    await this.dataSource.initialize();
  }

  getDataSource(): DataSource {
    return this.dataSource;
  }
}

// Keep legacy export for backward compatibility during migration
export const AppDataSource = new DatabaseConfig().getDataSource();
