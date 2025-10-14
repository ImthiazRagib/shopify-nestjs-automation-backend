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

    getDummyProducts() {
        return [
            {
                title: "Elegant Cotton T-Shirt-01",
                body_html: "<strong>Soft, durable, and stylish.</strong>",
                vendor: "Imthiaz Apparel",
                product_type: "T-Shirts",
                tags: ["cotton", "unisex", "summer"],
                variants: [
                    { option1: "Small", price: "29.99", sku: "TSHIRT01-SM", inventory_management: "shopify", inventory_quantity: 10 },
                    { option1: "Medium", price: "29.99", sku: "TSHIRT01-MD", inventory_management: "shopify", inventory_quantity: 8 }
                ],
                options: [{ name: "Size", values: ["Small", "Medium"] }],
                image: { src: "https://images.unsplash.com/photo-1523381294911-8d3cead13475?w=600", position: 1 },
                images: [
                    { src: "https://images.unsplash.com/photo-1523381294911-8d3cead13475?w=600", position: 1 },
                    { src: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600", position: 2 }
                ],
                category: { name: "Clothing" },
                status: "active"
            },
            {
                title: "Classic Denim Jacket-02",
                body_html: "<strong>Timeless style with premium denim fabric.</strong>",
                vendor: "Imthiaz Apparel",
                product_type: "Jackets",
                tags: ["denim", "casual", "fashion"],
                variants: [
                    { option1: "Small", price: "59.99", sku: "JACKET02-SM", inventory_management: "shopify", inventory_quantity: 5 },
                    { option1: "Large", price: "59.99", sku: "JACKET02-LG", inventory_management: "shopify", inventory_quantity: 7 }
                ],
                options: [{ name: "Size", values: ["Small", "Large"] }],
                image: { src: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600", position: 1 },
                images: [
                    { src: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600", position: 1 },
                    { src: "https://images.unsplash.com/photo-1556906781-9a412961c27a?w=600", position: 2 }
                ],
                category: { name: "Outerwear" },
                status: "active"
            },
            {
                title: "Leather Handbag-03",
                body_html: "<strong>Premium leather for everyday elegance.</strong>",
                vendor: "Imthiaz Bags",
                product_type: "Handbags",
                tags: ["leather", "fashion", "accessory"],
                variants: [
                    { option1: "Brown", price: "89.99", sku: "BAG03-BR", inventory_management: "shopify", inventory_quantity: 12 },
                    { option1: "Black", price: "89.99", sku: "BAG03-BK", inventory_management: "shopify", inventory_quantity: 9 }
                ],
                options: [{ name: "Color", values: ["Brown", "Black"] }],
                image: { src: "https://images.unsplash.com/photo-1606813902911-9b9d5b4f8d05?w=600", position: 1 },
                images: [
                    { src: "https://images.unsplash.com/photo-1606813902911-9b9d5b4f8d05?w=600", position: 1 },
                    { src: "https://images.unsplash.com/photo-1618354691437-1e1f6d5f7f0c?w=600", position: 2 }
                ],
                category: { name: "Accessories" },
                status: "active"
            },
            {
                title: "Running Sneakers-04",
                body_html: "<strong>Comfort meets performance.</strong>",
                vendor: "Imthiaz Footwear",
                product_type: "Shoes",
                tags: ["sports", "comfort", "running"],
                variants: [
                    { option1: "8", price: "69.99", sku: "SHOE04-8", inventory_management: "shopify", inventory_quantity: 6 },
                    { option1: "10", price: "69.99", sku: "SHOE04-10", inventory_management: "shopify", inventory_quantity: 4 }
                ],
                options: [{ name: "Size", values: ["8", "10"] }],
                image: { src: "https://images.unsplash.com/photo-1606813902911-9b9d5b4f8d05?w=600", position: 1 },
                images: [
                    { src: "https://images.unsplash.com/photo-1606813902911-9b9d5b4f8d05?w=600", position: 1 },
                    { src: "https://images.unsplash.com/photo-1528701800489-20be9c52f27d?w=600", position: 2 }
                ],
                category: { name: "Footwear" },
                status: "active"
            },
            {
                title: "Smart Watch-05",
                body_html: "<strong>Track your health and stay connected.</strong>",
                vendor: "Imthiaz Tech",
                product_type: "Electronics",
                tags: ["smartwatch", "tech", "fitness"],
                variants: [
                    { option1: "Black", price: "99.99", sku: "WATCH05-BK", inventory_management: "shopify", inventory_quantity: 10 },
                    { option1: "Silver", price: "99.99", sku: "WATCH05-SL", inventory_management: "shopify", inventory_quantity: 8 }
                ],
                options: [{ name: "Color", values: ["Black", "Silver"] }],
                image: { src: "https://images.unsplash.com/photo-1519744792095-2f2205e87b6f?w=600", position: 1 },
                images: [
                    { src: "https://images.unsplash.com/photo-1519744792095-2f2205e87b6f?w=600", position: 1 },
                    { src: "https://images.unsplash.com/photo-1603791440384-56cd371ee9a7?w=600", position: 2 }
                ],
                category: { name: "Wearables" },
                status: "active"
            },
            {
                title: "Bluetooth Headphones-06",
                body_html: "<strong>Wireless freedom with deep bass sound.</strong>",
                vendor: "Imthiaz Audio",
                product_type: "Headphones",
                tags: ["audio", "wireless", "bluetooth"],
                variants: [
                    { option1: "Black", price: "49.99", sku: "HEAD06-BK", inventory_management: "shopify", inventory_quantity: 15 }
                ],
                options: [{ name: "Color", values: ["Black"] }],
                image: { src: "https://images.unsplash.com/photo-1580894894513-f87a2e5b3abf?w=600", position: 1 },
                images: [
                    { src: "https://images.unsplash.com/photo-1580894894513-f87a2e5b3abf?w=600", position: 1 },
                    { src: "https://images.unsplash.com/photo-1519677100203-a0e668c92439?w=600", position: 2 }
                ],
                category: { name: "Audio" },
                status: "active"
            },
            {
                title: "Canvas Backpack-07",
                body_html: "<strong>Durable, spacious, and stylish.</strong>",
                vendor: "Imthiaz Bags",
                product_type: "Backpacks",
                tags: ["travel", "canvas", "school"],
                variants: [
                    { option1: "Blue", price: "39.99", sku: "BAG07-BL", inventory_management: "shopify", inventory_quantity: 12 },
                    { option1: "Green", price: "39.99", sku: "BAG07-GR", inventory_management: "shopify", inventory_quantity: 7 }
                ],
                options: [{ name: "Color", values: ["Blue", "Green"] }],
                image: { src: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=600", position: 1 },
                images: [
                    { src: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=600", position: 1 },
                    { src: "https://images.unsplash.com/photo-1504280390368-56d53be2e9a5?w=600", position: 2 }
                ],
                category: { name: "Accessories" },
                status: "active"
            },
            {
                title: "Wireless Keyboard-08",
                body_html: "<strong>Ergonomic design with smooth typing.</strong>",
                vendor: "Imthiaz Tech",
                product_type: "Electronics",
                tags: ["keyboard", "wireless", "office"],
                variants: [
                    { option1: "Black", price: "39.99", sku: "KEY08-BK", inventory_management: "shopify", inventory_quantity: 9 }
                ],
                options: [{ name: "Color", values: ["Black"] }],
                image: { src: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600", position: 1 },
                images: [
                    { src: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600", position: 1 }
                ],
                category: { name: "Office" },
                status: "active"
            },
            {
                title: "Gaming Mouse-09",
                body_html: "<strong>Precision control with RGB lighting.</strong>",
                vendor: "Imthiaz Tech",
                product_type: "Electronics",
                tags: ["gaming", "mouse", "rgb"],
                variants: [
                    { option1: "RGB", price: "29.99", sku: "MOUSE09-RGB", inventory_management: "shopify", inventory_quantity: 11 }
                ],
                options: [{ name: "Color", values: ["RGB"] }],
                image: { src: "https://images.unsplash.com/photo-1587202372775-98927d4dba5a?w=600", position: 1 },
                images: [
                    { src: "https://images.unsplash.com/photo-1587202372775-98927d4dba5a?w=600", position: 1 }
                ],
                category: { name: "Gaming" },
                status: "active"
            },
            {
                title: "Sunglasses-10",
                body_html: "<strong>UV protection with modern style.</strong>",
                vendor: "Imthiaz Fashion",
                product_type: "Accessories",
                tags: ["fashion", "summer", "sunglasses"],
                variants: [
                    { option1: "Black", price: "19.99", sku: "SUN10-BK", inventory_management: "shopify", inventory_quantity: 20 }
                ],
                options: [{ name: "Color", values: ["Black"] }],
                image: { src: "https://images.unsplash.com/photo-1511389026070-a14ae610a1be?w=600", position: 1 },
                images: [
                    { src: "https://images.unsplash.com/photo-1511389026070-a14ae610a1be?w=600", position: 1 }
                ],
                category: { name: "Accessories" },
                status: "active"
            }
        ];
    }

    async getProducts() {
        // return await this.getUsersShopifyProducts()
        return this.getDummyProducts()
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
    async getShopInfo() {
        const shopInfo = await this.getHttpResponse('/shop.json')
        return shopInfo;
    }

    //* LOCATIONS
    async getAllLocations() {
        const allLocations = await this.getHttpResponse('/locations.json')
        return allLocations;
    }
}
