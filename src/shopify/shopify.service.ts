import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class ShopifyService {

    constructor(
        private readonly httpService: HttpService
    ) {
    }

    async getHttpResponse(endpoint: string, payload?: object, headers?: object) {
        const store = process.env.SHOPIFY_STORE;
        const version = process.env.SHOPIFY_API_VERSION;
        const baseUrl = `https://${store}.myshopify.com/admin/api/${version}`;
        headers = {
            ...headers,
            'X-Shopify-Access-Token': process.env.SHOPIFY_ADMIN_ACCESS_TOKEN,
            'Content-Type': 'application/json',
        };

        const response: any = await firstValueFrom(
            this.httpService.get(baseUrl as string),
        );

        return response.data
    }
    async getUsersShopifyProducts() {
        const products = await this.getHttpResponse('dummy')
        return products;
    }
    async getUsersShopifyOrders() { }

    async getProducts() {
        return await this.getUsersShopifyProducts()
        return [
            {
                id: 123456789,
                title: 'Sample Product 1',
                vendor: 'TestVendor',
                product_type: 'Widget',
                created_at: '2023-01-01T00:00:00Z',
                updated_at: '2023-01-02T00:00:00Z',
                variants: [
                    {
                        id: 987654321,
                        price: '19.99',
                        sku: 'DEMO-SKU-1',
                        inventory_quantity: 42,
                    },
                ],
                images: [
                    {
                        src: 'https://cdn.shopify.com/s/files/1/0000/0000/0001/products/sample1.jpg',
                    },
                ],
            },
            {
                id: 223456789,
                title: 'Sample Product 2',
                vendor: 'TestVendor',
                product_type: 'Gadget',
                created_at: '2023-01-03T00:00:00Z',
                updated_at: '2023-01-04T00:00:00Z',
                variants: [
                    {
                        id: 887654321,
                        price: '29.99',
                        sku: 'DEMO-SKU-2',
                        inventory_quantity: 7,
                    },
                ],
                images: [
                    {
                        src: 'https://cdn.shopify.com/s/files/1/0000/0000/0001/products/sample2.jpg',
                    },
                ],
            },
        ];
    }

    async getOrders() {
        return [
            {
                id: 123456789,
                email: 'customer@example.com',
                closed_at: null,
                created_at: '2023-01-05T12:34:56Z',
                updated_at: '2023-01-06T09:10:11Z',
                number: 1001,
                note: 'Please handle with care',
                token: 'order-token-123',
                gateway: 'shopify_payments',
                total_price: '59.99',
                subtotal_price: '49.99',
                total_weight: 500,
                total_tax: '5.00',
                taxes_included: true,
                currency: 'USD',
                financial_status: 'paid',
                confirmed: true,
                total_discounts: '0.00',
                total_line_items_price: '49.99',
                cart_token: 'cart-token-abc',
                buyer_accepts_marketing: true,
                name: '#1001',
                referring_site: '',
                landing_site: '/products/sample-product-1',
                cancelled_at: null,
                cancel_reason: null,
                total_price_usd: '59.99',
                checkout_token: 'checkout-token-xyz',
                reference: null,
                user_id: null,
                location_id: null,
                source_identifier: null,
                source_url: null,
                processed_at: '2023-01-05T12:34:56Z',
                device_id: null,
                phone: null,
                customer_locale: 'en',
                app_id: 123456,
                browser_ip: '192.168.1.1',
                landing_site_ref: null,
                order_number: 1001,
                discount_applications: [],
                discount_codes: [],
                note_attributes: [],
                payment_gateway_names: ['shopify_payments'],
                processing_method: 'direct',
                checkout_id: 987654321,
                source_name: 'web',
                fulfillment_status: null,
                tax_lines: [],
                tags: '',
                contact_email: 'customer@example.com',
                order_status_url: 'https://example.myshopify.com/orders/order-status-token',
                presentment_currency: 'USD',
                total_line_items_price_set: {
                    shop_money: { amount: '49.99', currency_code: 'USD' },
                    presentment_money: { amount: '49.99', currency_code: 'USD' },
                },
                total_discounts_set: {
                    shop_money: { amount: '0.00', currency_code: 'USD' },
                    presentment_money: { amount: '0.00', currency_code: 'USD' },
                },
                total_shipping_price_set: {
                    shop_money: { amount: '10.00', currency_code: 'USD' },
                    presentment_money: { amount: '10.00', currency_code: 'USD' },
                },
                subtotal_price_set: {
                    shop_money: { amount: '49.99', currency_code: 'USD' },
                    presentment_money: { amount: '49.99', currency_code: 'USD' },
                },
                total_price_set: {
                    shop_money: { amount: '59.99', currency_code: 'USD' },
                    presentment_money: { amount: '59.99', currency_code: 'USD' },
                },
                total_tax_set: {
                    shop_money: { amount: '5.00', currency_code: 'USD' },
                    presentment_money: { amount: '5.00', currency_code: 'USD' },
                },
                line_items: [
                    {
                        id: 111222333,
                        admin_graphql_api_id: 'gid://shopify/LineItem/111222333',
                        attributed_staffs: [],
                        current_quantity: 1,
                        fulfillable_quantity: 1,
                        fulfillment_service: 'manual',
                        fulfillment_status: null,
                        gift_card: false,
                        grams: 500,
                        name: 'Sample Product 1 - Default Title',
                        price: '49.99',
                        price_set: {
                            shop_money: { amount: '49.99', currency_code: 'USD' },
                            presentment_money: { amount: '49.99', currency_code: 'USD' },
                        },
                        product_exists: true,
                        product_id: 123456789,
                        properties: [],
                        quantity: 1,
                        requires_shipping: true,
                        sku: 'DEMO-SKU-1',
                        taxable: true,
                        title: 'Sample Product 1',
                        total_discount: '0.00',
                        total_discount_set: {
                            shop_money: { amount: '0.00', currency_code: 'USD' },
                            presentment_money: { amount: '0.00', currency_code: 'USD' },
                        },
                        variant_id: 987654321,
                        variant_inventory_management: 'shopify',
                        variant_title: 'Default Title',
                        vendor: 'TestVendor',
                        tax_lines: [],
                        duties: [],
                        discount_allocations: [],
                    },
                ],
                fulfillments: [],
                refunds: [],
                customer: {
                    id: 555555555,
                    email: 'customer@example.com',
                    created_at: '2023-01-01T00:00:00Z',
                    updated_at: '2023-01-02T00:00:00Z',
                    first_name: 'John',
                    last_name: 'Doe',
                    state: 'enabled',
                    note: null,
                    verified_email: true,
                    multipass_identifier: null,
                    tax_exempt: false,
                    phone: null,
                    email_marketing_consent: {
                        state: 'subscribed',
                        opt_in_level: 'single_opt_in',
                        consent_updated_at: '2023-01-01T00:00:00Z',
                    },
                    sms_marketing_consent: null,
                    tags: '',
                    currency: 'USD',
                    tax_exemptions: [],
                    admin_graphql_api_id: 'gid://shopify/Customer/555555555',
                    default_address: {
                        id: 777777777,
                        customer_id: 555555555,
                        first_name: 'John',
                        last_name: 'Doe',
                        company: null,
                        address1: '123 Main St',
                        address2: null,
                        city: 'Anytown',
                        province: 'CA',
                        country: 'US',
                        zip: '12345',
                        phone: null,
                        name: 'John Doe',
                        province_code: 'CA',
                        country_code: 'US',
                        country_name: 'United States',
                        default: true,
                    },
                },
            },
        ];
    }
}
