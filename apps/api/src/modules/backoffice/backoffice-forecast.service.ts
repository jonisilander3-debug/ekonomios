import { Injectable } from '@nestjs/common';

import { BackofficeCapacityService } from './backoffice-capacity.service';
import { BackofficeMessageService } from './backoffice-message.service';
import type {
  BackofficeCapacityForecast,
  BackofficeForecastRisk,
  BackofficeForecastWindow,
  BackofficeInfluxEstimate,
  BackofficeTeamForecastInsight
} from './backoffice-forecast.types';
import type { BackofficeTeamDashboard } from './backoffice-sla.types';
import type { BackofficeCase, BackofficeRole } from './backoffice.types';

const FORECAST_WINDOWS: BackofficeForecastWindow[] = [1, 3, 5, 7];

const ROLE_TITLES: Record<BackofficeRole, string> = {
  customer_support: 'Kundtjanst',
  accountant: 'Bokforing',
  auditor: 'Revision',
  corporate_lawyer: 'Bolagsjuridik',
  tax_lawyer: 'Skattejuridik',
  admin_support: 'Admin / support'
};

function toRiskLevel(capacityRatio: number, expectedSlaRiskCases: number): BackofficeForecastRisk {
  if (capacityRatio >= 1.15 || expectedSlaRiskCases >= 5) {
    return 'risk';
  }

  if (capacityRatio >= 0.85 || expectedSlaRiskCases >= 2) {
    return 'watch';
  }

  return 'healthy';
}

@Injectable()
export class BackofficeForecastService {
  constructor(
    private readonly capacityService: BackofficeCapacityService,
    private readonly messageService: BackofficeMessageService
  ) {}

  async getTeamForecasts(input: {
    cases: BackofficeCase[];
    teams: BackofficeTeamDashboard[];
    role?: BackofficeRole;
  }): Promise<BackofficeTeamForecastInsight[]> {
    const threads = await this.messageService.listThreads();
    const profiles = await this.capacityService.listProfiles();
    const visibleTeams = input.role ? input.teams.filter((team) => team.role === input.role) : input.teams;

    return visibleTeams.map((team) => {
      const teamCases = input.cases.filter((item) => item.assignedRole === team.role);
      const recentCases = teamCases.filter(
        (item) => Date.now() - new Date(item.createdAt).getTime() <= 14 * 24 * 60 * 60 * 1000
      );
      const recentResolved = teamCases.filter(
        (item) =>
          item.resolvedAt && Date.now() - new Date(item.resolvedAt).getTime() <= 14 * 24 * 60 * 60 * 1000
      );
      const teamThreads = threads.filter((item) => teamCases.some((caseItem) => caseItem.id === item.caseId));
      const activeProfiles = profiles.filter((item) => item.isActive && item.roleKey === team.role);
      const averageNewCasesPerDay = recentCases.length / 14;
      const averageMessagesPerDay =
        teamThreads.reduce((sum, thread) => sum + thread.messages.length, 0) / Math.max(1, 14);
      const waitingForCustomerReleaseRate =
        teamCases.length === 0
          ? 0
          : teamCases.filter((item) => item.status === 'waiting_for_customer').length / Math.max(1, teamCases.length);
      const dailyCapacityPoints =
        team.totalCapacityPoints ||
        activeProfiles.reduce((sum, item) => sum + item.dailyCapacityPoints, 0) ||
        Math.max(6, team.busiestAgents.length * 4);
      const dailyResolvedRate = recentResolved.length / 14 || Math.max(1, dailyCapacityPoints / 4);
      const openCases = team.openCases;

      const influx: BackofficeInfluxEstimate = {
        averageNewCasesPerDay: Number(averageNewCasesPerDay.toFixed(1)),
        averageMessagesPerDay: Number(averageMessagesPerDay.toFixed(1)),
        waitingForCustomerReleaseRate: Number(waitingForCustomerReleaseRate.toFixed(2))
      };

      const windows = FORECAST_WINDOWS.map<BackofficeCapacityForecast>((windowDays) => {
        const predictedIncomingCases = Math.round(averageNewCasesPerDay * windowDays);
        const predictedResolvedCases = Math.round(
          Math.min(openCases + predictedIncomingCases, dailyResolvedRate * windowDays)
        );
        const projectedOpenCases = Math.max(0, openCases + predictedIncomingCases - predictedResolvedCases);
        const capacityRatio =
          dailyCapacityPoints === 0 ? projectedOpenCases : projectedOpenCases / Math.max(1, dailyCapacityPoints);
        const expectedSlaRiskCases = Math.round(
          Math.max(team.slaAtRisk, projectedOpenCases * (0.12 + waitingForCustomerReleaseRate * 0.1))
        );

        return {
          windowDays,
          predictedIncomingCases,
          predictedResolvedCases,
          projectedOpenCases,
          capacityRatio: Number(capacityRatio.toFixed(2)),
          expectedSlaRiskCases,
          riskLevel: toRiskLevel(capacityRatio, expectedSlaRiskCases)
        };
      });

      const primaryWindow = windows[1] ?? windows[0]!;

      return {
        role: team.role,
        title: ROLE_TITLES[team.role],
        influx,
        windows,
        summary:
          primaryWindow.riskLevel === 'risk'
            ? `${ROLE_TITLES[team.role]} riskerar hog belastning inom ${primaryWindow.windowDays} dagar.`
            : primaryWindow.riskLevel === 'watch'
              ? `${ROLE_TITLES[team.role]} bor foljas upp nara de kommande ${primaryWindow.windowDays} dagarna.`
              : `${ROLE_TITLES[team.role]} ser ut att klara inflodet de kommande ${primaryWindow.windowDays} dagarna.`
      };
    });
  }
}
