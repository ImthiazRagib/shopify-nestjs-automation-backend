import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class ShopifyStorefrontService {
  private readonly baseUrl = `https://${process.env.SHOPIFY_STOREFRONT_DOMAIN}/api/${process.env.SHOPIFY_API_VERSION}/graphql.json`;
  private readonly headers = {
    'Content-Type': 'application/json',
    'X-Shopify-Storefront-Access-Token': process.env.SHOPIFY_STOREFRONT_TOKEN,
  };

  /**
   * Fetch products from Storefront API
   */
  async getProducts(limit = 10) {
    const query = `
      query getProducts($limit: Int!) {
              shop {
          name
          description
          primaryDomain {
            url
            host
          }
          moneyFormat
          shipsToCountries
        }
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
          pageInfo {
            hasNextPage
            endCursor
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
          if (response.data.errors) throw new Error(JSON.stringify(response.data.errors));

      const { products, shop } = response.data.data;
      const items = products.edges.map((edge: any) => ({ cursor: edge.cursor, ...edge.node }));

      return {
        store: shop,
        products: items,
        totalCount: products.totalCount, // ! Not DONE
        hasNextPage: products.pageInfo.hasNextPage,
        nextCursor: products.pageInfo.endCursor,
      };
    } catch (error) {
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

  async getShopInfo() {
    const query = `
      {
        shop {
          name
          primaryDomain {
            url
          }
        }
      }
    `;

    const response = await axios.post(this.baseUrl, { query }, { headers: this.headers });
    return response.data;
  }

  /**
     * Search products with store info and images
     */
  async searchProducts(query: string, limit = 10, after: string = '', before: string = '') {
    // Choose direction based on after/before
    const paginationArgs = [
      'after: $after, before: $before,',
      before ? 'last: $limit' : 'first: $limit',
    ].filter(Boolean).join(' ');

    const gql = `
      query SearchProducts(
        $query: String!,
        $limit: Int!,
        $after: String,
        $before: String
      ) {
        # 🔹 Store Information
        shop {
          name
          description
          primaryDomain {
            url
            host
          }
          moneyFormat
          shipsToCountries
        }

        # 🔹 Product Search
        search(${paginationArgs}, query: $query) {
        totalCount   # ✅ Get total count of matching products
          edges {
            cursor
            node {
              ... on Product {
                id
                title
                handle
                description
                featuredImage {
                  url
                  altText
                }
                images(first: 5) {
                  edges {
                    node {
                      url
                      altText
                    }
                  }
                }
                variants(first: 3) {
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
          pageInfo {
            hasNextPage
            hasPreviousPage
            startCursor
            endCursor
          }
        }
      }
    `;

    const variables: Record<string, any> = {
      query,
      limit,
    };
    if (after) variables.after = after;
    if (before) variables.before = before;

    try {
      const res = await axios.post(
        this.baseUrl,
        {
          query: gql,
          variables,
        },
        { headers: this.headers },
      );

      if (res.data.errors) {
        throw new Error(JSON.stringify(res.data.errors));
      }

      const { shop, search } = res.data.data;
      const { edges, pageInfo } = search;

      const products = edges.map((edge) => ({
        cursor: edge.cursor,
        ...edge.node,
      }));

      return {
        store: shop,
        products,
        pagination: {
          hasNextPage: pageInfo.hasNextPage,
          hasPreviousPage: pageInfo.hasPreviousPage,
          nextCursor: pageInfo.endCursor,
          previousCursor: pageInfo.startCursor,
        },
      };
    } catch (error) {
      console.error('Storefront API search failed:', error.response?.data || error.message);
      throw new HttpException(
        error.response?.data || 'Failed to search products',
        error.response?.status || HttpStatus.BAD_REQUEST,
      );
    }
  }

  /**
   * Fetch public collections
   */
  async getPublicCollections(first = 5) {
    const gql = `
      query GetPublicCollections($first: Int!) {
        collections(first: $first) {
          edges {
            node {
              id
              title
              description
              handle
              image { url altText }
            }
          }
        }
      }
    `;

    try {
      const res = await axios.post(
        this.baseUrl,
        { query: gql, variables: { first } },
        { headers: this.headers },
      );

      if (res.data.errors) throw new Error(JSON.stringify(res.data.errors));

      return res.data.data.collections.edges.map((edge: any) => edge.node);
    } catch (error) {
      console.error('Tokenless collections fetch failed:', error.response?.data || error.message);
      throw new HttpException('Failed to fetch collections', HttpStatus.BAD_REQUEST);
    }
  }
}