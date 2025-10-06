import { Test, TestingModule } from '@nestjs/testing';
import { ShopifyOAuthController } from './shopify-o-auth.controller';

describe('ShopifyOAuthController', () => {
  let controller: ShopifyOAuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ShopifyOAuthController],
    }).compile();

    controller = module.get<ShopifyOAuthController>(ShopifyOAuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
