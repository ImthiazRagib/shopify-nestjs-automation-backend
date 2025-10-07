import { Controller, Get, Render } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) { }

  @Get('')
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('shopify-view')
  @Render('index')
  getHome() {
    return { name: 'Imthiaz' }; // 👈 passed to EJS
  }
}
