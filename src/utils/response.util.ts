import { Context } from 'koa';

export function success(
  ctx: Context,
  data: any,
  message = 'Success',
  statusCode = 200
) {
  ctx.status = statusCode;
  ctx.body = {
    success: true,
    message,
    data,
  };
}

export function error(
  ctx: Context,
  message: string,
  statusCode = 400,
  errors?: any
) {
  ctx.status = statusCode;
  ctx.body = {
    success: false,
    message,
    ...(errors && { errors }),
  };
}
