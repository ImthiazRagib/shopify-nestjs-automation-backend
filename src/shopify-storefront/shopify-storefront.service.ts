import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class ShopifyStorefrontService {
  private readonly baseUrl = `https://${process.env.SHOPIFY_STOREFRONT_DOMAIN}/api/2025-04/graphql.json`;
  private readonly headers = {
    'Content-Type': 'application/json',
    'X-Shopify-Storefront-Access-Token': process.env.SHOPIFY_STOREFRONT_TOKEN,
  };

  /**
   * Fetch products from Storefront API
   */
  async getProducts(limit = 5) {
    const query = `
      query getProducts($limit: Int!) {
        products(first: $limit) {
          edges {
            node {
              id
              title
              handle
              description
              images(first: 3) {
                edges {
                  node {
                    url
                    altText
                  }
                }
              }
              variants(first: 2) {
                edges {
                  node {
                    id
                    title
                    price {
                      amount
                      currencyCode
                    }
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
        this.baseUrl,
        { query, variables: { limit } },
        { headers: this.headers },
      );
      return response.data.data.products.edges.map(edge => edge.node);
    } catch (error) {
      console.log("🚀 ~ ShopifyStorefrontService ~ getProducts ~ error:", error)
      console.error('Storefront API Error:', error.response?.data || error.message);
      throw new HttpException(
        error.response?.data || { message: 'Failed to fetch products' },
        error.response?.status || HttpStatus.BAD_REQUEST,
      );
    }
  }

  /**
   * Get a single product by handle
   */
  async getProductByHandle(handle: string) {
    const query = `
      query getProductByHandle($handle: String!) {
        product(handle: $handle) {
          id
          title
          description
          images(first: 5) {
            edges {
              node {
                url
                altText
              }
            }
          }
          variants(first: 5) {
            edges {
              node {
                id
                title
                price {
                  amount
                  currencyCode
                }
              }
            }
          }
        }
      }
    `;
    try {
      const response = await axios.post(
        this.baseUrl,
        { query, variables: { handle } },
        { headers: this.headers },
      );
      return response.data.data.product;
    } catch (error) {
      throw new HttpException(
        error.response?.data || { message: 'Failed to fetch product' },
        error.response?.status || HttpStatus.BAD_REQUEST,
      );
    }
  }
}