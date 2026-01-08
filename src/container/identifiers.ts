export const TYPES = {
  // Infrastructure
  DataSource: Symbol.for('DataSource'),
  DatabaseConfig: Symbol.for('DatabaseConfig'),

  // Repository Interfaces
  IAccountRepository: Symbol.for('IAccountRepository'),
  IUserRepository: Symbol.for('IUserRepository'),

  // Service Interfaces
  IAuthService: Symbol.for('IAuthService'),
  IUserService: Symbol.for('IUserService'),
  IRateLimiterService: Symbol.for('IRateLimiterService'),
  IMetricsService: Symbol.for('IMetricsService'),

  // Controllers
  AuthController: Symbol.for('AuthController'),
  UserController: Symbol.for('UserController'),
};
