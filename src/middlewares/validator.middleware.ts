import { Context, Next } from 'koa';
import { ZodSchema } from 'zod';

export function validate(schema: ZodSchema) {
  return async (ctx: Context, next: Next) => {
    try {
      const validated = schema.parse(ctx.request.body);
      ctx.request.body = validated;
      await next();
    } catch (error: any) {
      ctx.status = 400;
      ctx.body = {
        success: false,
        message: 'Validation failed',
        errors: error.errors,
      };
    }
  };
}
