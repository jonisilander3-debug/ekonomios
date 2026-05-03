import { Controller, Get, Module } from '@nestjs/common';

@Controller('receipts')
class ReceiptsController {
  @Get()
  list() {
    return [
      { id: 'receipt-1', status: 'PENDING_REVIEW' },
      { id: 'receipt-2', status: 'PENDING_REVIEW' }
    ];
  }
}

@Module({
  controllers: [ReceiptsController]
})
export class ReceiptsModule {}
