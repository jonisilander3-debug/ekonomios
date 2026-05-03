import { Injectable } from '@nestjs/common';

import { BackofficeOpsRepository } from './backoffice-ops.repository';
import type { BackofficeCapacityProfileRecord, UpsertBackofficeCapacityProfileInput } from './backoffice-ops.types';
import type { BackofficeRole } from './backoffice.types';

@Injectable()
export class BackofficeCapacityService {
  constructor(private readonly opsRepository: BackofficeOpsRepository) {}

  async listProfiles() {
    return this.opsRepository.listCapacityProfiles();
  }

  async saveProfile(input: UpsertBackofficeCapacityProfileInput) {
    return this.opsRepository.upsertCapacityProfile(input);
  }

  async resolveProfile(input: { userId?: string; role?: BackofficeRole; teamKey?: string }): Promise<BackofficeCapacityProfileRecord> {
    const profiles = await this.opsRepository.listCapacityProfiles();
    const resolved =
      (input.userId ? profiles.find((item) => item.userId === input.userId) : undefined) ??
      (input.teamKey ? profiles.find((item) => item.teamKey === input.teamKey) : undefined) ??
      (input.role ? profiles.find((item) => item.roleKey === input.role) : undefined);

    if (resolved) {
      return resolved;
    }

    return {
      id: `fallback-${input.userId ?? input.role ?? 'team'}`,
      userId: input.userId,
      roleKey: input.role,
      teamKey: input.teamKey,
      isActive: true,
      availabilityStatus: 'available',
      dailyCapacityPoints: 8,
      weeklyCapacityPoints: 40,
      maxParallelCases: 12,
      preferredQueueTypes: [],
      specialistCaseTypes: [],
      workTypeWeights: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }
}
