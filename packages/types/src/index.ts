export type Currency = 'SEK';

export interface CompanySummary {
  id: string;
  name: string;
  organizationNumber: string;
}

export interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export interface DashboardAction {
  id: string;
  title: string;
  description: string;
  href: string;
}

export interface DashboardActivity {
  id: string;
  title: string;
  description: string;
  occurredAt: string;
}

export interface DashboardMetrics {
  bookedPaymentsToday: number;
  activeClockedInEmployees: number;
  pendingReceipts: number;
}

export interface DashboardSnapshot {
  company: CompanySummary;
  user: UserProfile;
  metrics: DashboardMetrics;
  actions: DashboardAction[];
  activities: DashboardActivity[];
}

export interface Money {
  amount: number;
  currency: Currency;
}
