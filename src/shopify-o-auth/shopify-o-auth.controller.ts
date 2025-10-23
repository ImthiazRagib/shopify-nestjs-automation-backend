import { Controller, Get, Query, Res, HttpException, HttpStatus, Post, Body, } from '@nestjs/common';
import { ShopifyOAuthService } from './shopify-o-auth.service';
import { CallbackDto, InstallAppDto } from './dto/o-auth.dto';

@Controller('shopify-o-auth')
export class ShopifyOAuthController {
  constructor(private readonly shopifyOAuthService: ShopifyOAuthService) { }



  @Post('create')
  async create(@Body() body: any) {
    console.log("🚀 ~ ShopifyOAuthController ~ create ~ body:", body)
    return this.shopifyOAuthService.createOrUpdate(body);
  }

  // @Post('verify')
  // async verify(@Body() body: any) {
  //   return this.shopifyOAuthService.verify(body);
  // }
  /**
   * Step 1: Redirect to Shopify OAuth page
   * @example GET /shopify-o-auth/install?shop=your-store.myshopify.com
   */
  @Get('install')
  async install() {
    //@Query() query: InstallAppDto if (!query.shop) throw new HttpException('Missing shop parameter', HttpStatus.BAD_REQUEST);  query.shop
    const authUrl = this.shopifyOAuthService.getAuthUrl();
    return { status: HttpStatus.FOUND, url: authUrl };
  }

  /**
   * Step 2: Shopify callback URL
   */
  @Get('callback')
  async callback(@Query() query: any) {
    console.log("🚀 ~ ShopifyOAuthController ~ callback ~ query:", query)
    const { shop, code, hmac } = query;

    if (!shop || !code || !hmac)
      throw new HttpException('Missing parameters', HttpStatus.BAD_REQUEST);

    // Verify HMAC
    const valid = this.shopifyOAuthService.verifyHmac(query);
    if (!valid)
      throw new HttpException('Invalid HMAC signature', HttpStatus.FORBIDDEN);

    // // Get Access Token
    // const accessToken = await this.shopifyOAuthService.getAccessToken(shop, code);

    // Store accessToken in DB or cache for future use

    return query;
  }
}
