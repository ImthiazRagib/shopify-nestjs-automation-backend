import { Test, TestingModule } from '@nestjs/testing';
import { ShopifyStorefrontService } from './shopify-storefront.service';

describe('ShopifyStorefrontService', () => {
  let service: ShopifyStorefrontService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ShopifyStorefrontService],
    }).compile();

    service = module.get<ShopifyStorefrontService>(ShopifyStorefrontService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
