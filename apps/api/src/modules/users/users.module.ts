import { Controller, Get, Module } from '@nestjs/common';

@Controller('users')
class UsersController {
  @Get('me')
  me() {
    return {
      id: 'user-1',
      firstName: 'Anders',
      lastName: 'Larsson',
      role: 'OWNER'
    };
  }
}

@Module({
  controllers: [UsersController]
})
export class UsersModule {}
