import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { ShopService } from 'src/shopify/shop/shop.service';

@Injectable()
export class ShopifyAccessGuard implements CanActivate {
    constructor(private readonly shopService: ShopService) { }
    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest<Request>();

        // Get the x-shopify-access header
        const accessToken = request.headers['x-shopify-access'] as string;

        if (!accessToken) {
            throw new UnauthorizedException('Missing x-shopify-access header');
        }

        // Optionally: verify token logic
        // e.g., compare with stored Shopify store accessToken in DB
        const isValid = await this.validateShopifyAccessToken(accessToken);
        if (!isValid) {
            throw new UnauthorizedException('Invalid Shopify access token');
        }

        const accessTokenExist = await this.shopService.checkAccessTokenExist({
            accessToken,
        });

        if (!accessTokenExist) {
            throw new UnauthorizedException('Shopify access token not found');
        }

        request['accessToken'] = accessTokenExist.accessToken;



        return true;
    }

    // Example validation logic (replace with real DB lookup)
    private async validateShopifyAccessToken(accessToken: string): Promise<boolean> {
        // This could be replaced with a real database call
        // For now, let's assume tokens must start with "shpua_"
        return accessToken.startsWith('shpua_');
    }
}
