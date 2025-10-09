import { HttpService } from '@nestjs/axios';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import axios from 'axios';
import { firstValueFrom } from 'rxjs';
import { AddShopifyProductDto } from './dto/shopify.products.dto';

@Injectable()
export class ShopifyService {

    private version = process.env.SHOPIFY_API_VERSION;
    private baseUrl = `https://${process.env.SHOPIFY_STOREFRONT_DOMAIN}/admin/api/${this.version}`;
    private headers = {
        'X-Shopify-Access-Token': process.env.SHOPIFY_ADMIN_ACCESS_TOKEN,
        'Content-Type': process.env.CONTENT_TYPE,
    };

    constructor(
        private readonly httpService: HttpService
    ) {
    }

    async getHttpResponse(endpoint: string, headers?: object, query?: object) {
        try {
            const baseUrl = `${this.baseUrl}${endpoint}`;
            headers = {
                ...headers,
                ...this.headers,
            };

            const response: any = await firstValueFrom(
                this.httpService.get(baseUrl as string, { headers }),
            );

            return response.data
        } catch (error) {
            throw new HttpException(
                error.message || 'Shopify API error',
                error.status || HttpStatus.BAD_REQUEST,
            );
        }
    }
    // * Products
    async createProduct(payload: any) {
        console.log("🚀 ~ ShopifyService ~ createProduct ~ payload:", payload)
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

    async updateProduct(productId: number, payload: any) {
        try {
            await this.getSingleProduct(productId);
            const _payload = { product: { id: productId, ...payload } };

            const res = await axios.put(
                `${this.baseUrl}/products/${productId}.json`,
                _payload,
                { headers: this.headers },
            );
            return res.data;
        } catch (error) {
            console.log(error);
            throw new HttpException(
                error.response?.data?.errors
                    ? { errors: error.response.data.errors, message: error.message }
                    : { message: 'Failed to update product' },
                error.response?.status || HttpStatus.BAD_REQUEST
            );
        }
    }

    async deleteProduct(productId: number) {
        try {
            await this.getSingleProduct(productId);
            const url = `${this.baseUrl}/products/${productId}.json`;

            const res = await axios.delete(url, {
                headers: this.headers,
            });

            return {
                success: true,
                message: `Product ${productId} deleted successfully`,
                status: res.status,
            };
        } catch (error) {
            console.error('Shopify Delete Error:', error.response?.data || error.message);

            throw new HttpException(
                { message: error.message || 'Failed to delete product' },
                error.status || HttpStatus.BAD_REQUEST
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

    async getSingleProduct(productId: number) {
        try {
            const product = await this.getHttpResponse(`/products/${productId}.json`);
            return product;
        } catch (error) {
            throw new HttpException(
                 error.message || 'Failed to fetch product',
                 error.status || HttpStatus.BAD_REQUEST
            );
        }
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

    //* LOCATIONS
    async getAllLocations() {
        const allLocations = await this.getHttpResponse('/locations.json')
        return allLocations;
    }
}
