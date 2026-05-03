import { Controller, Get, Module } from '@nestjs/common';

@Controller('bookkeeping')
class BookkeepingController {
  @Get('vouchers')
  vouchers() {
    return [{ id: 'voucher-1', series: 'A', number: 1 }];
  }
}

@Module({
  controllers: [BookkeepingController]
})
export class BookkeepingModule {}
