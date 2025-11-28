import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Observable, mergeMap } from 'rxjs';
import { ShopifyLogs } from 'src/shopify-logs/models/shopify-logs.model';
import { SHOPIFY_ALLOWED_ENDPOINTS, SHOPIFY_ALLOWED_METHODS } from './utils';

@Injectable()
export class ShopifyLogsResponseInterceptor implements NestInterceptor {
  constructor(
    @InjectModel(ShopifyLogs.name)
    private readonly shopifyLogsModel: Model<ShopifyLogs>,
  ) { }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url } = request;

    // Normalize URL: remove /api prefix and trailing slash
    const normalizedUrl = url.replace(/^\/api/, '').replace(/\/$/, '');

    // Check if the endpoint is allowed
    const endpointMatches = SHOPIFY_ALLOWED_ENDPOINTS.some(endpoint =>
      normalizedUrl === endpoint // exact match without trailing slash
    );

    // Optional method filtering
    const methodMatches = SHOPIFY_ALLOWED_METHODS
      ? SHOPIFY_ALLOWED_METHODS.includes(method)
      : true; // if no method restriction, allow all

    const shouldLog = endpointMatches && methodMatches;

    return next.handle().pipe(
      mergeMap(async (data: any) => {
        const formatted = {
          success: true,
          message: data?.message || 'Request successful',
          data: data?.data ?? data,
          timestamp: new Date().toISOString(),
        };

        if (shouldLog) {
          await this.shopifyLogsModel.create({
            type: 'success',
            method,
            url,
            ip: request.ip,
            userAgent: request.headers['user-agent'],
            statusCode: context.switchToHttp().getResponse().statusCode,
            response: formatted,
          });
        }

        return formatted;
      }),
    );
  }
}
