# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
# Install dependencies
npm install

# Development mode with auto-reload
npm run dev

# Build TypeScript to JavaScript
npm run build

# Run production build
npm start
```

## Architecture Overview

This is a Koa.js REST API with TypeScript, using TypeORM for PostgreSQL database interactions and JWT authentication.

### Two-Entity Authentication System

The application uses a **split authentication model** with two distinct entities:

- **Account** (`src/entities/Account.entity.ts`): Stores authentication credentials (email/password)
- **User** (`src/entities/User.entity.ts`): Stores user profile data (username, age, gender)
- **Relationship**: OneToOne relationship where User references Account via `accountId`

This separation means:
- Registration (`POST /api/auth/register`) creates only an Account, returns JWT token
- Users must create a separate User profile via `POST /api/users` (requires JWT authentication)
  - **accountId is automatically obtained from the JWT token** - users can only create profiles for their own account
- Users can update their profile via `PUT /api/users` (no id parameter needed)
  - System automatically identifies the user from JWT token
- All `/api/users` endpoints require JWT authentication via the `jwtMiddleware`

### Layer Structure

1. **Routes** (`src/routes/`): Define endpoints and apply middleware
   - `auth.routes.ts`: Public authentication endpoints (no JWT required)
   - `user.routes.ts`: Protected user endpoints (JWT required via middleware)
   - `metrics.routes.ts`: Metrics endpoint for Prometheus
   - Routes are prefixed with `/api` in `src/routes/index.ts`

2. **Controllers** (`src/controllers/`): Handle HTTP requests/responses
   - Use custom `AppError` classes for type-safe error handling
   - Errors are handled via `instanceof AppError` checks (not string matching)
   - Use utility functions from `src/utils/response.util.ts` for consistent responses

3. **Services** (`src/services/`): Business logic layer
   - All services use dependency injection via InversifyJS
   - Custom error classes (`src/errors/AppError.ts`) for structured error handling
   - Rate limiting service prevents brute-force login attempts (3 attempts per 15 minutes)

4. **Repositories** (`src/repositories/`): Database access layer using TypeORM DataSource
   - Type-safe with proper TypeScript interfaces
   - Use `CreateUserData` type (includes accountId from JWT)

5. **Middlewares** (`src/middlewares/`):
   - `error.middleware.ts`: Global error handler (applied first in middleware chain)
   - `jwt.middleware.ts`: JWT token verification (applied to entire `/api/users` router)
   - `validator.middleware.ts`: Zod schema validation factory function
   - `metrics.middleware.ts`: Collects HTTP request metrics for Prometheus

### Validation

Uses Zod schemas (`src/schemas/`) for request validation. Schemas are applied via the `validate()` middleware factory in routes.

### Environment Configuration

Environment variables are validated at startup using Zod schema in `src/config/env.ts`. The app will fail fast if required variables are missing or invalid. Copy `.env.example` to `.env` and configure:

- Database connection (PostgreSQL on port 5432)
- JWT secret (minimum 32 characters)
- Server port (default 3000)

### Database

TypeORM with PostgreSQL:
- `AppDataSource` in `src/config/database.ts` manages connection
- `synchronize: true` in development auto-syncs schema changes
- Database must be running before starting the server

## Monitoring

The application includes comprehensive monitoring with Prometheus and Grafana.

### Architecture

- **Prometheus** (port 9090): Metrics collection and storage
- **Grafana** (port 3001): Metrics visualization and dashboarding
- **Application**: Exposes `/metrics` endpoint for Prometheus scraping

### Collected Metrics

#### HTTP Metrics
- `koa_demo_http_requests_total` - Total HTTP requests by method, route, status code
- `koa_demo_http_request_duration_seconds` - HTTP request latency histogram
- `koa_demo_http_request_size_bytes` - HTTP request size histogram
- `koa_demo_http_response_size_bytes` - HTTP response size histogram

#### Database Metrics
- `koa_demo_db_queries_total` - Total database queries by type and entity
- `koa_demo_db_query_duration_seconds` - Database query duration histogram
- `koa_demo_db_connection_pool_size` - Connection pool size
- `koa_demo_db_connection_pool_active` - Active database connections

#### Business Metrics
- `koa_demo_user_registrations_total` - Total user registrations
- `koa_demo_user_logins_total` - Total successful logins
- `koa_demo_user_login_failures_total` - Total failed login attempts

#### System Metrics
- `koa_demo_event_loop_lag_seconds` - Node.js event loop lag
- Default Node.js metrics (CPU, memory, GC) provided by `prom-client`

### Quick Start

```bash
# Start all services including monitoring
npm run docker:dev

# Access monitoring tools
# Grafana: http://localhost:3001 (admin/admin)
# Prometheus: http://localhost:9090
# Metrics endpoint: http://localhost:3000/metrics
```

### Grafana Dashboards

Pre-configured dashboard: **Koa Demo Application Monitoring**
- HTTP request rate and latency
- Database query performance
- System resource usage (CPU, memory, event loop)
- Business KPIs (registrations, logins, failures)
- Auto-refresh: 10 seconds

### Adding Custom Metrics

To add custom metrics in your code:

1. Inject `MetricsService` into your service:
```typescript
constructor(
  @inject(TYPES.IMetricsService) private metricsService: MetricsService
) {}
```

2. Use metrics in your code:
```typescript
// Counter
this.metricsService.customCounter.inc({ label: 'value' });

// Gauge
this.metricsService.customGauge.set(42);

// Histogram
this.metricsService.customHistogram.observe({ label: 'value' }, duration);
```

See `src/services/metrics.service.ts` for available metrics and examples.

### Configuration Files

- `prometheus/prometheus.yml` - Prometheus configuration
- `grafana/provisioning/datasources/prometheus.yml` - Grafana data source
- `grafana/provisioning/dashboards/default.yml` - Dashboard provisioning
- `grafana/dashboards/koa-demo-dashboard.json` - Main dashboard definition

## Error Handling

### Custom Error Classes

The application uses a custom error system (`src/errors/AppError.ts`) for type-safe, structured error handling:

```typescript
// Base AppError class
class AppError extends Error {
  statusCode: number;    // HTTP status code
  code: string;          // Machine-readable error code
  isOperational: boolean; // Distinguishes operational errors from bugs
}
```

### Available Error Types

- **Authentication Errors**:
  - `AccountAlreadyExistsError` (409) - Duplicate account registration
  - `AccountLockedError` (429) - Account locked due to failed login attempts
  - `InvalidCredentialsError` (401) - Wrong email/password
  - `AccountNotFoundError` (404) - Account doesn't exist

- **User Profile Errors**:
  - `UserNotFoundError` (404) - User profile not found
  - `UserProfileNotFoundError` (404) - User must create profile first
  - `UsernameAlreadyExistsError` (409) - Username already taken
  - `UserProfileAlreadyExistsError` (409) - Account already has a profile

- **Validation Errors**:
  - `InvalidUserIdError` (400) - Invalid user ID format

- **Rate Limiting Errors**:
  - `TooManyAttemptsError` (429) - Too many failed login attempts

### Usage in Controllers

Controllers use `instanceof` checks for type-safe error handling:

```typescript
try {
  // Service call
} catch (err) {
  if (err instanceof AppError) {
    error(ctx, err.message, err.statusCode);
  } else if (err instanceof Error) {
    error(ctx, err.message, 500);
  } else {
    error(ctx, 'An unexpected error occurred', 500);
  }
}
```

## Security Features

### Rate Limiting

- **Login rate limiting**: Maximum 3 failed login attempts per 15 minutes
- **Account locking**: Accounts are temporarily locked after exceeding the limit
- **Implementation**: `RateLimiterService` using `rate-limiter-flexible` library
- **Storage**: In-memory (consider Redis for production/distributed systems)

### Password Security

- Passwords are hashed using bcrypt before storage
- Minimum requirements enforced via Zod validation
- Passwords never returned in API responses

### JWT Authentication

- Tokens generated with HS256 algorithm
- Token expiration configurable via environment variable
- Token validation handled by `koa-jwt` middleware

## Type Safety

### TypeScript Best Practices

- **No `any` types**: All code uses proper TypeScript types
- **Custom error classes**: Type-safe error handling with `instanceof` checks
- **Type interfaces**: Proper interfaces for TypeORM events, database drivers
- **Strict types**: Repository methods use `Partial<User>` instead of `any`

### Type Definitions

- `CreateUserInput`: User profile data from request body (no accountId)
- `CreateUserData`: Internal type with accountId for repository layer
- `UpdateUserInput`: Optional fields for profile updates
- `JwtPayload`: JWT token payload structure

## Application Lifecycle

### Graceful Shutdown

The application handles shutdown signals (`SIGTERM`, `SIGINT`) gracefully:

1. **HTTP Server**: Stops accepting new connections and waits for existing requests to complete
2. **Metrics Service**: Clears event loop monitoring intervals
3. **Database**: Closes connection pool and stops monitoring intervals
4. **Process Exit**: Exits with appropriate status code (0 for success, 1 for error)

Implementation in `src/index.ts`:

```typescript
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
```

### Resource Cleanup

- All `setInterval` calls are tracked and cleaned up on shutdown
- Database connection pools are properly closed
- No memory leaks from long-running processes

## Code Quality

### Dependency Injection

- Uses InversifyJS for dependency injection
- All services, repositories, and controllers are injectable
- Container configuration in `src/container/`
- Type symbols defined in `src/container/identifiers.ts`

### Clean Code Practices

- No unused code (removed unused methods and imports)
- Consistent error handling across all layers
- Type-safe with proper TypeScript usage
- Clear separation of concerns (Routes → Controllers → Services → Repositories)
