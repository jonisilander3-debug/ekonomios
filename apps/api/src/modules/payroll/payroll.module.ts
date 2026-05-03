import { Controller, Get, Module } from '@nestjs/common';

import { getPayrollStatusMessage } from '@ekonomi/business';

@Controller('payroll')
class PayrollController {
  @Get('runs')
  runs() {
    return [
      {
        id: 'payroll-run-1',
        status: 'DRAFT',
        message: getPayrollStatusMessage(false, 1)
      }
    ];
  }
}

@Module({
  controllers: [PayrollController]
})
export class PayrollModule {}
