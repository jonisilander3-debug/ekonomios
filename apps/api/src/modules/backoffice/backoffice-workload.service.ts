import { Injectable } from '@nestjs/common';

import { BackofficeCapacityService } from './backoffice-capacity.service';
import { FALLBACK_BACKOFFICE_USERS } from './backoffice-role.defaults';
import { BackofficeRoleRepository } from './backoffice-role.repository';
import { BackofficeSlaService } from './backoffice-sla.service';
import type { BackofficeAgentPerformance, BackofficeWorkloadSnapshot } from './backoffice-sla.types';
import type { BackofficeCase, BackofficeRole } from './backoffice.types';

@Injectable()
export class BackofficeWorkloadService {
  constructor(
    private readonly roleRepository: BackofficeRoleRepository,
    private readonly slaService: BackofficeSlaService,
    private readonly capacityService: BackofficeCapacityService
  ) {}

  async getWorkloadSnapshots(cases: BackofficeCase[]) {
    const users = await this.listAssignableUsers();
    const profiles = await this.capacityService.listProfiles();

    return Promise.all(
      users.map<Promise<BackofficeWorkloadSnapshot>>(async (user) => {
        const assignedCases = cases.filter((item) => item.assignedUserId === user.userId && item.status !== 'closed');
        const slaStates = await Promise.all(assignedCases.map((item) => this.slaService.getCaseSlaState(item)));
        const breachedCases = slaStates.filter((item) => item.status === 'breached').length;
        const highPriorityCases = assignedCases.filter(
          (item) => item.priority === 'high' || item.priority === 'critical'
        ).length;
        const waitingForCustomerCases = assignedCases.filter((item) => item.status === 'waiting_for_customer').length;
        const resolvedToday = cases.filter(
          (item) =>
            item.assignedUserId === user.userId &&
            Boolean(item.resolvedAt) &&
            item.resolvedAt?.slice(0, 10) === new Date().toISOString().slice(0, 10)
        ).length;
        const profile =
          profiles.find((item) => item.userId === user.userId) ??
          (await this.capacityService.resolveProfile({
            userId: user.userId,
            role: user.primaryRole
          }));
        const baseWorkloadScore =
          assignedCases.length * 1 +
          highPriorityCases * 2.5 +
          breachedCases * 3 -
          waitingForCustomerCases * 0.4;
        const capacityFactor = profile.dailyCapacityPoints > 0 ? baseWorkloadScore / profile.dailyCapacityPoints : baseWorkloadScore;
        const workloadScore = Number(baseWorkloadScore.toFixed(1));
        const remainingCapacityPoints = Math.max(0, Number((profile.dailyCapacityPoints - baseWorkloadScore).toFixed(1)));
        const isOverParallelLimit = assignedCases.length >= profile.maxParallelCases;

        return {
          userId: user.userId,
          fullName: user.fullName,
          primaryRole: user.primaryRole,
          openCases: assignedCases.length,
          highPriorityCases,
          breachedCases,
          waitingForCustomerCases,
          resolvedToday,
          workloadScore,
          capacityLabel:
            profile.availabilityStatus === 'offline' || isOverParallelLimit || capacityFactor >= 1
              ? 'overloaded'
              : capacityFactor >= 0.65 || profile.availabilityStatus === 'limited'
                ? 'busy'
                : 'healthy',
          availabilityStatus: profile.availabilityStatus,
          dailyCapacityPoints: profile.dailyCapacityPoints,
          weeklyCapacityPoints: profile.weeklyCapacityPoints,
          remainingCapacityPoints,
          maxParallelCases: profile.maxParallelCases
        };
      })
    );
  }

  async getAgentPerformance(cases: BackofficeCase[]) {
    const users = await this.listAssignableUsers();
    const workloadSnapshots = await this.getWorkloadSnapshots(cases);

    return Promise.all(users.map<Promise<BackofficeAgentPerformance>>(async (user) => {
      const assignedCases = cases.filter((item) => item.assignedUserId === user.userId);
      const resolvedCases = assignedCases.filter((item) => item.status === 'resolved' || item.status === 'closed');
      const slaStates = await Promise.all(assignedCases.map((item) => this.slaService.getCaseSlaState(item)));
      const avgFirstResponseHours = assignedCases.length
        ? slaStates.reduce((sum, item) => sum + item.firstResponse.elapsedHours, 0) /
          assignedCases.length
        : 0;
      const avgResolutionHours = resolvedCases.length
        ? (await Promise.all(resolvedCases.map((item) => this.slaService.getCaseSlaState(item)))).reduce((sum, item) => sum + item.resolution.elapsedHours, 0) /
          resolvedCases.length
        : 0;
      const escalations = assignedCases.filter((item) => item.status === 'escalated').length;
      const reopenedCases = assignedCases.filter((item) => item.status === 'in_progress' && Boolean(item.resolvedAt)).length;
      const workload = workloadSnapshots.find((item) => item.userId === user.userId);

      return {
        userId: user.userId,
        fullName: user.fullName,
        role: user.primaryRole,
        openCases: assignedCases.filter((item) => item.status !== 'resolved' && item.status !== 'closed').length,
        resolvedCases: resolvedCases.length,
        avgFirstResponseHours: Number(avgFirstResponseHours.toFixed(1)),
        avgResolutionHours: Number(avgResolutionHours.toFixed(1)),
        slaBreaches: slaStates.filter((item) => item.status === 'breached').length,
        escalations,
        reopenedCases,
        workloadScore: workload?.workloadScore ?? 0,
        availabilityStatus: workload?.availabilityStatus,
        dailyCapacityPoints: workload?.dailyCapacityPoints,
        remainingCapacityPoints: workload?.remainingCapacityPoints
      };
    }));
  }

  private async listAssignableUsers() {
    const persistedUsers = await this.roleRepository.listUsersWithBackofficeAccess();
    const mappedPersisted = persistedUsers.map((user) => ({
      userId: user.id,
      fullName: `${user.firstName} ${user.lastName}`.trim(),
      primaryRole:
        user.backofficeRoleAssignments.find((assignment: { isPrimary: boolean; roleKey: BackofficeRole }) => assignment.isPrimary)?.roleKey ??
        user.backofficeRoleAssignments[0]?.roleKey ??
        'customer_support'
    }));
    const existingIds = new Set(mappedPersisted.map((item) => item.userId));
    const fallbackUsers = FALLBACK_BACKOFFICE_USERS.filter((item) => !existingIds.has(item.userId)).map((item) => ({
      userId: item.userId,
      fullName: item.fullName,
      primaryRole: item.primaryRole
    }));

    return [...mappedPersisted, ...fallbackUsers] as Array<{
      userId: string;
      fullName: string;
      primaryRole: BackofficeRole;
    }>;
  }
}
