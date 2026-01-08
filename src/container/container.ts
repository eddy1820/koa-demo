import { Container } from 'inversify';
import { DataSource } from 'typeorm';
import { TYPES } from './identifiers';
import { bindRepositories } from './bindings/repository.bindings';
import { bindServices } from './bindings/service.bindings';
import { bindControllers } from './bindings/controller.bindings';
import { DatabaseConfig } from '../config/database';

const container = new Container();

// Create singleton DatabaseConfig instance
const databaseConfig = new DatabaseConfig();

// Bind DatabaseConfig as singleton
container
  .bind<DatabaseConfig>(TYPES.DatabaseConfig)
  .toConstantValue(databaseConfig);

// Bind DataSource from the singleton DatabaseConfig
container
  .bind<DataSource>(TYPES.DataSource)
  .toDynamicValue(() => databaseConfig.getDataSource())
  .inSingletonScope();

// Bind all layers
bindRepositories(container);
bindServices(container);
bindControllers(container);

export { container };
