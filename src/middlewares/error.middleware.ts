import { Context, Next } from 'koa';
import { isKoaJwtError } from '../types/errors';

export async function errorMiddleware(ctx: Context, next: Next) {
  try {
    await next();
  } catch (error) {
    console.error('Error:', error);

    // Handle JWT authentication errors
    if (isKoaJwtError(error) && error.status === 401) {
      ctx.status = 401;
      ctx.body = {
        success: false,
        message: getJwtErrorMessage(error),
      };
      return;
    }

    // Handle other errors
    const status = isKoaJwtError(error) ? error.status : 500;
    const message = error instanceof Error ? error.message : 'Internal server error';

    ctx.status = status;
    ctx.body = {
      success: false,
      message,
      ...(process.env.NODE_ENV === 'development' &&
        error instanceof Error && { stack: error.stack }),
    };
  }
}

function getJwtErrorMessage(error: unknown): string {
  if (!isKoaJwtError(error)) {
    return 'Invalid or expired token';
  }

  const originalError = error.originalError;

  if (!originalError) {
    return 'Invalid or expired token';
  }

  switch (originalError.name) {
    case 'TokenExpiredError':
      return 'Token has expired';
    case 'JsonWebTokenError':
      return 'Invalid token';
    case 'NotBeforeError':
      return 'Token not active yet';
    default:
      return 'Invalid or expired token';
  }
}
