import { Controller, Get, Query, Res, HttpException, HttpStatus, } from '@nestjs/common';
import { ShopifyOAuthService } from './shopify-o-auth.service';
import { CallbackDto, InstallAppDto } from './dto/o-auth.dto';

@Controller('shopify-o-auth')
export class ShopifyOAuthController {
  constructor(private readonly shopifyService: ShopifyOAuthService) {}

  /**
   * Step 1: Redirect to Shopify OAuth page
   * @example GET /shopify-o-auth/install?shop=your-store.myshopify.com
   */
  @Get('install')
  async install(@Query() query: InstallAppDto, @Res() res: import('express').Response) {
    if (!query.shop) throw new HttpException('Missing shop parameter', HttpStatus.BAD_REQUEST);
    const authUrl = this.shopifyService.getAuthUrl(query.shop);
    return res.status(HttpStatus.FOUND).json({ authUrl });
  }

  /**
   * Step 2: Shopify callback URL
   */
  @Get('callback')
  async callback(@Query() query: CallbackDto, @Res() res: import('express').Response) {
    const { shop, code, hmac } = query;
    if (!shop || !code || !hmac)
      throw new HttpException('Missing parameters', HttpStatus.BAD_REQUEST);

    // Verify HMAC
    const valid = this.shopifyService.verifyHmac(query);
    if (!valid)
      throw new HttpException('Invalid HMAC signature', HttpStatus.FORBIDDEN);

    // Get Access Token
    const accessToken = await this.shopifyService.getAccessToken(shop, code);

    // Store accessToken in DB or cache for future use
    console.log(`✅ Access Token for ${shop}:`, accessToken);

    return res.json({ shop, accessToken });
  }
}
