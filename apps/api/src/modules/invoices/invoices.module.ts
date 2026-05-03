import { Controller, Get, Module } from '@nestjs/common';

@Controller('invoices')
class InvoicesController {
  @Get()
  list() {
    return [{ id: 'invoice-1', invoiceNumber: '2026-1001', status: 'SENT' }];
  }
}

@Module({
  controllers: [InvoicesController]
})
export class InvoicesModule {}
