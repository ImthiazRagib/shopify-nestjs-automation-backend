import { Controller, Logger, Post } from '@nestjs/common';
import { ShopifyCronJobService } from './shopify-cron-job.service';
import { Cron, CronExpression } from '@nestjs/schedule';

@Controller('cron-job/shopify')
export class ShopifyCronJobController {
    private readonly logger = new Logger(ShopifyCronJobController.name)
    constructor(private readonly cronService: ShopifyCronJobService) { }

    @Cron(CronExpression.EVERY_5_MINUTES)
    async handleCron() {
        this.logger.log('Starting order processing cron job...');

        const orders = await this.cronService.getPendingOrders();

        if (!orders.length) {
            this.logger.log('No pending orders found');
            return;
        }

        for (const order of orders) {
            await this.cronService.sendOrderToExternalAPI(order);
        }

        this.logger.log('Order processing cron job completed');
    }

    // @Post()
    // async triggerCron() {
    //     await this.handleCron();
    //     return { success: true, message: 'Cron job executed manually' };
    // }
}
