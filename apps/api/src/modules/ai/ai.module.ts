import { Controller, Get, Module } from '@nestjs/common';

@Controller('ai')
class AiController {
  @Get('insights')
  insights() {
    return [
      {
        title: 'Dagens läge',
        body: 'Vi har bokfört 4 betalningar idag. 3 personer är instämplade på aktiva projekt. 2 kvitton väntar på kontroll.'
      }
    ];
  }
}

@Module({
  controllers: [AiController]
})
export class AiModule {}
