import { HttpService } from '@nestjs/axios';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import axios from 'axios';
import { firstValueFrom } from 'rxjs';
import { AddShopifyProductDto } from './dto/shopify.products.dto';

@Injectable()
export class ShopifyService {

    private version = process.env.SHOPIFY_API_VERSION;
    private baseUrl = `https://${process.env.SHOPIFY_STORE_URL}/admin/api/${this.version}`;
    private headers = {
        'X-Shopify-Access-Token': process.env.SHOPIFY_ADMIN_ACCESS_TOKEN,
        'Content-Type': 'application/json',
    };

    constructor(
        private readonly httpService: HttpService
    ) {
    }

    async getHttpResponse(endpoint: string, headers?: object, query?: object) {
        try {
            const store = process.env.SHOPIFY_STORE_NAME;
            const version = process.env.SHOPIFY_API_VERSION;
            const baseUrl = `https://${store}.myshopify.com/admin/api/${version}${endpoint}`;
            headers = {
                ...headers,
                'X-Shopify-Access-Token': process.env.SHOPIFY_ADMIN_ACCESS_TOKEN,
                'Content-Type': 'application/json',
            };

            const response: any = await firstValueFrom(
                this.httpService.get(baseUrl as string, { headers }),
            );

            return response.data
        } catch (error) {
            throw new HttpException(
                error.response?.data || error.message || 'Shopify API error',
                error.response?.status || HttpStatus.BAD_REQUEST,
            );
        }
    }
    // * Products
    async createProduct(payload: AddShopifyProductDto) {
        try {
            const product = {
                product: {
                    ...payload
                },
            };

            const { data } = await axios.post(
                `${this.baseUrl}/products.json`,
                product,
                { headers: this.headers },
            );
            return data.product;
        } catch (error) {
            console.log(error.response.data.errors);
            throw new HttpException(
                error.response?.data?.errors
                    ? { errors: error.response.data.errors, message: error.message }
                    : { message: 'Failed to create product' },
                error.response?.status || HttpStatus.BAD_REQUEST
            );
        }
    }

    async getUsersShopifyProducts() {
        const products = await this.getHttpResponse('/products.json')
        return products;
    }

    async getProducts() {
        return await this.getUsersShopifyProducts()
    }

    async getProductTypes() {
        const types = await this.getHttpResponse('/products.json?fields=product_type')

        return types?.products?.map(p => p.product_type)
    }

    //* COLLECTIONS/CATEGORIES
    async getCustomCollections() {
        return await this.getHttpResponse('/custom_collections.json')
    }

    async getSmartCollections() {
        return await this.getHttpResponse('/smart_collections.json')
    }

    //* ORDERS
    async getUsersShopifyOrders() {
        const orders = await this.getHttpResponse('/orders.json')
        return orders;
    }

    async getOrders() {
        return await this.getUsersShopifyOrders()
    }

    //* STORES
    async getAllStores() {
        const allstores = await this.getHttpResponse('/shop.json')
        return allstores;
    }
}
