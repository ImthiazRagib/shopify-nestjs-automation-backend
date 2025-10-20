import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const ShopifyStore = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.shopifyStore; // 👈 this is set by your ShopifyAccessGuard
  },
);
