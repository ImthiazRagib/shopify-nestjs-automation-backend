import { Body, Controller, Get, HttpException, HttpStatus, Post, Query, Res } from '@nestjs/common';
import axios from 'axios';
import * as crypto from 'crypto';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Get('install')
    async install(@Query('shop') shop: string, @Res() res: any) {
        if (!shop) throw new HttpException('Missing shop param', HttpStatus.BAD_REQUEST);
        
        const state = crypto.randomBytes(16).toString('hex');
        const redirectUri = `http://localhost:3000/auth/callback?code=xxx&shop=${process.env.SHOPIFY_STORE_NAME}.myshopify.com`;
        const scopes = 'read_products,read_orders';
        const clientId = process.env.SHOPIFY_API_KEY;
        
        const installUrl = `https://${shop}/admin/oauth/authorize?client_id=${clientId}&scope=${scopes}&state=${state}&response_type=code&redirect_uri=${redirectUri}`;
        return res.redirect(installUrl);
    }
    
    @Post('callback')
    async handleCallback(@Query() query) {
        const { code, shop } = query;
        if (!code || !shop) throw new HttpException('Missing shop, code param', HttpStatus.BAD_REQUEST);

        console.log('Code:', MediaQueryListEvent);
        const response = await axios.post(`https://${shop}/admin/oauth/access_token`, {
            client_id: process.env.SHOPIFY_API_KEY,
            client_secret: process.env.SHOPIFY_API_SECRET_KEY,
            code,
        });
        console.log('Access Token:', response, response.data.access_token);
    }
}