import { Controller, Get, Module } from '@nestjs/common';

@Controller('diaries')
class DiariesController {
  @Get()
  list() {
    return [{ id: 'diary-1', title: 'Service utförd' }];
  }
}

@Module({
  controllers: [DiariesController]
})
export class DiariesModule {}
