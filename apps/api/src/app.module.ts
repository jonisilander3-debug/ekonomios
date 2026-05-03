import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { HealthModule } from './common/health/health.module';
import { AiModule } from './modules/ai/ai.module';
import { AuthModule } from './modules/auth/auth.module';
import { BackofficeModule } from './modules/backoffice/backoffice.module';
import { BookkeepingModule } from './modules/bookkeeping/bookkeeping.module';
import { CompaniesModule } from './modules/companies/companies.module';
import { CustomersModule } from './modules/customers/customers.module';
import { DiariesModule } from './modules/diaries/diaries.module';
import { EmployeesModule } from './modules/employees/employees.module';
import { InvoicesModule } from './modules/invoices/invoices.module';
import { PayrollModule } from './modules/payroll/payroll.module';
import { ProjectsModule } from './modules/projects/projects.module';
import { ReceiptsModule } from './modules/receipts/receipts.module';
import { TimeModule } from './modules/time/time.module';
import { UsersModule } from './modules/users/users.module';
import { VatModule } from './modules/vat/vat.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    HealthModule,
    AuthModule,
    BackofficeModule,
    CompaniesModule,
    UsersModule,
    EmployeesModule,
    CustomersModule,
    ProjectsModule,
    TimeModule,
    DiariesModule,
    InvoicesModule,
    ReceiptsModule,
    BookkeepingModule,
    VatModule,
    PayrollModule,
    AiModule
  ]
})
export class AppModule {}
