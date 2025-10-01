import { Test, TestingModule } from '@nestjs/testing';
import { ShopifyPartnerService } from './shopify-partner.service';

describe('ShopifyPartnerService', () => {
  let service: ShopifyPartnerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ShopifyPartnerService],
    }).compile();

    service = module.get<ShopifyPartnerService>(ShopifyPartnerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
