import type { BackofficeRole } from './backoffice.types';

export type BackofficeForecastWindow = 1 | 3 | 5 | 7;
export type BackofficeForecastRisk = 'healthy' | 'watch' | 'risk';

export interface BackofficeInfluxEstimate {
  averageNewCasesPerDay: number;
  averageMessagesPerDay: number;
  waitingForCustomerReleaseRate: number;
}

export interface BackofficeCapacityForecast {
  windowDays: BackofficeForecastWindow;
  predictedIncomingCases: number;
  predictedResolvedCases: number;
  projectedOpenCases: number;
  capacityRatio: number;
  expectedSlaRiskCases: number;
  riskLevel: BackofficeForecastRisk;
}

export interface BackofficeTeamForecastInsight {
  role: BackofficeRole;
  title: string;
  influx: BackofficeInfluxEstimate;
  windows: BackofficeCapacityForecast[];
  summary: string;
}

export interface BackofficeExecutiveDashboard {
  generatedAt: string;
  totals: {
    openCases: number;
    waitingForCustomer: number;
    waitingForBackoffice: number;
    unreadExternalMessages: number;
    slaAtRisk: number;
    slaBreached: number;
    autoAssignmentRate: number;
    rebalanceSuggestionCount: number;
  };
  teamSummaries: Array<{
    role: BackofficeRole;
    title: string;
    openCases: number;
    waitingForCustomer: number;
    workloadScore: number;
    capacityPoints: number;
    remainingCapacityPoints: number;
    slaAtRisk: number;
    slaBreached: number;
    forecastRisk: BackofficeForecastRisk;
  }>;
  messageFlow: {
    openThreads: number;
    waitingForCustomerThreads: number;
    waitingForBackofficeThreads: number;
    unreadExternalMessages: number;
    outboundMessagesLastSevenDays: number;
    inboundMessagesLastSevenDays: number;
  };
  topLoadDrivers: Array<{
    id: string;
    label: string;
    value: string;
    detail: string;
  }>;
  forecasts: BackofficeTeamForecastInsight[];
}
