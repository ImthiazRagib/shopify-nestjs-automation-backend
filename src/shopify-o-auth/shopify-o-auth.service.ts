import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import axios from 'axios';
import * as crypto from 'crypto';
import * as querystring from 'querystring';

@Injectable()
export class ShopifyOAuthService {
  private readonly clientId = process.env.SHOPIFY_STOREFRONT_API_KEY;
  private readonly clientSecret = process.env.SHOPIFY_STOREFRONT_API_SECRET_KEY;
  private readonly scopes = process.env.SHOPIFY_SCOPES;
  private readonly redirectUri = process.env.SHOPIFY_REDIRECT_URI;

  /**
   * Step 1: Redirect merchant to Shopify authorization URL
   */
  getAuthUrl(shop: string): string {
    // return shop
    const state = crypto.randomBytes(16).toString('hex');
    const params = querystring.stringify({
      client_id: this.clientId,
      scope: this.scopes,
      redirect_uri: this.redirectUri,
      state,
      grant_options: ['per-user'],
    });

    return `https://${shop}/admin/oauth/authorize?${params}`;
  }

  /**
   * Step 2: Exchange code for access token
   */
  async getAccessToken(shop: string, code: string): Promise<string> {
    try {
      const res = await axios.post(`https://${shop}/admin/oauth/access_token`, {
        client_id: this.clientId,
        client_secret: this.clientSecret,
        code,
      });
      return res.data.access_token;
    } catch (error) {
      console.error('Access token exchange failed:', error.response?.data || error.message);
      throw new HttpException('Failed to get access token', HttpStatus.BAD_REQUEST);
    }
  }

  /**
   * Step 3: Verify HMAC to ensure request integrity
   */
  verifyHmac(query: any): boolean {
    const { hmac, ...params } = query;
    const message = querystring.stringify(params);
    const generatedHmac = crypto
      .createHmac('sha256', this.clientSecret!)
      .update(message)
      .digest('hex');
    return generatedHmac === hmac;
  }
}

