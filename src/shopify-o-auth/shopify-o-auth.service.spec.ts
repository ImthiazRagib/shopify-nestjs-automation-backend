import { Test, TestingModule } from '@nestjs/testing';
import { ShopifyOAuthService } from './shopify-o-auth.service';

describe('ShopifyOAuthService', () => {
  let service: ShopifyOAuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ShopifyOAuthService],
    }).compile();

    service = module.get<ShopifyOAuthService>(ShopifyOAuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
