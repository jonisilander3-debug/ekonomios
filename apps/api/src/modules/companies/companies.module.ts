import { Controller, Get, Module } from '@nestjs/common';

@Controller('companies')
class CompaniesController {
  @Get()
  list() {
    return [{ id: 'company-main', name: 'Nordic Service Group AB' }];
  }
}

@Module({
  controllers: [CompaniesController]
})
export class CompaniesModule {}
