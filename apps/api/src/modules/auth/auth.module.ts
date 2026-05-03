import { Controller, Get, Module } from '@nestjs/common';

@Controller('auth')
class AuthController {
  @Get('status')
  status() {
    return { module: 'auth', ready: true };
  }
}

@Module({
  controllers: [AuthController]
})
export class AuthModule {}
