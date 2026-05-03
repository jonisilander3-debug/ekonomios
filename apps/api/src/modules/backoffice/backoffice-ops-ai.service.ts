import { Injectable } from '@nestjs/common';

import type { BackofficeOpsInsight, BackofficeThreadDetails } from './backoffice-ops.types';
import type { BackofficeOperationsOverview } from './backoffice-sla.types';

@Injectable()
export class BackofficeOpsAiService {
  createInsights(input: {
    overview: BackofficeOperationsOverview;
    threads: BackofficeThreadDetails[];
  }): BackofficeOpsInsight[] {
    const insights: BackofficeOpsInsight[] = [];
    const busiestTeam = [...input.overview.teamDashboards].sort(
      (left, right) => right.totalWorkloadScore - left.totalWorkloadScore
    )[0];
    const lowestCapacityTeam = [...input.overview.teamDashboards]
      .filter((item) => typeof item.remainingCapacityPoints === 'number')
      .sort((left, right) => (left.remainingCapacityPoints ?? 0) - (right.remainingCapacityPoints ?? 0))[0];
    const stalledCustomerThreads = input.threads.filter(
      (item) => item.status === 'waiting_for_customer' && Date.now() - new Date(item.lastMessageAt).getTime() > 48 * 60 * 60 * 1000
    );
    const highestForecastRisk = input.overview.forecasts
      ?.flatMap((team) => team.windows.map((window) => ({ ...window, title: team.title })))
      .sort((left, right) => right.capacityRatio - left.capacityRatio)[0];

    if (input.overview.totalBreached > 0) {
      insights.push({
        id: 'ops-breached-sla',
        level: 'risk',
        title: 'SLA-brott kraver omedelbar uppfoljning',
        summary: `${input.overview.totalBreached} arenden har redan brutit SLA och bor lyftas idag.`
      });
    }

    if (busiestTeam) {
      insights.push({
        id: 'ops-busiest-team',
        level: busiestTeam.slaBreached > 0 ? 'risk' : 'watch',
        title: `${busiestTeam.title} ar mest belastat`,
        summary: `${busiestTeam.title} har workload ${busiestTeam.totalWorkloadScore} och ${busiestTeam.slaAtRisk} arenden i SLA-risk.`,
        relatedRole: busiestTeam.role
      });
    }

    if (stalledCustomerThreads.length > 0) {
      insights.push({
        id: 'ops-stalled-customer',
        level: 'watch',
        title: 'Kundsvar ligger stilla for lange',
        summary: `${stalledCustomerThreads.length} trader har vantat pa kundsvar langre an normalt.`
      });
    }

    if ((input.overview.rebalanceSuggestions?.length ?? 0) > 0) {
      insights.push({
        id: 'ops-rebalance',
        level: 'watch',
        title: 'Omfordelning kan minska risken idag',
        summary: `${input.overview.rebalanceSuggestions?.length ?? 0} case kan flyttas for att jamna ut belastning och SLA-risk.`
      });
    }

    if (lowestCapacityTeam && (lowestCapacityTeam.remainingCapacityPoints ?? 0) <= 2) {
      insights.push({
        id: 'ops-capacity',
        level: 'risk',
        title: `${lowestCapacityTeam.title} ar nara full kapacitet`,
        summary: `${lowestCapacityTeam.title} har bara ${lowestCapacityTeam.remainingCapacityPoints ?? 0} kapacitetspoang kvar idag.`
      });
    }

    if (highestForecastRisk && highestForecastRisk.capacityRatio >= 1) {
      insights.push({
        id: 'ops-forecast',
        level: highestForecastRisk.riskLevel === 'risk' ? 'risk' : 'watch',
        title: `${highestForecastRisk.title} riskerar backlog framover`,
        summary: `${highestForecastRisk.title} ligger pa ${highestForecastRisk.capacityRatio.toFixed(2)}x kapacitet inom ${highestForecastRisk.windowDays} dagar.`
      });
    }

    if (insights.length === 0) {
      insights.push({
        id: 'ops-calm',
        level: 'info',
        title: 'Laget ar stabilt',
        summary: 'Inga tydliga flaskhalsar eller SLA-brott sticker ut just nu.'
      });
    }

    return insights;
  }
}
