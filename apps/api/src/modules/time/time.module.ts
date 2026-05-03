import { Controller, Get, Module } from '@nestjs/common';

@Controller('time')
class TimeController {
  @Get()
  list() {
    return [{ id: 'time-1', minutes: 120 }, { id: 'time-2', minutes: 90 }];
  }
}

@Module({
  controllers: [TimeController]
})
export class TimeModule {}
