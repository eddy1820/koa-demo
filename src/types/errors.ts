/**
 * Custom error type definitions for middleware error handling
 */

/**
 * Error thrown by koa-jwt middleware when JWT verification fails
 */
export interface KoaJwtError extends Error {
  status: number;
  originalError?: Error;
}

/**
 * Type guard to check if an error is a Koa JWT error
 */
export function isKoaJwtError(error: unknown): error is KoaJwtError {
  return (
    error instanceof Error &&
    'status' in error &&
    typeof (error as KoaJwtError).status === 'number'
  );
}

/**
 * Validation error thrown by Zod
 */
export interface ZodValidationError extends Error {
  errors: Array<{
    path: (string | number)[];
    message: string;
  }>;
}

/**
 * Type guard to check if an error is a Zod validation error
 */
export function isZodValidationError(error: unknown): error is ZodValidationError {
  return (
    error instanceof Error &&
    'errors' in error &&
    Array.isArray((error as ZodValidationError).errors)
  );
}
