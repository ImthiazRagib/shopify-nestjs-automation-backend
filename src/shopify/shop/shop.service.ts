import { HttpService } from '@nestjs/axios';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { GetOrdersDto, QueryShopDto } from './dto/shop.v1.dto';
import { ShopifyStore } from './models/shopify-shop.model';

@Injectable()
export class ShopService {
    private version = process.env.SHOPIFY_API_VERSION;
    private scopes = process.env.APP_SCOPES;
    constructor(
        private readonly httpService: HttpService,
        @InjectModel(ShopifyStore.name) private storeModel: Model<ShopifyStore>,
    ) {
    }

    // * 🔵 Create or update shop informations in DB on application install from shopify appstore
    async createOrUpdate(store: Partial<ShopifyStore>): Promise<ShopifyStore> {
        const { shopId, accessToken, ...rest } = store;

        const existing = await this.storeModel.findOne({ shopId });

        if (existing) {
            // * 🟡 Update only token and other fields if needed
            existing.accessToken = accessToken || existing.accessToken;
            Object.assign(existing, rest); // optional: update other fields too
            await existing.save();
            return existing;
        }

        // * 🟢 Create new shop if it doesn't exist
        const newShop = new this.storeModel({
            shopId,
            accessToken,
            ...rest,
        });
        return newShop.save();
    }

    async checkAccessTokenExist(payload: {
        accessToken: string;
    }) {
        try {
            const shop = await this.storeModel.findOne({
                accessToken: payload.accessToken,
            }).exec();

            if (!shop) {
                throw new HttpException(
                    'Shop not found',
                    HttpStatus.NOT_FOUND,
                );
            }

            return shop.toObject();
        } catch (error) {
            throw new HttpException(
                error.message || 'Shopify API error',
                error.status || HttpStatus.BAD_REQUEST,
            );
        }
    }

    async getShopifyShop(payload: QueryShopDto, accessToken: string) {
        try {
            const shop = await this.storeModel.findOne({
                $or: [
                    { shopName: payload.shopName },
                    { domain: payload.domain },
                    { accessToken: accessToken },
                    { shopId: payload.shopId },
                ]
            }).exec();

            if (!shop) {
                throw new HttpException(
                    'Shop not found',
                    HttpStatus.NOT_FOUND,
                );
            }

            return shop.toObject();
        } catch (error) {
            throw new HttpException(
                error.message || 'Shopify API error',
                error.status || HttpStatus.BAD_REQUEST,
            );
        }
    }

    async getShopifyStoreUrl(payload: {
        shopId?: string;
        accessToken: string;
    }) {
        // Fetch shop details from your DB or other service
        const shop = await this.getShopifyShop({ shopId: payload.shopId }, payload.accessToken);
        const shopDomain = shop.myshopifyDomain.replace(/^https?:\/\//, ""); // ensure no double https
        return {
            shopId: shop.shopId,
            shopDomain,
            shopUrl: `https://${shopDomain}/admin/api/${this.version}`,
            accessToken: shop.accessToken,
        };
    }


    async createShopifyUtilities(payload: {
        shopId: string;
        accessToken: string;
        endpoint: string;
        data: any;
    }) {

        if (!payload.data) {
            throw new HttpException(
                'Request payload is invalid.',
                HttpStatus.BAD_REQUEST,
            );
        }

        try {
            const {
                shopUrl,
            } = await this.getShopifyStoreUrl({ shopId: payload.shopId, accessToken: payload.accessToken });

            const url = `${shopUrl}/${payload.endpoint}`;

            console.log("🟢 Shopify POST API Call →", url);

            const response = await this.httpService.axiosRef.post(url, payload.data, {
                headers: {
                    "X-Shopify-Access-Token": payload.accessToken,
                    "Content-Type": "application/json",
                },
            });

            return response;
        } catch (error) {
            throw new HttpException(
                error.response?.data || 'Shopify API error',
                error.status || HttpStatus.BAD_REQUEST,
            );
        }
    }

    async getShopifyUtilities(payload: {
        shopId?: string;
        accessToken: string;
        endpoint: string;
    }) {

        try {

            const {
                shopUrl,
            } = await this.getShopifyStoreUrl({ shopId: payload.shopId, accessToken: payload.accessToken });

            const url = `${shopUrl}/${payload.endpoint}`;

            console.log("🟢 Shopify GET API Call →", url);

            const { data } = await this.httpService.axiosRef.get(url, {
                headers: {
                    "X-Shopify-Access-Token": payload.accessToken,
                    "Content-Type": "application/json",
                },
            });

            return data;
        } catch (error) {
            throw new HttpException(
                error.response?.data?.errors || 'Shopify API error',
                error.status || HttpStatus.BAD_REQUEST,
            );
        }
    }
    // Access scopes: read_products,write_products,read_orders,write_orders,read_customers
    async getShopifyAccessScopes(payload: {
        shopId: string;
        accessToken: string;
        endpoint: string;
    }) {

        try {
            const {
                shopDomain,
            } = await this.getShopifyStoreUrl({ shopId: payload.shopId, accessToken: payload.accessToken });

            const url = `https://${shopDomain}/admin/oauth/access_scopes.json`;

            console.log("🟢 Shopify API Call →", url);

            const { data } = await this.httpService.axiosRef.get(url, {
                headers: {
                    "X-Shopify-Access-Token": payload.accessToken,
                    "Content-Type": "application/json",
                },
            });

            return data;
        } catch (error) {
            throw new HttpException(
                error.response?.data?.errors || 'Shopify API error',
                error.status || HttpStatus.BAD_REQUEST,
            );
        }
    }

    // * Products
    async createProduct(payload: {
        shopId: string;
        accessToken: string;
        data: Record<string, any>;
    }) {
        try {
            const product = {
                product: {
                    ...payload.data
                },
            };

            const { data } = await this.createShopifyUtilities({
                shopId: payload.shopId,
                accessToken: payload.accessToken,
                endpoint: 'products.json',
                data: product,
            });
            return data.product;
        } catch (error) {
            console.log(error);
            throw new HttpException(
                error.response?.data?.errors
                    ? { errors: error.response.data.errors, message: error.message }
                    : { message: 'Failed to create product' },
                error.response?.status || HttpStatus.BAD_REQUEST
            );
        }
    }

    async updateProduct(payload: {
        shopId: string;
        productId: number;
        accessToken: string;
        data: Record<string, any>;
    }) {
        try {

            const { shopUrl } = await this.getShopifyStoreUrl({ shopId: payload.shopId, accessToken: payload.accessToken });
            const product = await this.getSingleProduct({
                shopId: payload.shopId,
                productId: payload.productId,
                accessToken: payload.accessToken,
            });
            const _payload = { product: { id: product.id, ...payload.data } };

            const res = await this.httpService.axiosRef.put(
                `${shopUrl}/products/${payload.productId}.json`,
                _payload,
                { headers: {
                    "X-Shopify-Access-Token": payload.accessToken,
                    "Content-Type": "application/json",
                } },
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

    // async deleteProduct(productId: number) {
    //     try {
    //         await this.getSingleProduct(productId);
    //         const url = `${this.baseUrl}/products/${productId}.json`;

    //         const res = await axios.delete(url, {
    //             headers: this.headers,
    //         });

    //         return {
    //             success: true,
    //             message: `Product ${productId} deleted successfully`,
    //             status: res.status,
    //         };
    //     } catch (error) {
    //         console.error('Shopify Delete Error:', error.response?.data || error.message);

    //         throw new HttpException(
    //             { message: error.message || 'Failed to delete product' },
    //             error.status || HttpStatus.BAD_REQUEST
    //         );
    //     }
    // }

    async getProducts(query: QueryShopDto, accessToken: string) {
        return await this.getShopifyUtilities({
            shopId: query.shopId,
            accessToken,
            endpoint: `/products.json?limit=${query.limit || 10}&page_info=${``}&sort_by=${query.sortBy || 'created_at'}&sort_order=${query.sortOrder || 'ASC'}`,
        })
    }

    async getSingleProduct({
        shopId,
        productId,
        accessToken,
    }: {
        shopId: string;
        productId: number;
        accessToken: string;
    }) {
        try {
            const product = await this.getShopifyUtilities({
                shopId,
                accessToken,
                endpoint: `/products/${productId}.json`,
            });
            return product;
        } catch (error) {
            throw new HttpException(
                error.message || 'Failed to fetch product',
                error.status || HttpStatus.BAD_REQUEST
            );
        }
    }

    // async getProductTypes() {
    //     const types = await this.getHttpResponse('/products.json?fields=product_type')

    //     return types?.products?.map(p => p.product_type)
    // }

    // //* COLLECTIONS/CATEGORIES
    // async getCustomCollections() {
    //     return await this.getHttpResponse('/custom_collections.json')
    // }

    // async getSmartCollections() {
    //     return await this.getHttpResponse('/smart_collections.json')
    // }

    //* ORDERS
    async getShopifyOrders(query: GetOrdersDto, accessToken: string) {
        const orders = await this.getShopifyUtilities(
            {
                shopId: query.shopId,
                accessToken,
                endpoint: `orders.json?limit=${query.limit || 1}&page_info=${``}&sort_by=${query.sortBy || 'created_at'}&sort_order=${query.sortOrder || 'ASC'}`,
            }
        )
        return orders;
    }

    // async getOrders() {
    //     return await this.getUsersShopifyOrders()
    // }

    //* STORES
    async getShopInfo(query: QueryShopDto, accessToken: string) {
        const shopInfo = await this.getShopifyUtilities(
            {
                shopId: query.shopId,
                accessToken,
                endpoint: 'shop.json',
            }
        )
        return shopInfo;
    }

    // //* LOCATIONS
    async getAllLocations(query: QueryShopDto, accessToken: string) {
        const locations = await this.getShopifyUtilities(
            {
                shopId: query.shopId,
                accessToken,
                endpoint: 'locations.json',
            }
        )
        return locations;
    }
}
