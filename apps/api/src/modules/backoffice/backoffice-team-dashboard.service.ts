import { Injectable } from '@nestjs/common';

import { BackofficeCapacityService } from './backoffice-capacity.service';
import { BackofficeForecastService } from './backoffice-forecast.service';
import { BackofficeMessageService } from './backoffice-message.service';
import { BackofficeOpsAiService } from './backoffice-ops-ai.service';
import { BackofficeRebalanceService } from './backoffice-rebalance.service';
import { BackofficeAssignmentService } from './backoffice-assignment.service';
import { BackofficeSlaService } from './backoffice-sla.service';
import { BackofficeWorkloadService } from './backoffice-workload.service';
import type {
  BackofficeOperationsOverview,
  BackofficeOperationalCaseInsight,
  BackofficeTeamDashboard
} from './backoffice-sla.types';
import type { BackofficeCase, BackofficeRole } from './backoffice.types';

const ROLE_TITLES: Record<BackofficeRole, string> = {
  customer_support: 'Kundtjanst',
  accountant: 'Bokforingsteam',
  auditor: 'Revision',
  corporate_lawyer: 'Bolagsjuridik',
  tax_lawyer: 'Skattejuridik',
  admin_support: 'Admin / support'
};

@Injectable()
export class BackofficeTeamDashboardService {
  constructor(
    private readonly slaService: BackofficeSlaService,
    private readonly assignmentService: BackofficeAssignmentService,
    private readonly workloadService: BackofficeWorkloadService,
    private readonly capacityService: BackofficeCapacityService,
    private readonly forecastService: BackofficeForecastService,
    private readonly messageService: BackofficeMessageService,
    private readonly rebalanceService: BackofficeRebalanceService,
    private readonly opsAiService: BackofficeOpsAiService
  ) {}

  async getOperationsOverview(cases: BackofficeCase[], role?: BackofficeRole): Promise<BackofficeOperationsOverview> {
    await Promise.all(cases.map((item) => this.messageService.getOrCreateCaseThread(item)));
    const [threads, workload, performance, capacityProfiles, rebalanceSuggestions] = await Promise.all([
      this.messageService.listThreads(),
      this.workloadService.getWorkloadSnapshots(cases),
      this.workloadService.getAgentPerformance(cases),
      this.capacityService.listProfiles(),
      this.rebalanceService.getSuggestions(cases, role)
    ]);
    const threadByCaseId = new Map(
      threads.filter((item) => item.caseId).map((item) => [item.caseId as string, item.id] as const)
    );
    const rebalanceCandidateIds = new Set(rebalanceSuggestions.map((item) => item.caseId));
    const caseInsights = await Promise.all(
      cases.map(async (caseItem) => {
        const assignment = await this.assignmentService.decideAssignment(cases, caseItem, caseItem.assignedRole);
        const sla = await this.slaService.getCaseSlaState(caseItem);
        return {
          caseId: caseItem.id,
          companyId: caseItem.companyId,
          caseType: caseItem.caseType,
          status: caseItem.status,
          priority: caseItem.priority,
          assignedRole: caseItem.assignedRole,
          assignedUserId: caseItem.assignedUserId ?? assignment.assignedUserId,
          assignedUserName: assignment.assignedUserName,
          sla,
          assignment,
          isRebalanceCandidate: rebalanceCandidateIds.has(caseItem.id),
          threadId: threadByCaseId.get(caseItem.id)
        } satisfies BackofficeOperationalCaseInsight;
      })
    );
    const roles = role ? [role] : (Object.keys(ROLE_TITLES) as BackofficeRole[]);

    const teamDashboards = roles.map<BackofficeTeamDashboard>((roleKey) => {
      const teamCases = caseInsights.filter((item) => item.assignedRole === roleKey);
      const teamWorkload = workload.filter((item) => item.primaryRole === roleKey);
      const teamCapacityProfiles = capacityProfiles.filter((item) => item.roleKey === roleKey);
      const totalCapacityPoints = teamWorkload.reduce(
        (sum, item) => sum + (item.dailyCapacityPoints ?? 0),
        0
      ) || teamCapacityProfiles.reduce((sum, item) => sum + item.dailyCapacityPoints, 0);
      const remainingCapacityPoints = teamWorkload.reduce(
        (sum, item) => sum + (item.remainingCapacityPoints ?? 0),
        0
      );

      return {
        role: roleKey,
        title: ROLE_TITLES[roleKey],
        openCases: teamCases.filter((item) => item.status !== 'resolved' && item.status !== 'closed').length,
        newToday: teamCases.filter(
          (item) => item.status === 'new' && cases.find((caseEntry) => caseEntry.id === item.caseId)?.createdAt.slice(0, 10) === new Date().toISOString().slice(0, 10)
        ).length,
        waitingForCustomer: teamCases.filter((item) => item.status === 'waiting_for_customer').length,
        slaAtRisk: teamCases.filter((item) => item.sla.status === 'warning').length,
        slaBreached: teamCases.filter((item) => item.sla.status === 'breached').length,
        resolvedThisWeek: teamCases.filter((item) => {
          const resolvedAt = cases.find((caseEntry) => caseEntry.id === item.caseId)?.resolvedAt;
          if (!resolvedAt) {
            return false;
          }
          return new Date(resolvedAt).getTime() >= Date.now() - 7 * 24 * 60 * 60 * 1000;
        }).length,
        totalWorkloadScore: Number(teamWorkload.reduce((sum, item) => sum + item.workloadScore, 0).toFixed(1)),
        totalCapacityPoints: Number(totalCapacityPoints.toFixed(1)),
        remainingCapacityPoints: Number(remainingCapacityPoints.toFixed(1)),
        busiestAgents: [...teamWorkload].sort((left, right) => right.workloadScore - left.workloadScore).slice(0, 3),
        calmestAgents: [...teamWorkload].sort((left, right) => left.workloadScore - right.workloadScore).slice(0, 3)
      };
    });

    const forecasts = await this.forecastService.getTeamForecasts({
      cases,
      teams: teamDashboards,
      role
    });

    const overview: BackofficeOperationsOverview = {
      generatedAt: new Date().toISOString(),
      totalAtRisk: caseInsights.filter((item) => item.sla.status === 'warning').length,
      totalBreached: caseInsights.filter((item) => item.sla.status === 'breached').length,
      totalPaused: caseInsights.filter((item) => item.sla.status === 'paused').length,
      teamDashboards,
      agentPerformance: role ? performance.filter((item) => item.role === role) : performance,
      caseInsights,
      rebalanceSuggestions,
      forecasts
    };

    return {
      ...overview,
      opsInsights: this.opsAiService.createInsights({
        overview,
        threads
      })
    };
  }
}
