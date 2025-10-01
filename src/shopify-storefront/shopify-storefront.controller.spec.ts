import { Test, TestingModule } from '@nestjs/testing';
import { ShopifyStorefrontController } from './shopify-storefront.v1.controller';

describe('ShopifyStorefrontController', () => {
  let controller: ShopifyStorefrontController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ShopifyStorefrontController],
    }).compile();

    controller = module.get<ShopifyStorefrontController>(ShopifyStorefrontController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
