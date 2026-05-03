import { Controller, Get, Module } from '@nestjs/common';

@Controller('vat')
class VatController {
  @Get('codes')
  codes() {
    return [{ code: '25', description: 'Moms 25%' }];
  }
}

@Module({
  controllers: [VatController]
})
export class VatModule {}
