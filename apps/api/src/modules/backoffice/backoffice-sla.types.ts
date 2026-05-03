import type { BackofficeTeamForecastInsight } from './backoffice-forecast.types';
import type { BackofficeCase, BackofficeCaseStatus, BackofficeCaseType, BackofficePriority, BackofficeRole } from './backoffice.types';

export type BackofficeSlaStatus = 'healthy' | 'warning' | 'breached' | 'paused' | 'resolved';
export type BackofficeSlaBreachReason =
  | 'first_response_overdue'
  | 'resolution_overdue'
  | 'waiting_for_customer'
  | 'no_active_rule'
  | 'none';

export interface BackofficeSlaRule {
  id: string;
  caseType: BackofficeCaseType;
  queueLabel: string;
  firstResponseTargetHours: number;
  resolutionTargetHours: number;
  warningThresholdHours: number;
}

export interface BackofficeSlaTimer {
  targetHours: number;
  elapsedHours: number;
  remainingHours: number;
  isBreached: boolean;
}

export interface BackofficeSlaState {
  caseId: string;
  policyId?: string;
  policyName?: string;
  status: BackofficeSlaStatus;
  breachReason: BackofficeSlaBreachReason;
  isPaused: boolean;
  firstResponse: BackofficeSlaTimer;
  resolution: BackofficeSlaTimer;
  warningThresholdHours: number;
  pausedAt?: string;
  pausedReason?: string;
}

export type BackofficeAssignmentMode = 'auto_user' | 'manual_user' | 'role_queue' | 'unassigned';

export interface BackofficeAssignmentCandidate {
  userId: string;
  fullName: string;
  role: BackofficeRole;
  score: number;
  openCases: number;
  highPriorityCases: number;
  breachedCases: number;
}

export interface BackofficeAssignmentDecision {
  caseId: string;
  assignedRole: BackofficeRole;
  assignedUserId?: string;
  assignedUserName?: string;
  mode: BackofficeAssignmentMode;
  reason: string;
  candidates: BackofficeAssignmentCandidate[];
}

export interface BackofficeWorkloadSnapshot {
  userId: string;
  fullName: string;
  primaryRole: BackofficeRole;
  openCases: number;
  highPriorityCases: number;
  breachedCases: number;
  waitingForCustomerCases: number;
  resolvedToday: number;
  workloadScore: number;
  capacityLabel: 'healthy' | 'busy' | 'overloaded';
  availabilityStatus?: 'available' | 'limited' | 'offline';
  dailyCapacityPoints?: number;
  weeklyCapacityPoints?: number;
  remainingCapacityPoints?: number;
  maxParallelCases?: number;
}

export interface BackofficeAgentPerformance {
  userId: string;
  fullName: string;
  role: BackofficeRole;
  openCases: number;
  resolvedCases: number;
  avgFirstResponseHours: number;
  avgResolutionHours: number;
  slaBreaches: number;
  escalations: number;
  reopenedCases: number;
  workloadScore: number;
  availabilityStatus?: 'available' | 'limited' | 'offline';
  dailyCapacityPoints?: number;
  remainingCapacityPoints?: number;
}

export interface BackofficeTeamDashboard {
  role: BackofficeRole;
  title: string;
  openCases: number;
  newToday: number;
  waitingForCustomer: number;
  slaAtRisk: number;
  slaBreached: number;
  resolvedThisWeek: number;
  totalWorkloadScore: number;
  totalCapacityPoints?: number;
  remainingCapacityPoints?: number;
  busiestAgents: BackofficeWorkloadSnapshot[];
  calmestAgents: BackofficeWorkloadSnapshot[];
}

export interface BackofficeOperationalCaseInsight {
  caseId: string;
  companyId: string;
  caseType: BackofficeCaseType;
  status: BackofficeCaseStatus;
  priority: BackofficePriority;
  assignedRole: BackofficeRole;
  assignedUserId?: string;
  assignedUserName?: string;
  sla: BackofficeSlaState;
  assignment: BackofficeAssignmentDecision;
  isRebalanceCandidate?: boolean;
  threadId?: string;
}

export interface BackofficeOperationsOverview {
  generatedAt: string;
  totalAtRisk: number;
  totalBreached: number;
  totalPaused: number;
  teamDashboards: BackofficeTeamDashboard[];
  agentPerformance: BackofficeAgentPerformance[];
  caseInsights: BackofficeOperationalCaseInsight[];
  rebalanceSuggestions?: Array<{
    caseId: string;
    fromUserId?: string;
    fromUserName?: string;
    toUserId: string;
    toUserName: string;
    role: BackofficeRole;
    mode: 'suggest' | 'auto';
    reason: string;
    isExecutable: boolean;
  }>;
  opsInsights?: Array<{
    id: string;
    level: 'info' | 'watch' | 'risk';
    title: string;
    summary: string;
    relatedRole?: BackofficeRole;
  }>;
  forecasts?: BackofficeTeamForecastInsight[];
}

export interface BackofficeSlaPolicy {
  role: BackofficeRole;
  rules: BackofficeSlaRule[];
}

export type BackofficeCaseWithMaybeResolved = BackofficeCase;
