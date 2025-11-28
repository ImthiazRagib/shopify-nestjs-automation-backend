import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ShopifyLogs } from './models/shopify-logs.model';
import { Model } from 'mongoose';

@Injectable()
export class ShopifyLogsService {
    constructor(
        @InjectModel(ShopifyLogs.name) private readonly shopifyLogsModel: Model<ShopifyLogs>,
    ) { }

    async create(data: Partial<ShopifyLogs>) {
        return this.shopifyLogsModel.create(data);
    }
}
