import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import axios from 'axios';
import * as crypto from 'crypto';
import * as querystring from 'querystring';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ShopifyStore } from 'src/shopify/shop/models/shopify-shop.model';

@Injectable()
export class ShopifyOAuthService {
    private readonly clientId = process.env.CLIENT_ID;
    private readonly clientSecret = process.env.CLIENT_SECRET;
    private readonly scopes = process.env.APP_SCOPES;
    private readonly redirectUri = `${process.env.NODE_ENV === 'dev' ? process.env.LOCAL_REDIRECT_URI : process.env.REDIRECT_URI}`; //process.env.SHOPIFY_REDIRECT_URI;

    constructor(
        @InjectModel(ShopifyStore.name) private storeModel: Model<ShopifyStore>,
    ) { }

    // * 🔵 Create or update shop informations in DB on application install from shopify appstore
    // async createOrUpdate(store: Partial<ShopifyStore>): Promise<ShopifyStore> {
    //     return this.storeModel.findOneAndUpdate(
    //         { shopId: store.shopId },
    //         store,
    //         { upsert: true, new: true },
    //     ).exec();
    // }
    async createOrUpdate(store: Partial<ShopifyStore>): Promise<ShopifyStore> {
        const { shopId, accessToken, ...rest } = store;

        const existing = await this.storeModel.findOne({ shopId });

        if (existing) {
            // 🟡 Update only token and other fields if needed
            existing.accessToken = accessToken || existing.accessToken;
            Object.assign(existing, rest); // optional: update other fields too
            await existing.save();
            return existing;
        }

        // 🟢 Create new shop if it doesn't exist
        const newShop = new this.storeModel({
            shopId,
            accessToken,
            ...rest,
        });
        return newShop.save();
    }

    async findAll(): Promise<ShopifyStore[]> {
        return this.storeModel.find().exec();
    }

    async findById(id: string): Promise<ShopifyStore | null> {
        return this.storeModel.findOne({ id }).exec();
    }


    /**
     * Step 1: Redirect merchant to Shopify authorization URL
     */
    getAuthUrl(): string {
        const shop = 'quickdropx-2.myshopify.com';
        // const state = crypto.randomBytes(16).toString('hex');
        const state = {
            shop,
            timestamp: Date.now(),
            email: `${shop.split('.')[0]}@${shop.split('.')[1]}`
        };
        const params = querystring.stringify({
            client_id: this.clientId,
            scope: this.scopes,
            redirect_uri: this.redirectUri,
            state: JSON.stringify(state),
            'grant_options[]': 'per-user',
        });

        const authUrl = `https://${shop}/admin/oauth/authorize?${params}`
        // const params = `client_id=${this.clientId}&scope=${this.scopes}&state=${state}&grant_options=${JSON.stringify(['per-user'])}&redirect_uri=${this.redirectUri}`
        console.log("🚀 ~ ShopifyOAuthService ~ getAuthUrl ~ authUrl:", authUrl)

        return authUrl;
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
                scope: this.scopes,
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
        console.log("🚀 ~ ShopifyOAuthService ~ verifyHmac ~ message:", message)
        console.log("🚀 ~ ShopifyOAuthService ~ verifyHmac ~ query:", query)
        const generatedHmac = crypto
            .createHmac('sha256', this.clientSecret!)
            .update(message)
            .digest('hex');
        console.log("🚀 ~ ShopifyOAuthService ~ verifyHmac ~ generatedHmac:", generatedHmac, hmac === generatedHmac)
        return generatedHmac === hmac;
    }
}

