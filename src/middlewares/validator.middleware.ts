import { Context, Next } from 'koa';
import { ZodSchema, ZodError } from 'zod';

export function validate(schema: ZodSchema) {
  return async (ctx: Context, next: Next) => {
    try {
      const validated = schema.parse(ctx.request.body);
      ctx.request.body = validated;
      await next();
    } catch (error) {
      // 使用 instanceof 進行型別檢查，而不是 any
      if (error instanceof ZodError) {
        ctx.status = 400;
        ctx.body = {
          success: false,
          message: 'Validation failed',
          errors: error.issues,
        };
      } else {
        // 處理其他非預期的錯誤
        throw error;
      }
    }
  };
}
