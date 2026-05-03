import { Controller, Get, Module } from '@nestjs/common';

@Controller('employees')
class EmployeesController {
  @Get()
  list() {
    return [{ id: 'employee-1001', employeeNumber: '1001', title: 'Driftledare' }];
  }
}

@Module({
  controllers: [EmployeesController]
})
export class EmployeesModule {}
