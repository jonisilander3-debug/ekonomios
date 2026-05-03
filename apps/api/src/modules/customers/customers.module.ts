import { Controller, Get, Module } from '@nestjs/common';

@Controller('customers')
class CustomersController {
  @Get()
  list() {
    return [
      { id: 'customer-1', name: 'Brf Solsidan' },
      { id: 'customer-2', name: 'Lindqvist Fastigheter' }
    ];
  }
}

@Module({
  controllers: [CustomersController]
})
export class CustomersModule {}
