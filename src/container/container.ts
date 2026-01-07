import { Container } from 'inversify';
import { DataSource } from 'typeorm';
import { TYPES } from './identifiers';
import { bindRepositories } from './bindings/repository.bindings';
import { bindServices } from './bindings/service.bindings';
import { bindControllers } from './bindings/controller.bindings';
import { DatabaseConfig } from '../config/database';

const container = new Container();

// Bind DataSource
container
  .bind<DataSource>(TYPES.DataSource)
  .toDynamicValue(() => {
    const dbConfig = new DatabaseConfig();
    return dbConfig.getDataSource();
  })
  .inSingletonScope();

// Bind all layers
bindRepositories(container);
bindServices(container);
bindControllers(container);

export { container };
