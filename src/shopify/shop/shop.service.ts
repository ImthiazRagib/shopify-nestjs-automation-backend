import { HttpService } from '@nestjs/axios';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateOrderDto, GetOrdersDto, QueryShopDto, QueryShopProductDto } from './dto/shop.v1.dto';
import { ShopifyStore } from './models/shopify-shop.model';

@Injectable()
export class ShopService {
    private version = process.env.SHOPIFY_API_VERSION;

    constructor(
        private readonly httpService: HttpService,
        @InjectModel(ShopifyStore.name) private storeModel: Model<ShopifyStore>,
    ) {
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

            const url = `${shopUrl}${payload.endpoint}`;

            console.log("🟢 Shopify GET API Call →", url);

            const { data, headers } = await this.httpService.axiosRef.get(url, {
                headers: {
                    "X-Shopify-Access-Token": payload.accessToken,
                    "Content-Type": "application/json",
                },
            });
            const linkHeader = headers['link'];

            // Extract pagination info from Link header
            const pagination = this.parseLinkHeader(linkHeader);

            return {
                data,
                pagination,
            };
        } catch (error) {
            console.log("🚀 ~ ShopService ~ getShopifyUtilities ~ error:", error.response.data)
            throw new HttpException(
                error.response?.data?.errors || 'Shopify API error',
                error.status || HttpStatus.BAD_REQUEST,
            );
        }
    }
    //* Access scopes: read_products,write_products,read_orders,write_orders,read_customers
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
                {
                    headers: {
                        "X-Shopify-Access-Token": payload.accessToken,
                        "Content-Type": "application/json",
                    }
                },
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

    async getProducts(query: QueryShopProductDto, accessToken: string) {
        const queryParams = await this.createQueryParameters(query);
        const { data, pagination } = await this.getShopifyUtilities({
            shopId: query.shopId,
            accessToken,
            endpoint: `/products.json?${queryParams}`,
        })

        return {
            products: data.products ?? [],
            pagination,
        }
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
            return product.data.product;
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

    async createQueryParameters(query: GetOrdersDto | QueryShopDto | QueryShopProductDto) {
        const params = new URLSearchParams();

        // * Products
        if ('title' in query && query.title) {
            params.append('title', query.title);
        }
        if ('vendor' in query && query.vendor) {
            params.append('vendor', query.vendor);
        }
        if ('product_type' in query && query.product_type) {
            params.append('product_type', query.product_type);
        }
        if ('status' in query && query.status) {
            params.append('status', query.status); // 'active', 'draft', 'archived'
        }
        if ('collection_id' in query && query.collection_id) {
            params.append('collection_id', query.collection_id);
        }
        if ('fields' in query && query.fields) {
            params.append('fields', query.fields);
        }
        if ('published_status' in query && query.published_status) {
            params.append('published_status', query.published_status); // e.g. 'published'
        }

        if ('published_scope' in query && query.published_scope) {
            params.append('published_scope', query.published_scope); // e.g. 'global'
        }

        // * Orders
        if ('financialStatus' in query && query.financialStatus) {
            params.append('financial_status', query.financialStatus);
        }

        if ('fulfillmentStatus' in query && query.fulfillmentStatus) {
            params.append('fulfillment_status', query.fulfillmentStatus);
        }

        if ('status' in query && query.status) {
            params.append('status', query.status);
        }

        //* Global

        if (query.limit) {
            params.append('limit', String(query.limit));
        }

        if (query.sortBy && query.sortOrder) {
            params.append('order', `${query.sortBy}_${query.sortOrder}`);
        }

        if (query.pageInfo) {
            params.delete('published_status');
            params.append('page_info', query.pageInfo);
        }


        return params.toString();
    }

    //* ORDERS
    async getShopifyOrders(query: GetOrdersDto, accessToken: string) {
        const queryParams = await this.createQueryParameters(query);
        const orders = await this.getShopifyUtilities(
            {
                shopId: query.shopId,
                accessToken,
                endpoint: `/orders.json?${queryParams}`,
            }
        )
        return orders;
    }

    async getSingleOrder({
        shopId,
        orderId,
        accessToken,
    }: {
        shopId: string;
        orderId: number;
        accessToken: string;
    }) {
        try {
            const order = await this.getShopifyUtilities(
                {
                    shopId,
                    accessToken,
                    endpoint: `/orders/${orderId}.json`,
                }
            );
            return order.data.order;
        } catch (error) {
            throw new HttpException(
                error.message || 'Failed to fetch order',
                error.status || HttpStatus.BAD_REQUEST
            );
        }
    }

    async createShopifyOrder(payload: {
        shopId: string;
        accessToken: string;
        order: CreateOrderDto;
    }) {
        console.log("🚀 ~ ShopService ~ createShopifyOrder ~ order:", payload.order)
        try {
            const { shopUrl } = await this.getShopifyStoreUrl({ shopId: payload.shopId, accessToken: payload.accessToken });
            const url = `${shopUrl}/orders.json`;

            console.log("🛍️ Creating Shopify Order →", url);

            const { data } = await this.httpService.axiosRef.post(
                url,
                { order: payload.order },
                {
                    headers: {
                        "X-Shopify-Access-Token": payload.accessToken,
                        "Content-Type": "application/json",
                    },
                }
            );

            return data;
        } catch (error) {
            console.log("🚨 Shopify Order Error:", error.response?.data || error);
            throw new HttpException(
                error.response?.data?.errors || "Shopify Order creation failed",
                error.status || HttpStatus.BAD_REQUEST,
            );
        }
    }


    //* Capture Payment (Mark as Paid)
    async capturePayment(payload: {
        shopId: string;
        accessToken: string;
        orderId: number;
        amount: string;
        currency?: string;
        status: string;
        kind: string;
    }) {
        try {
            const { shopUrl } = await this.getShopifyStoreUrl({
                shopId: payload.shopId,
                accessToken: payload.accessToken,
            });

            const url = `${shopUrl}/orders/${payload.orderId}/transactions.json`;
            console.log("💰 Capturing Payment →", url);

            const { data } = await this.httpService.axiosRef.post(
                url,
                {
                    transaction: {
                        kind: payload.kind,
                        status: payload.status,
                        amount: payload.amount,
                        currency: payload.currency,
                    },
                },
                {
                    headers: {
                        "X-Shopify-Access-Token": payload.accessToken,
                        "Content-Type": "application/json",
                    },
                }
            );

            return data;
        } catch (error) {
            console.log("🚀 ~ ShopService ~ capturePayment ~ error:", error.response?.data || error);
            throw new HttpException(
                error.response?.data?.errors || "Shopify Payment capture failed",
                error.status || HttpStatus.BAD_REQUEST,
            );
        }
    }

    //* Fulfill Order (Update Shipment Status)
    async fulfillOrder(payload: {
        shopId: string;
        accessToken: string;
        orderId: number;
        locationId: number;
        trackingNumber: string;
        trackingCompany: string;
        fulfillmentService: string;
        notifyCustomer: boolean;
        lineItems: { id: number; quantity: number }[];
    }) {
        try {
            const { shopUrl } = await this.getShopifyStoreUrl({
                shopId: payload.shopId,
                accessToken: payload.accessToken,
            });

            const url = `${shopUrl}/orders/fulfillments.json`;
            console.log("📦 Fulfilling Order →", url);

            const { data } = await this.httpService.axiosRef.post(
                url,
                {
                    fulfillment: {
                        order_id: payload.orderId,
                        location_id: payload.locationId,
                        tracking_number: payload.trackingNumber,
                        tracking_company: payload.trackingCompany,
                        notify_customer: payload.notifyCustomer,
                        fulfillment_service: payload.fulfillmentService,
                        line_items: payload.lineItems,
                    },
                },
                {
                    headers: {
                        "X-Shopify-Access-Token": payload.accessToken,
                        "Content-Type": "application/json",
                    },
                }
            );

            return data;
        } catch (error) {
            console.log("🚨 Shopify Order Fulfillment Error:", error.response?.data || error);
            throw new HttpException(
                error.response?.data?.errors || "Shopify Order Fulfillment creation failed",
                error.status || HttpStatus.BAD_REQUEST,
            );
        }
    }

    async requestShopifyFulfillment(payload: {
        shopId: string;
        accessToken: string;
        orderId: number;
        locationId?: number;
        trackingUrl?: string;
        trackingNumber?: string;
        trackingCompany?: string;
        notifyCustomer?: boolean;
        lineItems: { id: number }[];
    }) {
        try {
            const { shopUrl } = await this.getShopifyStoreUrl({
                shopId: payload.shopId,
                accessToken: payload.accessToken,
            });

            const url = `${shopUrl}/orders/${payload.orderId}/fulfillments.json`;

            const fulfillmentPayload = {
                fulfillment: {
                    line_items: payload.lineItems,
                    tracking_company: payload.trackingCompany || 'Manual Carrier',
                    tracking_number: payload.trackingNumber || 'N/A',
                    tracking_url: payload.trackingUrl || '',
                    notify_customer: payload.notifyCustomer ?? true,
                    location_id: payload.locationId,
                },
            };

            console.log('📦 Requesting Shopify Fulfillment →', url, fulfillmentPayload);

            const { data } = await this.httpService.axiosRef.post(url, fulfillmentPayload, {
                headers: {
                    'X-Shopify-Access-Token': payload.accessToken,
                    'Content-Type': 'application/json',
                },
            });

            console.log('✅ Fulfillment Response:', data);
            return data;
        } catch (error) {
            console.error('🚨 Shopify Fulfillment Error:', error.response?.data || error.message);
            throw new HttpException(
                error.response?.data?.errors || 'Shopify fulfillment request failed',
                error.response?.status || HttpStatus.BAD_REQUEST,
            );
        }
    }

    async updateShopifyFulfillmentStatus(payload: {
        shopId: string;
        accessToken: string;
        orderId: number;
        fulfillmentId: number;
        status: string;
        shipmentStatus: string;
        trackingNumber: string;
        trackingCompany?: string;
        trackingUrl?: string;
    }) {
        try {
            const { shopUrl } = await this.getShopifyStoreUrl({
                shopId: payload.shopId,
                accessToken: payload.accessToken,
            });

    const url = `${shopUrl}/orders/${payload.orderId}/fulfillments/${payload.fulfillmentId}.json`;

            const body = {
                fulfillment: {
                    status: payload.status,
                    shipment_status: payload.shipmentStatus,
                    tracking_number: payload.trackingNumber,
                    tracking_company: payload.trackingCompany || '',
                    tracking_url: payload.trackingUrl || '',
                },
            };

    console.log('📦 Updating Shopify Fulfillment →', url, body);

    const { data } = await this.httpService.axiosRef.put(url, body, {
      headers: {
        'X-Shopify-Access-Token': payload.accessToken,
        'Content-Type': 'application/json',
      },
    });

    console.log('✅ Shopify Fulfillment Updated:', data);
    return data;
  } catch (error) {
    console.error('🚨 Shopify Fulfillment Update Error:', error.response?.data || error.message);
    throw new HttpException(
      error.response?.data?.errors || 'Shopify fulfillment update failed',
      error.response?.status || HttpStatus.BAD_REQUEST,
    );
  }
}


    async getShopifyOrderFulfillment(payload: {
        shopId: string;
        accessToken: string;
        orderId: string | number;
    }) {
        try {
            const { shopUrl } = await this.getShopifyStoreUrl({ shopId: payload.shopId, accessToken: payload.accessToken });
            const url = `${shopUrl}/orders/${payload.orderId}/fulfillments.json`;

            console.log("🛍️ Updating Shopify Order Fulfillment →", url);

            const { data } = await this.httpService.axiosRef.get(
                url,
                {
                    headers: {
                        "X-Shopify-Access-Token": payload.accessToken,
                        "Content-Type": "application/json",
                    },
                }
            );

            return data;
        } catch (error) {
            console.log("🚨 Shopify Order Fulfillment Error:", error.response?.data || error);
            throw new HttpException(
                error.response?.data?.errors || "Shopify Order Fulfillment creation failed",
                error.status || HttpStatus.BAD_REQUEST,
            );
        }
    }

    async startAndSingleCompleteShopifyOrder(payload: {
        shopId: string;
        accessToken: string;
        order: CreateOrderDto;
        amount: string;
        locationId: number;
        lineItems: { id: number; quantity: number }[];
    }) {
        console.log("🛍️ Step 1: Create Order");
        const createdOrder = await this.createShopifyOrder({
            shopId: payload.shopId,
            accessToken: payload.accessToken,
            order: payload.order,
        });

        const orderId = createdOrder.order.id;

        console.log("💳 Step 2: Capture Payment");
        await this.capturePayment({
            shopId: payload.shopId,
            accessToken: payload.accessToken,
            orderId,
            amount: payload.amount,
            currency: "USD", // payload.order.currency,
            status: "success",
            kind: "sale",
        });

        console.log("🚚 Step 3: Fulfill Order");
        await this.fulfillOrder({
            shopId: payload.shopId,
            accessToken: payload.accessToken,
            orderId,
            locationId: payload.locationId,
            lineItems: payload.lineItems,
            trackingNumber: createdOrder.tracking_number || "N/A",
            trackingCompany: createdOrder.tracking_company || "N/A",
            notifyCustomer: createdOrder.notify_customer || true,
            fulfillmentService: createdOrder.fulfillment_service || "manual",
        });

        console.log("✅ Order Completed Successfully!");
        return { message: "Order completed", orderId };
    }


    // async updateShopifyOrder(payload: {
    //     shopId: string;
    //     accessToken: string;
    //     orderId: string | number;
    //     orderData: any;
    // }) {
    //     try {
    //         const { shopUrl } = await this.getShopifyStoreUrl({ shopId: payload.shopId, accessToken: payload.accessToken });
    //         const url = `${shopUrl}/orders/${payload.orderId}.json`;

    //         console.log("🛍️ Updating Shopify Order →", url);

    //         const { data } = await this.httpService.axiosRef.put(
    //             url,
    //             { order: payload.orderData },
    //             {
    //                 headers: {
    //                     "X-Shopify-Access-Token": payload.accessToken,
    //                     "Content-Type": "application/json",
    //                 },
    //             }
    //         );

    //         return data;
    //     } catch (error) {
    //         console.log("🚨 Shopify Order Error:", error.response?.data || error);
    //         throw new HttpException(
    //             error.response?.data?.errors || "Shopify Order creation failed",
    //             error.status || HttpStatus.BAD_REQUEST,
    //         );
    //     }
    // }


    async getShopifyOrderTransactions(payload: {
        shopId: string;
        accessToken: string;
        orderId: string | number;
    }) {
        try {
            const { shopUrl } = await this.getShopifyStoreUrl({ shopId: payload.shopId, accessToken: payload.accessToken });
            const url = `${shopUrl}/orders/${payload.orderId}/transactions.json`;

            console.log("🛍️ Updating Shopify Order Transactions →", url);

            const { data } = await this.httpService.axiosRef.get(
                url,
                {
                    headers: {
                        "X-Shopify-Access-Token": payload.accessToken,
                        "Content-Type": "application/json",
                    },
                }
            );

            return data;
        } catch (error) {
            console.log("🚨 Shopify Order Fulfillment Error:", error.response?.data || error);
            throw new HttpException(
                error.response?.data?.errors || "Shopify Order Fulfillment creation failed",
                error.status || HttpStatus.BAD_REQUEST,
            );
        }
    }

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

    /**
    * * Extracts next and previous page_info values from Shopify's Link header
    */
    private parseLinkHeader(linkHeader: string | undefined) {
        if (!linkHeader) return { nextPageInfo: null, prevPageInfo: null };

        const links = linkHeader.split(',');
        const pagination: any = {};

        for (const link of links) {
            const [urlPart, relPart] = link.split(';');
            const url = urlPart.trim().replace(/<(.*)>/, '$1');
            const rel = relPart.trim().replace(/rel="(.*)"/, '$1');
            const match = url.match(/page_info=([^&>]+)/);
            if (match && rel === 'next') pagination.nextPageInfo = match[1];
            if (match && rel === 'previous') pagination.prevPageInfo = match[1];
        }

        return pagination;
    }
}
