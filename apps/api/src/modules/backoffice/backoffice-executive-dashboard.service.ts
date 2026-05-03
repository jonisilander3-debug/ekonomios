import { Injectable } from '@nestjs/common';

import { BackofficeForecastService } from './backoffice-forecast.service';
import { BackofficeMessageService } from './backoffice-message.service';
import type { BackofficeExecutiveDashboard } from './backoffice-forecast.types';
import type { BackofficeOperationsOverview } from './backoffice-sla.types';
import type { BackofficeCase } from './backoffice.types';

@Injectable()
export class BackofficeExecutiveDashboardService {
  constructor(
    private readonly forecastService: BackofficeForecastService,
    private readonly messageService: BackofficeMessageService
  ) {}

  async createDashboard(input: {
    cases: BackofficeCase[];
    overview: BackofficeOperationsOverview;
  }): Promise<BackofficeExecutiveDashboard> {
    const threads = await this.messageService.listThreads();
    const forecasts = await this.forecastService.getTeamForecasts({
      cases: input.cases,
      teams: input.overview.teamDashboards
    });
    const unreadExternalMessages = threads.reduce(
      (sum, thread) => sum + thread.messages.filter((message) => message.visibility === 'external' && message.status === 'unread').length,
      0
    );
    const outboundMessagesLastSevenDays = threads.reduce(
      (sum, thread) =>
        sum +
        thread.messages.filter(
          (message) =>
            message.direction === 'outbound' &&
            Date.now() - new Date(message.createdAt).getTime() <= 7 * 24 * 60 * 60 * 1000
        ).length,
      0
    );
    const inboundMessagesLastSevenDays = threads.reduce(
      (sum, thread) =>
        sum +
        thread.messages.filter(
          (message) =>
            message.direction === 'inbound' &&
            Date.now() - new Date(message.createdAt).getTime() <= 7 * 24 * 60 * 60 * 1000
        ).length,
      0
    );
    const openCases = input.cases.filter((item) => item.status !== 'resolved' && item.status !== 'closed');
    const waitingForCustomer = openCases.filter((item) => item.status === 'waiting_for_customer').length;
    const waitingForBackoffice = threads.filter((item) => item.status === 'waiting_for_backoffice').length;
    const autoAssignmentRate =
      input.overview.caseInsights.length === 0
        ? 0
        : Number(
            (
              input.overview.caseInsights.filter((item) => item.assignment.mode === 'auto_user').length /
              input.overview.caseInsights.length
            ).toFixed(2)
          );

    return {
      generatedAt: input.overview.generatedAt,
      totals: {
        openCases: openCases.length,
        waitingForCustomer,
        waitingForBackoffice,
        unreadExternalMessages,
        slaAtRisk: input.overview.totalAtRisk,
        slaBreached: input.overview.totalBreached,
        autoAssignmentRate,
        rebalanceSuggestionCount: input.overview.rebalanceSuggestions?.length ?? 0
      },
      teamSummaries: input.overview.teamDashboards.map((team) => {
        const forecast = forecasts.find((item) => item.role === team.role);
        const primaryWindow = forecast?.windows[1] ?? forecast?.windows[0];

        return {
          role: team.role,
          title: team.title,
          openCases: team.openCases,
          waitingForCustomer: team.waitingForCustomer,
          workloadScore: team.totalWorkloadScore,
          capacityPoints: team.totalCapacityPoints ?? 0,
          remainingCapacityPoints: team.remainingCapacityPoints ?? 0,
          slaAtRisk: team.slaAtRisk,
          slaBreached: team.slaBreached,
          forecastRisk: primaryWindow?.riskLevel ?? 'healthy'
        };
      }),
      messageFlow: {
        openThreads: threads.length,
        waitingForCustomerThreads: threads.filter((item) => item.status === 'waiting_for_customer').length,
        waitingForBackofficeThreads: threads.filter((item) => item.status === 'waiting_for_backoffice').length,
        unreadExternalMessages,
        outboundMessagesLastSevenDays,
        inboundMessagesLastSevenDays
      },
      topLoadDrivers: [
        {
          id: 'driver-open-cases',
          label: 'Oppna arenden',
          value: String(openCases.length),
          detail: 'Total mangd arbete som just nu ligger oppet i verksamheten.'
        },
        {
          id: 'driver-waiting-customer',
          label: 'Vantar pa kund',
          value: String(waitingForCustomer),
          detail: 'Arenden som stoppas av kunddialog eller saknat underlag.'
        },
        {
          id: 'driver-unread-messages',
          label: 'Olasta meddelanden',
          value: String(unreadExternalMessages),
          detail: 'Kundmeddelanden som fortfarande vantar pa lasning eller svar.'
        }
      ],
      forecasts
    };
  }
}
