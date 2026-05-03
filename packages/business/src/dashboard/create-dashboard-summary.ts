import type { DashboardMetrics, DashboardSnapshot } from '@ekonomi/types';

export function createDashboardSummary(
  userFirstName: string,
  metrics: DashboardMetrics
) {
  return `Välkommen ${userFirstName}. Vi har bokfört ${metrics.bookedPaymentsToday} betalningar idag. ${metrics.activeClockedInEmployees} personer är instämplade på aktiva projekt. ${metrics.pendingReceipts} kvitton väntar på kontroll.`;
}

export function toDashboardGreeting(snapshot: DashboardSnapshot) {
  return `Hej ${snapshot.user.firstName}, här är läget för ${snapshot.company.name}.`;
}
