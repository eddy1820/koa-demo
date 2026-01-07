import { Context, Next } from 'koa';

export async function errorMiddleware(ctx: Context, next: Next) {
  try {
    await next();
  } catch (error: any) {
    console.error('Error:', error);

    // Handle JWT authentication errors
    if (error.status === 401) {
      ctx.status = 401;
      ctx.body = {
        success: false,
        message: getJwtErrorMessage(error),
      };
      return;
    }

    ctx.status = error.status || 500;
    ctx.body = {
      success: false,
      message: error.message || 'Internal server error',
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
    };
  }
}

function getJwtErrorMessage(error: any): string {
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
