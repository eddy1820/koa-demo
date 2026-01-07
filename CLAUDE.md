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

This is a Koa.js REST API with TypeScript, using TypeORM for MySQL database interactions and JWT authentication.

### Two-Entity Authentication System

The application uses a **split authentication model** with two distinct entities:

- **Account** (`src/entities/Account.entity.ts`): Stores authentication credentials (email/password)
- **User** (`src/entities/User.entity.ts`): Stores user profile data (username, age, gender)
- **Relationship**: OneToOne relationship where User references Account via `accountId`

This separation means:
- Registration (`POST /api/auth/register`) creates only an Account, returns JWT token
- Users must create a separate User profile via `POST /api/users` (requires JWT authentication)
- All `/api/users` endpoints require JWT authentication via the `jwtMiddleware`

### Layer Structure

1. **Routes** (`src/routes/`): Define endpoints and apply middleware
   - `auth.routes.ts`: Public authentication endpoints (no JWT required)
   - `user.routes.ts`: Protected user endpoints (JWT required via middleware)
   - Routes are prefixed with `/api` in `src/routes/index.ts`

2. **Controllers** (`src/controllers/`): Handle HTTP requests/responses using utility functions from `src/utils/response.util.ts`

3. **Services** (`src/services/`): Business logic layer

4. **Repositories** (`src/repositories/`): Database access layer using TypeORM DataSource

5. **Middlewares** (`src/middlewares/`):
   - `error.middleware.ts`: Global error handler (applied first in middleware chain)
   - `jwt.middleware.ts`: JWT token verification (applied to entire `/api/users` router)
   - `validator.middleware.ts`: Zod schema validation factory function

### Validation

Uses Zod schemas (`src/schemas/`) for request validation. Schemas are applied via the `validate()` middleware factory in routes.

### Environment Configuration

Environment variables are validated at startup using Zod schema in `src/config/env.ts`. The app will fail fast if required variables are missing or invalid. Copy `.env.example` to `.env` and configure:

- Database connection (MySQL on port 4350)
- JWT secret (minimum 32 characters)
- Server port (default 3000)

### Database

TypeORM with MySQL:
- `AppDataSource` in `src/config/database.ts` manages connection
- `synchronize: true` in development auto-syncs schema changes
- Database must be running before starting the server
