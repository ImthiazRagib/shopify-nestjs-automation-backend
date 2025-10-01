import { Test, TestingModule } from '@nestjs/testing';
import { ShopifyPartnerController } from './shopify-partner.controller';

describe('ShopifyPartnerController', () => {
  let controller: ShopifyPartnerController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ShopifyPartnerController],
    }).compile();

    controller = module.get<ShopifyPartnerController>(ShopifyPartnerController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
