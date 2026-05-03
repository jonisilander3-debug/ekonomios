import { Module } from '@nestjs/common';

import { BackofficeController } from './backoffice.controller';
import { BackofficeCapacityService } from './backoffice-capacity.service';
import { BackofficeCompanyProfileService } from './backoffice-company-profile.service';
import { BackofficeExecutiveDashboardService } from './backoffice-executive-dashboard.service';
import { BackofficeForecastService } from './backoffice-forecast.service';
import { BackofficeMessageService } from './backoffice-message.service';
import { BackofficeOpsAiService } from './backoffice-ops-ai.service';
import { BackofficeOpsRepository } from './backoffice-ops.repository';
import { BackofficeRealtimeService } from './backoffice-realtime.service';
import { BackofficeRebalanceJobService } from './backoffice-rebalance-job.service';
import { BackofficeRebalanceSchedulerService } from './backoffice-rebalance-scheduler.service';
import { BackofficeRebalanceService } from './backoffice-rebalance.service';
import { BackofficeAssignmentService } from './backoffice-assignment.service';
import { BackofficeRoleRepository } from './backoffice-role.repository';
import { BackofficeRepository } from './backoffice.repository';
import { BackofficeSlaPolicyService } from './backoffice-sla-policy.service';
import { BackofficeSlaService } from './backoffice-sla.service';
import { BackofficeService } from './backoffice.service';
import { BackofficeTeamDashboardService } from './backoffice-team-dashboard.service';
import { BackofficeWorkloadService } from './backoffice-workload.service';
import { WorkspaceRepository } from './workspace.repository';

@Module({
  controllers: [BackofficeController],
  providers: [
    BackofficeRepository,
    BackofficeRoleRepository,
    BackofficeOpsRepository,
    WorkspaceRepository,
    BackofficeSlaPolicyService,
    BackofficeCapacityService,
    BackofficeCompanyProfileService,
    BackofficeForecastService,
    BackofficeMessageService,
    BackofficeRebalanceJobService,
    BackofficeRebalanceSchedulerService,
    BackofficeRebalanceService,
    BackofficeRealtimeService,
    BackofficeOpsAiService,
    BackofficeSlaService,
    BackofficeWorkloadService,
    BackofficeAssignmentService,
    BackofficeTeamDashboardService,
    BackofficeExecutiveDashboardService,
    BackofficeService
  ],
  exports: [BackofficeService]
})
export class BackofficeModule {}
