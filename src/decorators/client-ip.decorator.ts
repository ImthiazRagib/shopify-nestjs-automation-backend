import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const ClientIp = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const xForwardedFor = request.headers['x-forwarded-for'];
    return (xForwardedFor?.split(',')[0] || request.socket.remoteAddress || '').trim();
  },
);
