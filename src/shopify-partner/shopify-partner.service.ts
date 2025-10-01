// shopify-partner.service.ts
import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class ShopifyPartnerService {
  private readonly partnerApiUrl = `https://partners.shopify.com/api/${process.env.SHOPIFY_API_VERSION}/graphql.json`;
  private readonly headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${process.env.SHOPIFY_PARTNER_TOKEN}`,
  };

  async createStore(input: {
    name: string;
    shopDomain: string;
    userEmail: string;
    shopOwner: string;
    password: string;
    plan?: string;
  }) {
    const query = `
      mutation storeCreate($input: StoreCreateInput!) {
        storeCreate(input: $input) {
          shop {
            id
            name
            myshopifyDomain
          }
          userErrors {
            field
            message
          }
        }
      }
    `;

    const variables = {
      input: {
        ...input,
        plan: input.plan || 'partner_test', // default: dev store
      },
    };

    try {
      const res = await axios.post(
        this.partnerApiUrl,
        { query, variables },
        { headers: this.headers }
      );

      const result = res.data?.data?.storeCreate;

      if (result?.userErrors?.length) {
        throw new HttpException(
          { message: 'Shopify API Error', errors: result.userErrors },
          HttpStatus.BAD_REQUEST
        );
      }

      return {
        message: 'Store created successfully',
        shop: result.shop,
      };
    } catch (err) {
      console.error('Shopify Partner Error:', err.response?.data || err.message);
      throw new HttpException(
        err.response?.data || { message: 'Failed to create store' },
        err.response?.status || HttpStatus.BAD_REQUEST
      );
    }
  }

  /**
   * Get basic organization details
   */
  async getOrganizations() {
    const query = `
      query {
        organizations(first: 5) {
          edges {
            node {
              id
              name
              stores(first: 10) {
                edges {
                  node {
                    id
                    shopDomain
                    name
                    planName
                    createdAt
                  }
                }
              }
            }
          }
        }
      }
    `;

    try {
      const response = await axios.post(
        this.partnerApiUrl,
        { query },
        { headers: this.headers },
      );

      const data = response.data?.data?.organizations;
      return data || { message: 'No organizations found' };
    } catch (error) {
      console.error('Partner API error:', error.response?.data || error.message);
      throw new HttpException(
        error.response?.data || { message: 'Failed to fetch data' },
        error.response?.status || HttpStatus.BAD_REQUEST,
      );
    }
  }

  /**
   * Example: Get all apps in your Partner account
   */
  async getApps() {
    const query = `
      query {
        apps(first: 10) {
          edges {
            node {
              id
              title
              appType
              createdAt
            }
          }
        }
      }
    `;

    try {
      const response = await axios.post(
        this.partnerApiUrl,
        { query },
        { headers: this.headers },
      );
      return response.data?.data?.apps;
    } catch (error) {
      console.error('Error fetching apps:', error.response?.data || error.message);
      throw new HttpException(
        error.response?.data || { message: 'Failed to fetch apps' },
        error.response?.status || HttpStatus.BAD_REQUEST,
      );
    }
  }
}

