import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }
  
  /**
   * Get Shopify View
   */
  getShopifyView(): string {
    return '<h1>Shopify View</h1>';
  }
}
