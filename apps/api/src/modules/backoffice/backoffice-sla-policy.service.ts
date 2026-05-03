import { Injectable } from '@nestjs/common';

import { BackofficeOpsRepository } from './backoffice-ops.repository';
import { getBackofficeSlaRule } from './backoffice-sla.config';
import type { BackofficeSlaPolicyRecord, UpsertBackofficeSlaPolicyInput } from './backoffice-ops.types';
import type { BackofficeCase, BackofficeRole } from './backoffice.types';

@Injectable()
export class BackofficeSlaPolicyService {
  constructor(private readonly opsRepository: BackofficeOpsRepository) {}

  async listPolicies() {
    return this.opsRepository.listSlaPolicies();
  }

  async savePolicy(input: UpsertBackofficeSlaPolicyInput) {
    return this.opsRepository.upsertSlaPolicy(input);
  }

  async resolvePolicy(input: {
    caseItem: BackofficeCase;
    queueType?: string;
    role?: BackofficeRole;
    companyId?: string;
  }): Promise<BackofficeSlaPolicyRecord> {
    const policies = await this.opsRepository.listSlaPolicies();
    const resolved =
      policies.find((item) => item.scopeType === 'case' && item.caseExternalId === input.caseItem.id) ??
      policies.find((item) => item.scopeType === 'company' && item.companyId === (input.companyId ?? input.caseItem.companyId)) ??
      policies.find((item) => item.scopeType === 'role' && item.roleKey === (input.role ?? input.caseItem.assignedRole)) ??
      policies.find((item) => item.scopeType === 'queue_type' && item.queueType === input.queueType) ??
      policies.find((item) => item.scopeType === 'case_type' && item.caseType === input.caseItem.caseType) ??
      policies.find((item) => item.scopeType === 'system_default');

    if (resolved) {
      return resolved;
    }

    const fallback = getBackofficeSlaRule(input.caseItem.caseType);
    return {
      id: `fallback-${input.caseItem.caseType}`,
      name: `Standard ${input.caseItem.caseType}`,
      isActive: true,
      scopeType: 'system_default',
      firstResponseTargetHours: fallback.firstResponseTargetHours,
      resolutionTargetHours: fallback.resolutionTargetHours,
      warningThresholdHours: fallback.warningThresholdHours,
      pauseOnWaitingForCustomer: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }
}
