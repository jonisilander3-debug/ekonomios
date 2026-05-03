import { Injectable } from '@nestjs/common';

import { BackofficeOpsRepository } from './backoffice-ops.repository';
import { BackofficeWorkloadService } from './backoffice-workload.service';
import type { BackofficeRebalancePolicyRecord, BackofficeRebalanceSuggestion } from './backoffice-ops.types';
import type { BackofficeCase, BackofficeRole } from './backoffice.types';

@Injectable()
export class BackofficeRebalanceService {
  constructor(
    private readonly opsRepository: BackofficeOpsRepository,
    private readonly workloadService: BackofficeWorkloadService
  ) {}

  async listPolicies() {
    return this.opsRepository.listRebalancePolicies();
  }

  async savePolicy(input: import('./backoffice-ops.types').UpsertBackofficeRebalancePolicyInput) {
    return this.opsRepository.upsertRebalancePolicy(input);
  }

  async getSuggestions(cases: BackofficeCase[], role?: BackofficeRole) {
    const policies = await this.opsRepository.listRebalancePolicies();
    const workload = await this.workloadService.getWorkloadSnapshots(cases);
    const relevantPolicies = policies.filter((item) => !role || item.roleKey === role || !item.roleKey);

    const suggestions: BackofficeRebalanceSuggestion[] = [];

    for (const policy of relevantPolicies) {
      const overloaded = workload
        .filter((item) => (!policy.roleKey || item.primaryRole === policy.roleKey) && item.workloadScore >= policy.overloadThreshold)
        .sort((left, right) => right.workloadScore - left.workloadScore);
      const underloaded = workload
        .filter((item) => (!policy.roleKey || item.primaryRole === policy.roleKey) && item.workloadScore <= policy.underloadThreshold)
        .sort((left, right) => left.workloadScore - right.workloadScore);

      overloaded.forEach((busyAgent) => {
        const targetAgent = underloaded.find((item) => item.userId !== busyAgent.userId && item.primaryRole === busyAgent.primaryRole);
        if (!targetAgent) {
          return;
        }

        const candidateCase = cases.find(
          (item) =>
            item.assignedUserId === busyAgent.userId &&
            item.status !== 'resolved' &&
            item.status !== 'closed' &&
            (!policy.excludeWaitingForCustomer || item.status !== 'waiting_for_customer')
        );

        if (!candidateCase) {
          return;
        }

        suggestions.push({
          caseId: candidateCase.id,
          fromUserId: busyAgent.userId,
          fromUserName: busyAgent.fullName,
          toUserId: targetAgent.userId,
          toUserName: targetAgent.fullName,
          role: busyAgent.primaryRole,
          mode: policy.mode,
          reason: `${busyAgent.fullName} ligger over kapacitet medan ${targetAgent.fullName} har ledigt utrymme.`,
          isExecutable: policy.mode === 'auto'
        });
      });
    }

    return suggestions.slice(0, 12);
  }

  async resolvePolicy(role?: BackofficeRole): Promise<BackofficeRebalancePolicyRecord | null> {
    const policies = await this.opsRepository.listRebalancePolicies();
    return policies.find((item) => item.roleKey === role) ?? policies[0] ?? null;
  }
}
