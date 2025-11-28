// logs/error-logger.filter.ts
import {
    ArgumentsHost,
    Catch,
    ExceptionFilter,
    HttpException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ShopifyLogs } from 'src/shopify-logs/models/shopify-logs.model';
import { SHOPIFY_ALLOWED_ENDPOINTS } from './utils';

@Catch()
export class ShopifyErrorLoggerFilter implements ExceptionFilter {
    constructor(@InjectModel(ShopifyLogs.name) private readonly logsService: Model<ShopifyLogs>) { }

    async catch(exception: any, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const request = ctx.getRequest();
        const response = ctx.getResponse();
        const { url } = request;
        const normalizedUrl = url.replace(/^\/api/, '').replace(/\/$/, '');

        // Check if the endpoint is allowed
        const shouldLog = SHOPIFY_ALLOWED_ENDPOINTS.some(endpoint =>
            normalizedUrl === endpoint // exact match without trailing slash
        );

        const status =
            exception instanceof HttpException
                ? exception.getStatus()
                : 500;

        if (shouldLog) {
            const logs = new this.logsService({
                method: request.method,
                url: request.url,
                ip: request.ip,
                userAgent: request.headers['user-agent'],
                statusCode: status,
                error: {
                    message: exception.message,
                    stack: exception.stack,
                },
                type: 'error',
            });

            await logs.save()
        }

        response.status(status).json({
            statusCode: status,
            message: exception.message || 'Internal Server Error',
        });
    }
}
