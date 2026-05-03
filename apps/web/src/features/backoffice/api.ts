import type {
  BackofficeAuditLogEntry,
  BackofficeCase,
  BackofficeCaseSourceContext,
  BackofficeCaseDetails,
  BackofficeCompanyProfileRecord,
  BackofficeCapacityProfile,
  BackofficeExecutiveDashboard,
  BackofficeOperationsOverview,
  BackofficeOpenCasesSummary,
  BackofficePermissionKey,
  BackofficePriority,
  BackofficeRebalanceJob,
  BackofficeRebalancePolicy,
  BackofficeRole,
  BackofficeRoleContext,
  BackofficeRuleUpdateCandidate,
  BackofficeSlaPolicy,
  BackofficeThread,
  BackofficeRuleValue,
  BackofficeUserAccessProfile
} from './types';

export const BACKOFFICE_API_BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000/api').replace(/\/$/, '');

function createQuery(params: Record<string, string | undefined>) {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value) {
      query.set(key, value);
    }
  });

  const serialized = query.toString();
  return serialized ? `?${serialized}` : '';
}

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${BACKOFFICE_API_BASE_URL}${path}`, {
    cache: 'no-store',
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {})
    },
    ...init
  });

  if (!response.ok) {
    throw new Error(`Backoffice API returned ${response.status}.`);
  }

  return response.json() as Promise<T>;
}

export async function getBackofficeCases(params?: {
  role?: BackofficeRole;
  userId?: string;
  escalated?: boolean;
}) {
  return requestJson<BackofficeCase[]>(
    `/backoffice/cases${createQuery({
      role: params?.role,
      userId: params?.userId,
      escalated: params?.escalated ? 'true' : undefined
    })}`
  );
}

export async function getBackofficeCase(caseId: string) {
  return requestJson<BackofficeCaseDetails>(`/backoffice/cases/${caseId}`);
}

export async function createBackofficeCase(input: {
  caseType: 'rule_update_request';
  sourceType: 'rule';
  sourceId: string;
  companyId: string;
  customerId?: string;
  projectId?: string;
  priority?: BackofficePriority;
  assignedRole?: BackofficeRole;
  assignedUserId?: string;
  createdByType: 'ai' | 'user' | 'system';
  confidenceScore?: number;
  title: string;
  description: string;
  sourceContext?: BackofficeCaseSourceContext;
}) {
  return requestJson<BackofficeCaseDetails>('/backoffice/cases', {
    method: 'POST',
    body: JSON.stringify(input)
  });
}

export async function getBackofficeOpenSummary() {
  return requestJson<BackofficeOpenCasesSummary>('/backoffice/cases/summary/open');
}

export async function getBackofficeOperationsOverview(role?: BackofficeRole) {
  return requestJson<BackofficeOperationsOverview>(
    `/backoffice/operations/overview${createQuery({
      role
    })}`
  );
}

export async function getBackofficeExecutiveDashboard() {
  return requestJson<BackofficeExecutiveDashboard>('/backoffice/operations/executive');
}

export async function getBackofficeCompanyProfiles(role?: BackofficeRole) {
  return requestJson<BackofficeCompanyProfileRecord[]>(`/backoffice/company-profiles${createQuery({ role })}`);
}

export async function getBackofficeCompanyProfile(companyId: string, role?: BackofficeRole) {
  return requestJson<BackofficeCompanyProfileRecord>(`/backoffice/company-profiles/${companyId}${createQuery({ role })}`);
}

export async function getBackofficeSlaPolicies() {
  return requestJson<BackofficeSlaPolicy[]>('/backoffice/sla-policies');
}

export async function saveBackofficeSlaPolicy(
  input: {
    id?: string;
    name: string;
    isActive: boolean;
    scopeType: BackofficeSlaPolicy['scopeType'];
    roleKey?: BackofficeRole;
    caseType?: BackofficeSlaPolicy['caseType'];
    queueType?: string;
    companyId?: string;
    caseExternalId?: string;
    serviceTier?: string;
    firstResponseTargetHours: number;
    resolutionTargetHours: number;
    warningThresholdHours: number;
    pauseOnWaitingForCustomer: boolean;
    priorityMultipliers?: Partial<Record<BackofficePriority, number>>;
  }
) {
  return requestJson<BackofficeSlaPolicy>('/backoffice/sla-policies', {
    method: 'POST',
    body: JSON.stringify(input)
  });
}

export async function getBackofficeCapacityProfiles() {
  return requestJson<BackofficeCapacityProfile[]>('/backoffice/capacity-profiles');
}

export async function saveBackofficeCapacityProfile(
  input: {
    id?: string;
    userId?: string;
    roleKey?: BackofficeRole;
    teamKey?: string;
    isActive: boolean;
    availabilityStatus: BackofficeCapacityProfile['availabilityStatus'];
    dailyCapacityPoints: number;
    weeklyCapacityPoints: number;
    maxParallelCases: number;
    preferredQueueTypes: string[];
    specialistCaseTypes: BackofficeCapacityProfile['specialistCaseTypes'];
    workTypeWeights: Record<string, number>;
  }
) {
  return requestJson<BackofficeCapacityProfile>('/backoffice/capacity-profiles', {
    method: 'POST',
    body: JSON.stringify(input)
  });
}

export async function getBackofficeRebalancePolicies() {
  return requestJson<BackofficeRebalancePolicy[]>('/backoffice/rebalance-policies');
}

export async function getBackofficeRebalanceJobs() {
  return requestJson<BackofficeRebalanceJob[]>('/backoffice/rebalance-jobs');
}

export async function getBackofficeRebalanceJob(jobId: string) {
  return requestJson<BackofficeRebalanceJob>(`/backoffice/rebalance-jobs/${jobId}`);
}

export async function runBackofficeRebalanceJob(input: {
  companyId?: string;
  roleKey?: BackofficeRole;
  mode: 'dry_run' | 'suggest' | 'execute';
  triggeredByUserId?: string;
  dryRun?: boolean;
}) {
  return requestJson<BackofficeRebalanceJob>('/backoffice/rebalance-jobs/run', {
    method: 'POST',
    body: JSON.stringify(input)
  });
}

export async function saveBackofficeRebalancePolicy(
  input: {
    id?: string;
    name: string;
    isActive: boolean;
    mode: BackofficeRebalancePolicy['mode'];
    roleKey?: BackofficeRole;
    overloadThreshold: number;
    underloadThreshold: number;
    maxMovesPerRun: number;
    excludeWaitingForCustomer: boolean;
    rebalanceCooldownHours: number;
  }
) {
  return requestJson<BackofficeRebalancePolicy>('/backoffice/rebalance-policies', {
    method: 'POST',
    body: JSON.stringify(input)
  });
}

export async function getBackofficeThreads(params?: { companyId?: string }) {
  return requestJson<BackofficeThread[]>(
    `/backoffice/threads${createQuery({
      companyId: params?.companyId
    })}`
  );
}

export async function getBackofficeThread(threadId: string) {
  return requestJson<BackofficeThread>(`/backoffice/threads/${threadId}`);
}

export async function getBackofficeThreadByCase(caseId: string) {
  return requestJson<BackofficeThread>(`/backoffice/threads/by-case/${caseId}`);
}

export async function getCustomerPortalThreads(companyId: string) {
  return requestJson<BackofficeThread[]>(`/backoffice/customer-threads${createQuery({ companyId })}`);
}

export async function getCustomerPortalThread(threadId: string, companyId: string) {
  return requestJson<BackofficeThread>(`/backoffice/customer-threads/${threadId}${createQuery({ companyId })}`);
}

export async function addBackofficeThreadMessage(
  threadId: string,
  input: {
    senderUserId?: string;
    senderEmail?: string;
    senderDisplayName?: string;
    senderRoleKey?: BackofficeRole;
    visibility: 'internal' | 'external';
    direction: 'inbound' | 'outbound' | 'note';
    status?: 'unread' | 'read' | 'sent';
    body: string;
    metadata?: Record<string, string | number | boolean | null | undefined>;
  }
) {
  return requestJson<BackofficeThread>(`/backoffice/threads/${threadId}/messages`, {
    method: 'POST',
    body: JSON.stringify(input)
  });
}

export async function markBackofficeThreadRead(threadId: string, userId?: string) {
  return requestJson<number | null>(`/backoffice/threads/${threadId}/read`, {
    method: 'POST',
    body: JSON.stringify({ userId })
  });
}

export async function addCustomerPortalThreadMessage(
  threadId: string,
  input: {
    companyId: string;
    body: string;
    senderUserId?: string;
    senderEmail?: string;
    senderDisplayName?: string;
  }
) {
  return requestJson<BackofficeThread>(`/backoffice/customer-threads/${threadId}/messages`, {
    method: 'POST',
    body: JSON.stringify(input)
  });
}

export async function markCustomerPortalThreadRead(threadId: string, companyId: string) {
  return requestJson<number | null>(`/backoffice/customer-threads/${threadId}/read`, {
    method: 'POST',
    body: JSON.stringify({ companyId })
  });
}

export async function getBackofficeAuditLog() {
  return requestJson<BackofficeAuditLogEntry[]>('/backoffice/audit-log');
}

export async function getBackofficeRuleUpdateCandidates() {
  return requestJson<BackofficeRuleUpdateCandidate[]>('/backoffice/rule-update-candidates');
}

export async function dismissBackofficeRuleUpdateCandidate(candidateId: string) {
  return requestJson<BackofficeRuleUpdateCandidate>(`/backoffice/rule-update-candidates/${candidateId}/dismiss`, {
    method: 'POST'
  });
}

export async function convertBackofficeRuleUpdateCandidate(candidateId: string) {
  return requestJson<{
    candidate: BackofficeRuleUpdateCandidate;
    caseDetails: BackofficeCaseDetails;
  }>(`/backoffice/rule-update-candidates/${candidateId}/convert`, {
    method: 'POST'
  });
}

export async function getBackofficeRules() {
  return requestJson<BackofficeRuleValue[]>('/backoffice/rules');
}

export async function getBackofficeRule(ruleId: string) {
  return requestJson<BackofficeRuleValue>(`/backoffice/rules/${ruleId}`);
}

export async function getBackofficeActiveRule(ruleKey: string, date?: string) {
  return requestJson<BackofficeRuleValue | null>(
    `/backoffice/rules/active${createQuery({
      ruleKey,
      date
    })}`
  );
}

export async function getBackofficeActiveRules(ruleKeys: string[], date?: string) {
  if (ruleKeys.length === 0) {
    return [];
  }

  return requestJson<BackofficeRuleValue[]>(
    `/backoffice/rules/active-many${createQuery({
      ruleKeys: ruleKeys.join(','),
      date
    })}`
  );
}

export async function createBackofficeRule(input: {
  ruleKey: string;
  category: BackofficeRuleValue['category'];
  value: string;
  validFrom: string;
  validTo?: string;
  description: string;
  updatedByUserId: string;
  sourceCaseId?: string;
}) {
  return requestJson<BackofficeRuleValue>('/backoffice/rules', {
    method: 'POST',
    body: JSON.stringify(input)
  });
}

export async function updateBackofficeRule(
  ruleId: string,
  input: {
    value?: string;
    validFrom?: string;
    validTo?: string;
    description?: string;
    updatedByUserId: string;
    sourceCaseId?: string;
  }
) {
  return requestJson<BackofficeRuleValue>(`/backoffice/rules/${ruleId}`, {
    method: 'PATCH',
    body: JSON.stringify(input)
  });
}

export async function assignBackofficeCase(caseId: string, input: {
  assignedRole: BackofficeRole;
  assignedUserId?: string;
  actorUserId?: string;
}) {
  return requestJson<BackofficeCaseDetails>(`/backoffice/cases/${caseId}/assign`, {
    method: 'POST',
    body: JSON.stringify(input)
  });
}

export async function escalateBackofficeCase(caseId: string, input: {
  toRole: BackofficeRole;
  escalatedByUserId?: string;
  reason?: string;
}) {
  return requestJson<BackofficeCaseDetails>(`/backoffice/cases/${caseId}/escalate`, {
    method: 'POST',
    body: JSON.stringify(input)
  });
}

export async function resolveBackofficeCase(caseId: string, input?: {
  actorUserId?: string;
  resolutionNote?: string;
}) {
  return requestJson<BackofficeCaseDetails>(`/backoffice/cases/${caseId}/resolve`, {
    method: 'POST',
    body: JSON.stringify(input ?? {})
  });
}

export async function closeBackofficeCase(caseId: string, input?: {
  actorUserId?: string;
  closeNote?: string;
}) {
  return requestJson<BackofficeCaseDetails>(`/backoffice/cases/${caseId}/close`, {
    method: 'POST',
    body: JSON.stringify(input ?? {})
  });
}

export async function markBackofficeCaseWaitingForCustomer(caseId: string, input?: {
  actorUserId?: string;
  note?: string;
}) {
  return requestJson<BackofficeCaseDetails>(`/backoffice/cases/${caseId}/waiting-for-customer`, {
    method: 'POST',
    body: JSON.stringify(input ?? {})
  });
}

export async function addBackofficeCaseComment(caseId: string, input: {
  authorUserId: string;
  authorRole: BackofficeRole;
  body: string;
  isInternal: boolean;
}) {
  return requestJson(`/backoffice/cases/${caseId}/comments`, {
    method: 'POST',
    body: JSON.stringify(input)
  });
}

export async function getBackofficeRoleContext(params?: {
  userId?: string;
  email?: string;
  fallbackRole?: BackofficeRole;
}) {
  return requestJson<BackofficeRoleContext>(
    `/backoffice/role-context${createQuery({
      userId: params?.userId,
      email: params?.email,
      fallbackRole: params?.fallbackRole
    })}`
  );
}

export async function getBackofficeRoleUsers() {
  return requestJson<BackofficeUserAccessProfile[]>('/backoffice/role-users');
}

export async function updateBackofficeRoleUser(
  userId: string,
  input: {
    primaryRole?: BackofficeRole;
    roles: BackofficeRole[];
    grantedPermissions?: BackofficePermissionKey[];
    deniedPermissions?: BackofficePermissionKey[];
    department?: string;
    actorUserId?: string;
  }
) {
  return requestJson<BackofficeUserAccessProfile>(`/backoffice/role-users/${userId}`, {
    method: 'PUT',
    body: JSON.stringify(input)
  });
}

export function filterBackofficeCases(
  cases: BackofficeCase[],
  filters: {
    status?: string;
    priority?: string;
    caseType?: string;
  }
) {
  return cases.filter((item) => {
    if (filters.status && filters.status !== 'alla' && item.status !== filters.status) {
      return false;
    }

    if (filters.priority && filters.priority !== 'alla' && item.priority !== filters.priority) {
      return false;
    }

    if (filters.caseType && filters.caseType !== 'alla' && item.caseType !== filters.caseType) {
      return false;
    }

    return true;
  });
}

export function sortBackofficeCases(cases: BackofficeCase[]) {
  return [...cases].sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));
}

export function getPriorityTone(priority: BackofficePriority) {
  if (priority === 'critical') {
    return 'bg-stone-900 text-white';
  }

  if (priority === 'high') {
    return 'bg-[#ece6dd] text-stone-800';
  }

  if (priority === 'medium') {
    return 'bg-stone-100 text-stone-700';
  }

  return 'bg-stone-50 text-stone-500';
}
