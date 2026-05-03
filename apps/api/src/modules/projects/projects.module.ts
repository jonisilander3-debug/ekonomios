import { Controller, Get, Module } from '@nestjs/common';

@Controller('projects')
class ProjectsController {
  @Get()
  list() {
    return [{ id: 'project-1', name: 'Varservice ventilation', status: 'ACTIVE' }];
  }
}

@Module({
  controllers: [ProjectsController]
})
export class ProjectsModule {}
