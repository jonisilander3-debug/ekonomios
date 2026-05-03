import { Injectable } from '@nestjs/common';

import { BackofficeCapacityService } from './backoffice-capacity.service';
import { BackofficeWorkloadService } from './backoffice-workload.service';
import type { BackofficeAssignmentCandidate, BackofficeAssignmentDecision } from './backoffice-sla.types';
import type { BackofficeCase, BackofficeRole } from './backoffice.types';

@Injectable()
export class BackofficeAssignmentService {
  constructor(
    private readonly workloadService: BackofficeWorkloadService,
    private readonly capacityService: BackofficeCapacityService
  ) {}

  async decideAssignment(cases: BackofficeCase[], caseItem: BackofficeCase, role: BackofficeRole): Promise<BackofficeAssignmentDecision> {
    const workload = await this.workloadService.getWorkloadSnapshots(cases);
    const candidates = workload
      .filter((item) => item.primaryRole === role)
      .filter((item) => item.availabilityStatus !== 'offline')
      .filter((item) => item.openCases < (item.maxParallelCases ?? Number.MAX_SAFE_INTEGER))
      .sort((left, right) => {
        const remainingDelta = (right.remainingCapacityPoints ?? 0) - (left.remainingCapacityPoints ?? 0);
        if (remainingDelta !== 0) {
          return remainingDelta;
        }

        return left.workloadScore - right.workloadScore;
      })
      .map<BackofficeAssignmentCandidate>((item) => ({
        userId: item.userId,
        fullName: item.fullName,
        role: item.primaryRole,
        score: item.workloadScore,
        openCases: item.openCases,
        highPriorityCases: item.highPriorityCases,
        breachedCases: item.breachedCases
      }));

    const bestCandidate = candidates[0];

    if (!bestCandidate) {
      const fallbackProfile = await this.capacityService.resolveProfile({ role });
      return {
        caseId: caseItem.id,
        assignedRole: role,
        mode: 'role_queue',
        reason:
          fallbackProfile.availabilityStatus === 'offline'
            ? 'Teamet ar markerat som offline just nu. Arendet ligger kvar i rollkon.'
            : 'Ingen ledig handlaggare med ratt roll och kapacitet hittades just nu. Arendet ligger kvar i rollkon.',
        candidates: []
      };
    }

    const remainingCapacity = bestCandidate.userId
      ? workload.find((item) => item.userId === bestCandidate.userId)?.remainingCapacityPoints ?? 0
      : 0;

    return {
      caseId: caseItem.id,
      assignedRole: role,
      assignedUserId: bestCandidate.userId,
      assignedUserName: bestCandidate.fullName,
      mode: 'auto_user',
      reason:
        bestCandidate.breachedCases > 0
          ? `${bestCandidate.fullName} valdes trots viss belastning eftersom teamet saknade battre alternativ inom kapacitet.`
          : `${bestCandidate.fullName} valdes eftersom belastningen ar lagst och cirka ${Math.max(remainingCapacity, 0)} kapacitetspoang finns kvar i teamet just nu.`,
      candidates: candidates.slice(0, 5)
    };
  }
}
