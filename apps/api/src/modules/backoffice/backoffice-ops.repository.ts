import { Injectable } from '@nestjs/common';
import { prisma } from '@ekonomi/db';

import type {
  AddBackofficeMessageInput,
  BackofficeCapacityProfileRecord,
  BackofficeMessageRecord,
  BackofficeRebalanceExecutionRecord,
  BackofficeRebalanceJobRecord,
  BackofficeRebalancePolicyRecord,
  BackofficeSlaPolicyRecord,
  BackofficeThreadDetails,
  BackofficeThreadObjectLinkRecord,
  BackofficeThreadParticipantRecord,
  BackofficeThreadRecord,
  CreateBackofficeRebalanceJobInput,
  CreateBackofficeThreadInput,
  CreateBackofficeThreadObjectLinkInput,
  RunBackofficeRebalanceJobInput,
  UpsertBackofficeCapacityProfileInput,
  UpsertBackofficeRebalancePolicyInput,
  UpsertBackofficeSlaPolicyInput
} from './backoffice-ops.types';
import type { BackofficeCaseType, BackofficePriority, BackofficeRole } from './backoffice.types';

function fromRoleKey(role?: string | null): BackofficeRole | undefined {
  if (role === 'CUSTOMER_SUPPORT') return 'customer_support';
  if (role === 'ACCOUNTANT') return 'accountant';
  if (role === 'AUDITOR') return 'auditor';
  if (role === 'CORPORATE_LAWYER') return 'corporate_lawyer';
  if (role === 'TAX_LAWYER') return 'tax_lawyer';
  if (role === 'ADMIN_SUPPORT') return 'admin_support';
  return undefined;
}

function toRoleKey(role?: BackofficeRole | null) {
  if (role === 'customer_support') return 'CUSTOMER_SUPPORT';
  if (role === 'accountant') return 'ACCOUNTANT';
  if (role === 'auditor') return 'AUDITOR';
  if (role === 'corporate_lawyer') return 'CORPORATE_LAWYER';
  if (role === 'tax_lawyer') return 'TAX_LAWYER';
  if (role === 'admin_support') return 'ADMIN_SUPPORT';
  return undefined;
}

function fromScopeType(scopeType: string): BackofficeSlaPolicyRecord['scopeType'] {
  return scopeType.toLowerCase() as BackofficeSlaPolicyRecord['scopeType'];
}

function toScopeType(scopeType: BackofficeSlaPolicyRecord['scopeType']) {
  return scopeType.toUpperCase() as 'SYSTEM_DEFAULT' | 'ROLE' | 'CASE_TYPE' | 'QUEUE_TYPE' | 'COMPANY' | 'CASE';
}

function fromAvailabilityStatus(status: string) {
  return status.toLowerCase() as BackofficeCapacityProfileRecord['availabilityStatus'];
}

function toAvailabilityStatus(status: BackofficeCapacityProfileRecord['availabilityStatus']) {
  return status.toUpperCase() as 'AVAILABLE' | 'LIMITED' | 'OFFLINE';
}

function fromThreadStatus(status: string) {
  return status.toLowerCase() as BackofficeThreadRecord['status'];
}

function toThreadStatus(status: BackofficeThreadRecord['status']) {
  return status.toUpperCase() as 'OPEN' | 'WAITING_FOR_CUSTOMER' | 'WAITING_FOR_BACKOFFICE' | 'RESOLVED';
}

function fromVisibility(value: string) {
  return value.toLowerCase() as BackofficeMessageRecord['visibility'];
}

function toVisibility(value: BackofficeMessageRecord['visibility']) {
  return value.toUpperCase() as 'INTERNAL' | 'EXTERNAL';
}

function fromDirection(value: string) {
  return value.toLowerCase() as BackofficeMessageRecord['direction'];
}

function toDirection(value: BackofficeMessageRecord['direction']) {
  return value.toUpperCase() as 'INBOUND' | 'OUTBOUND' | 'NOTE';
}

function fromMessageStatus(value: string) {
  return value.toLowerCase() as BackofficeMessageRecord['status'];
}

function toMessageStatus(value: BackofficeMessageRecord['status']) {
  return value.toUpperCase() as 'UNREAD' | 'READ' | 'SENT';
}

function fromRebalanceMode(value: string) {
  return value.toLowerCase() as BackofficeRebalancePolicyRecord['mode'];
}

function toRebalanceMode(value: BackofficeRebalancePolicyRecord['mode']) {
  return value.toUpperCase() as 'SUGGEST' | 'AUTO';
}

function fromRebalanceJobMode(value: string) {
  return value.toLowerCase() as BackofficeRebalanceJobRecord['mode'];
}

function toRebalanceJobMode(value: BackofficeRebalanceJobRecord['mode']) {
  return value.toUpperCase() as 'DRY_RUN' | 'SUGGEST' | 'EXECUTE';
}

function fromRebalanceJobStatus(value: string) {
  return value.toLowerCase() as BackofficeRebalanceJobRecord['status'];
}

function toRebalanceJobStatus(value: BackofficeRebalanceJobRecord['status']) {
  return value.toUpperCase() as 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED';
}

function fromExecutionStatus(value: string) {
  return value.toLowerCase() as BackofficeRebalanceExecutionRecord['status'];
}

function toExecutionStatus(value: BackofficeRebalanceExecutionRecord['status']) {
  return value.toUpperCase() as 'SUGGESTED' | 'EXECUTED' | 'SKIPPED';
}

function fromObjectLinkTargetType(value: string) {
  return value.toLowerCase() as BackofficeThreadObjectLinkRecord['targetType'];
}

function toObjectLinkTargetType(value: BackofficeThreadObjectLinkRecord['targetType']) {
  return value.toUpperCase() as
    | 'COMPANY'
    | 'CASE'
    | 'CUSTOMER'
    | 'PROJECT'
    | 'INVOICE'
    | 'VOUCHER'
    | 'RECEIPT'
    | 'PAYROLL_RUN'
    | 'DOCUMENT';
}

function toStringArray(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];
}

function toNumberRecord(value: unknown) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(value).filter((entry): entry is [string, number] => typeof entry[1] === 'number')
  );
}

function mapSlaPolicy(record: any): BackofficeSlaPolicyRecord {
  return {
    id: record.id,
    name: record.name,
    isActive: record.isActive,
    scopeType: fromScopeType(record.scopeType),
    roleKey: fromRoleKey(record.roleKey),
    caseType: record.caseType as BackofficeCaseType | undefined,
    queueType: record.queueType ?? undefined,
    companyId: record.companyId ?? undefined,
    caseExternalId: record.caseExternalId ?? undefined,
    serviceTier: record.serviceTier ?? undefined,
    firstResponseTargetHours: record.firstResponseTargetHours,
    resolutionTargetHours: record.resolutionTargetHours,
    warningThresholdHours: record.warningThresholdHours,
    pauseOnWaitingForCustomer: record.pauseOnWaitingForCustomer,
    priorityMultipliers: (record.priorityMultipliers as Record<string, number> | null) ?? undefined,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString()
  };
}

function mapCapacityProfile(record: any): BackofficeCapacityProfileRecord {
  return {
    id: record.id,
    userId: record.userId ?? undefined,
    roleKey: fromRoleKey(record.roleKey),
    teamKey: record.teamKey ?? undefined,
    isActive: record.isActive,
    availabilityStatus: fromAvailabilityStatus(record.availabilityStatus),
    dailyCapacityPoints: record.dailyCapacityPoints,
    weeklyCapacityPoints: record.weeklyCapacityPoints,
    maxParallelCases: record.maxParallelCases,
    preferredQueueTypes: toStringArray(record.preferredQueueTypes),
    specialistCaseTypes: toStringArray(record.specialistCaseTypes) as BackofficeCaseType[],
    workTypeWeights: toNumberRecord(record.workTypeWeights),
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString()
  };
}

function mapThread(record: any): BackofficeThreadRecord {
  return {
    id: record.id,
    companyId: record.companyId,
    companyName: record.company?.name ?? record.companyId,
    caseId: record.caseId ?? undefined,
    title: record.title,
    status: fromThreadStatus(record.status),
    priority: record.priority as BackofficePriority,
    sourceType: record.sourceType ?? undefined,
    sourceId: record.sourceId ?? undefined,
    lastMessageAt: record.lastMessageAt.toISOString(),
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString()
  };
}

function mapParticipant(record: any): BackofficeThreadParticipantRecord {
  return {
    id: record.id,
    threadId: record.threadId,
    userId: record.userId ?? undefined,
    roleKey: fromRoleKey(record.roleKey),
    participantType: record.participantType.toLowerCase(),
    displayName: record.displayName,
    email: record.email ?? record.user?.email ?? undefined,
    lastReadAt: record.lastReadAt?.toISOString(),
    isActive: record.isActive,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString()
  };
}

function mapMessage(record: any): BackofficeMessageRecord {
  return {
    id: record.id,
    threadId: record.threadId,
    senderUserId: record.senderUserId ?? undefined,
    senderRoleKey: fromRoleKey(record.senderRoleKey),
    visibility: fromVisibility(record.visibility),
    direction: fromDirection(record.direction),
    status: fromMessageStatus(record.status),
    body: record.body,
    metadata: (record.metadata as Record<string, string | number | boolean | null | undefined> | null) ?? undefined,
    authorIdentity: {
      userId: record.senderUserId ?? undefined,
      email: record.senderUser?.email ?? (typeof record.metadata?.senderEmail === 'string' ? record.metadata.senderEmail : undefined),
      displayName:
        record.senderUser
          ? `${record.senderUser.firstName ?? ''} ${record.senderUser.lastName ?? ''}`.trim()
          : typeof record.metadata?.senderDisplayName === 'string'
            ? record.metadata.senderDisplayName
            : record.senderRoleKey
              ? fromRoleKey(record.senderRoleKey) ?? 'Backoffice'
              : 'Kontakt',
      roleKey: fromRoleKey(record.senderRoleKey),
      participantType:
        record.senderUserId || record.senderRoleKey
          ? 'internal_user'
          : typeof record.metadata?.participantType === 'string'
            ? (record.metadata.participantType as BackofficeThreadParticipantRecord['participantType'])
            : 'customer_contact'
    },
    createdAt: record.createdAt.toISOString()
  };
}

function mapObjectLink(record: any): BackofficeThreadObjectLinkRecord {
  return {
    id: record.id,
    threadId: record.threadId,
    targetType: fromObjectLinkTargetType(record.targetType),
    targetId: record.targetId,
    label: record.label ?? undefined,
    href: record.href ?? undefined,
    isPrimary: record.isPrimary,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString()
  };
}

function mapRebalancePolicy(record: any): BackofficeRebalancePolicyRecord {
  return {
    id: record.id,
    name: record.name,
    isActive: record.isActive,
    mode: fromRebalanceMode(record.mode),
    roleKey: fromRoleKey(record.roleKey),
    overloadThreshold: Number(record.overloadThreshold),
    underloadThreshold: Number(record.underloadThreshold),
    maxMovesPerRun: record.maxMovesPerRun,
    excludeWaitingForCustomer: record.excludeWaitingForCustomer,
    rebalanceCooldownHours: record.rebalanceCooldownHours,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString()
  };
}

function mapRebalanceExecution(record: any): BackofficeRebalanceExecutionRecord {
  return {
    id: record.id,
    jobId: record.jobId,
    caseExternalId: record.caseExternalId,
    fromUserId: record.fromUserId ?? undefined,
    fromUserName: record.fromUser ? `${record.fromUser.firstName} ${record.fromUser.lastName}`.trim() : undefined,
    toUserId: record.toUserId ?? undefined,
    toUserName: record.toUser ? `${record.toUser.firstName} ${record.toUser.lastName}`.trim() : undefined,
    roleKey: fromRoleKey(record.roleKey),
    status: fromExecutionStatus(record.status),
    reason: record.reason,
    blocker: record.blocker ?? undefined,
    caseTitle: record.caseTitle ?? undefined,
    metadata: (record.metadata as Record<string, string | number | boolean | null | undefined> | null) ?? undefined,
    createdAt: record.createdAt.toISOString()
  };
}

function mapRebalanceJob(record: any): BackofficeRebalanceJobRecord {
  return {
    id: record.id,
    companyId: record.companyId ?? undefined,
    roleKey: fromRoleKey(record.roleKey),
    mode: fromRebalanceJobMode(record.mode),
    status: fromRebalanceJobStatus(record.status),
    triggerSource: record.triggerSource,
    triggeredByUserId: record.triggeredByUserId ?? undefined,
    triggeredByName: record.triggeredByUser ? `${record.triggeredByUser.firstName} ${record.triggeredByUser.lastName}`.trim() : undefined,
    dryRun: record.dryRun,
    analyzedCaseCount: record.analyzedCaseCount,
    suggestionCount: record.suggestionCount,
    executedMoveCount: record.executedMoveCount,
    skippedMoveCount: record.skippedMoveCount,
    warningCount: record.warningCount,
    errorMessage: record.errorMessage ?? undefined,
    metadata: (record.metadata as Record<string, string | number | boolean | null | undefined> | null) ?? undefined,
    startedAt: record.startedAt.toISOString(),
    finishedAt: record.finishedAt?.toISOString(),
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
    executions: Array.isArray(record.executions) ? record.executions.map(mapRebalanceExecution) : []
  };
}

@Injectable()
export class BackofficeOpsRepository {
  async listSlaPolicies() {
    const records = await prisma.backofficeSlaPolicy.findMany({
      where: { isActive: true },
      orderBy: [{ updatedAt: 'desc' }]
    });
    return records.map(mapSlaPolicy);
  }

  async upsertSlaPolicy(input: UpsertBackofficeSlaPolicyInput) {
    const record = input.id
      ? await prisma.backofficeSlaPolicy.update({
          where: { id: input.id },
          data: {
            name: input.name,
            isActive: input.isActive ?? true,
            scopeType: toScopeType(input.scopeType),
            roleKey: toRoleKey(input.roleKey),
            caseType: input.caseType,
            queueType: input.queueType,
            companyId: input.companyId,
            caseExternalId: input.caseExternalId,
            serviceTier: input.serviceTier,
            firstResponseTargetHours: input.firstResponseTargetHours,
            resolutionTargetHours: input.resolutionTargetHours,
            warningThresholdHours: input.warningThresholdHours,
            pauseOnWaitingForCustomer: input.pauseOnWaitingForCustomer ?? true,
            priorityMultipliers: input.priorityMultipliers as never
          }
        })
      : await prisma.backofficeSlaPolicy.create({
          data: {
            name: input.name,
            isActive: input.isActive ?? true,
            scopeType: toScopeType(input.scopeType),
            roleKey: toRoleKey(input.roleKey),
            caseType: input.caseType,
            queueType: input.queueType,
            companyId: input.companyId,
            caseExternalId: input.caseExternalId,
            serviceTier: input.serviceTier,
            firstResponseTargetHours: input.firstResponseTargetHours,
            resolutionTargetHours: input.resolutionTargetHours,
            warningThresholdHours: input.warningThresholdHours,
            pauseOnWaitingForCustomer: input.pauseOnWaitingForCustomer ?? true,
            priorityMultipliers: input.priorityMultipliers as never
          }
        });

    return mapSlaPolicy(record);
  }

  async listCapacityProfiles() {
    const records = await prisma.backofficeCapacityProfile.findMany({
      where: { isActive: true },
      orderBy: [{ updatedAt: 'desc' }]
    });
    return records.map(mapCapacityProfile);
  }

  async upsertCapacityProfile(input: UpsertBackofficeCapacityProfileInput) {
    const record = input.id
      ? await prisma.backofficeCapacityProfile.update({
          where: { id: input.id },
          data: {
            userId: input.userId,
            roleKey: toRoleKey(input.roleKey),
            teamKey: input.teamKey,
            isActive: input.isActive ?? true,
            availabilityStatus: toAvailabilityStatus(input.availabilityStatus),
            dailyCapacityPoints: input.dailyCapacityPoints,
            weeklyCapacityPoints: input.weeklyCapacityPoints,
            maxParallelCases: input.maxParallelCases,
            preferredQueueTypes: input.preferredQueueTypes as never,
            specialistCaseTypes: input.specialistCaseTypes as never,
            workTypeWeights: input.workTypeWeights as never
          }
        })
      : await prisma.backofficeCapacityProfile.create({
          data: {
            userId: input.userId,
            roleKey: toRoleKey(input.roleKey),
            teamKey: input.teamKey,
            isActive: input.isActive ?? true,
            availabilityStatus: toAvailabilityStatus(input.availabilityStatus),
            dailyCapacityPoints: input.dailyCapacityPoints,
            weeklyCapacityPoints: input.weeklyCapacityPoints,
            maxParallelCases: input.maxParallelCases,
            preferredQueueTypes: input.preferredQueueTypes as never,
            specialistCaseTypes: input.specialistCaseTypes as never,
            workTypeWeights: input.workTypeWeights as never
          }
        });

    return mapCapacityProfile(record);
  }

  async listThreads() {
    const records = await prisma.backofficeThread.findMany({
      include: {
        company: true,
        participants: { where: { isActive: true }, include: { user: true } },
        messages: { include: { senderUser: true }, orderBy: { createdAt: 'asc' } },
        objectLinks: { orderBy: [{ isPrimary: 'desc' }, { createdAt: 'asc' }] }
      },
      orderBy: [{ lastMessageAt: 'desc' }]
    });

    return records.map((record) => ({
      ...mapThread(record),
      participants: record.participants.map(mapParticipant),
      messages: record.messages.map(mapMessage),
      objectLinks: record.objectLinks.map(mapObjectLink)
    })) as BackofficeThreadDetails[];
  }

  async getThread(threadId: string) {
    const record = await prisma.backofficeThread.findUnique({
      where: { id: threadId },
      include: {
        company: true,
        participants: { where: { isActive: true }, include: { user: true } },
        messages: { include: { senderUser: true }, orderBy: { createdAt: 'asc' } },
        objectLinks: { orderBy: [{ isPrimary: 'desc' }, { createdAt: 'asc' }] }
      }
    });

    if (!record) {
      return null;
    }

    return {
      ...mapThread(record),
      participants: record.participants.map(mapParticipant),
      messages: record.messages.map(mapMessage),
      objectLinks: record.objectLinks.map(mapObjectLink)
    } satisfies BackofficeThreadDetails;
  }

  async getThreadByCaseId(caseId: string) {
    const record = await prisma.backofficeThread.findFirst({
      where: { caseId },
      include: {
        company: true,
        participants: { where: { isActive: true }, include: { user: true } },
        messages: { include: { senderUser: true }, orderBy: { createdAt: 'asc' } },
        objectLinks: { orderBy: [{ isPrimary: 'desc' }, { createdAt: 'asc' }] }
      },
      orderBy: { updatedAt: 'desc' }
    });

    if (!record) {
      return null;
    }

    return {
      ...mapThread(record),
      participants: record.participants.map(mapParticipant),
      messages: record.messages.map(mapMessage),
      objectLinks: record.objectLinks.map(mapObjectLink)
    } satisfies BackofficeThreadDetails;
  }

  async createThread(input: CreateBackofficeThreadInput) {
    const record = await prisma.backofficeThread.create({
      data: {
        companyId: input.companyId,
        caseId: input.caseId,
        title: input.title,
        status: toThreadStatus(input.status ?? 'open'),
        priority: input.priority,
        sourceType: input.sourceType,
        sourceId: input.sourceId,
        objectLinks: input.objectLinks?.length
          ? {
              create: input.objectLinks.map((link) => ({
                targetType: toObjectLinkTargetType(link.targetType),
                targetId: link.targetId,
                label: link.label,
                href: link.href,
                isPrimary: link.isPrimary ?? false
              }))
            }
          : undefined
      },
      include: {
        company: true,
        objectLinks: { orderBy: [{ isPrimary: 'desc' }, { createdAt: 'asc' }] }
      }
    });
    return {
      ...mapThread(record),
      participants: [],
      messages: [],
      objectLinks: record.objectLinks.map(mapObjectLink)
    } satisfies BackofficeThreadDetails;
  }

  async listCompanyProfilesBase(): Promise<
    Array<{
      companyId: string;
      companyName: string;
      organizationNumber: string;
      customerCount: number;
      projectCount: number;
      invoiceCount: number;
      receiptCount: number;
      voucherCount: number;
      payrollRunCount: number;
    }>
  > {
    const records = await prisma.company.findMany({
      include: {
        _count: {
          select: {
            customers: true,
            projects: true,
            invoices: true,
            receipts: true,
            vouchers: true,
            payrollRuns: true
          }
        }
      },
      orderBy: { name: 'asc' }
    });

    return records.map((record) => ({
      companyId: record.id,
      companyName: record.name,
      organizationNumber: record.organizationNumber,
      customerCount: record._count.customers,
      projectCount: record._count.projects,
      invoiceCount: record._count.invoices,
      receiptCount: record._count.receipts,
      voucherCount: record._count.vouchers,
      payrollRunCount: record._count.payrollRuns
    }));
  }

  async getCompanyProfileBase(companyId: string): Promise<{
    companyId: string;
    companyName: string;
    organizationNumber: string;
    customerCount: number;
    projectCount: number;
    invoiceCount: number;
    receiptCount: number;
    voucherCount: number;
    payrollRunCount: number;
  } | null> {
    const record = await prisma.company.findUnique({
      where: { id: companyId },
      include: {
        _count: {
          select: {
            customers: true,
            projects: true,
            invoices: true,
            receipts: true,
            vouchers: true,
            payrollRuns: true
          }
        }
      }
    });

    if (!record) {
      return null;
    }

    return {
      companyId: record.id,
      companyName: record.name,
      organizationNumber: record.organizationNumber,
      customerCount: record._count.customers,
      projectCount: record._count.projects,
      invoiceCount: record._count.invoices,
      receiptCount: record._count.receipts,
      voucherCount: record._count.vouchers,
      payrollRunCount: record._count.payrollRuns
    };
  }

  async listThreadsByCompany(companyId: string) {
    const records = await prisma.backofficeThread.findMany({
      where: { companyId },
      include: {
        company: true,
        participants: { where: { isActive: true }, include: { user: true } },
        messages: { include: { senderUser: true }, orderBy: { createdAt: 'asc' } },
        objectLinks: { orderBy: [{ isPrimary: 'desc' }, { createdAt: 'asc' }] }
      },
      orderBy: [{ lastMessageAt: 'desc' }]
    });

    return records.map((record) => ({
      ...mapThread(record),
      participants: record.participants.map(mapParticipant),
      messages: record.messages.map(mapMessage),
      objectLinks: record.objectLinks.map(mapObjectLink)
    })) as BackofficeThreadDetails[];
  }

  async getThreadForCompany(threadId: string, companyId: string) {
    const record = await prisma.backofficeThread.findFirst({
      where: { id: threadId, companyId },
      include: {
        company: true,
        participants: { where: { isActive: true }, include: { user: true } },
        messages: { include: { senderUser: true }, orderBy: { createdAt: 'asc' } },
        objectLinks: { orderBy: [{ isPrimary: 'desc' }, { createdAt: 'asc' }] }
      }
    });

    if (!record) {
      return null;
    }

    return {
      ...mapThread(record),
      participants: record.participants.map(mapParticipant),
      messages: record.messages.map(mapMessage),
      objectLinks: record.objectLinks.map(mapObjectLink)
    } satisfies BackofficeThreadDetails;
  }

  async addParticipant(input: {
    threadId: string;
    userId?: string;
    roleKey?: BackofficeRole;
    participantType: BackofficeThreadParticipantRecord['participantType'];
    displayName: string;
    email?: string;
  }) {
    const record = await prisma.backofficeThreadParticipant.create({
      data: {
        threadId: input.threadId,
        userId: input.userId,
        roleKey: toRoleKey(input.roleKey),
        participantType: input.participantType.toUpperCase() as 'INTERNAL_USER' | 'CUSTOMER_CONTACT' | 'SYSTEM',
        displayName: input.displayName,
        email: input.email
      }
    });
    return mapParticipant(record);
  }

  async addObjectLink(input: CreateBackofficeThreadObjectLinkInput) {
    if (input.isPrimary) {
      await prisma.backofficeThreadObjectLink.updateMany({
        where: { threadId: input.threadId, isPrimary: true },
        data: { isPrimary: false }
      });
    }

    const record = await prisma.backofficeThreadObjectLink.create({
      data: {
        threadId: input.threadId,
        targetType: toObjectLinkTargetType(input.targetType),
        targetId: input.targetId,
        label: input.label,
        href: input.href,
        isPrimary: input.isPrimary ?? false
      }
    });

    return mapObjectLink(record);
  }

  async listRebalanceJobs() {
    const records = await prisma.backofficeRebalanceJob.findMany({
      include: {
        triggeredByUser: true,
        executions: {
          include: {
            fromUser: true,
            toUser: true
          },
          orderBy: { createdAt: 'asc' }
        }
      },
      orderBy: [{ startedAt: 'desc' }]
    });

    return records.map(mapRebalanceJob);
  }

  async getRebalanceJob(jobId: string) {
    const record = await prisma.backofficeRebalanceJob.findUnique({
      where: { id: jobId },
      include: {
        triggeredByUser: true,
        executions: {
          include: {
            fromUser: true,
            toUser: true
          },
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    return record ? mapRebalanceJob(record) : null;
  }

  async createRebalanceJob(input: CreateBackofficeRebalanceJobInput) {
    const record = await prisma.backofficeRebalanceJob.create({
      data: {
        companyId: input.companyId,
        roleKey: toRoleKey(input.roleKey),
        mode: toRebalanceJobMode(input.mode),
        status: 'PENDING',
        triggerSource: input.triggerSource,
        triggeredByUserId: input.triggeredByUserId,
        dryRun: input.dryRun ?? input.mode === 'dry_run',
        metadata: input.metadata as never
      },
      include: {
        triggeredByUser: true,
        executions: true
      }
    });

    return mapRebalanceJob(record);
  }

  async updateRebalanceJob(
    jobId: string,
    input: Partial<Pick<BackofficeRebalanceJobRecord, 'status' | 'analyzedCaseCount' | 'suggestionCount' | 'executedMoveCount' | 'skippedMoveCount' | 'warningCount' | 'errorMessage' | 'finishedAt' | 'metadata'>>
  ) {
    const record = await prisma.backofficeRebalanceJob.update({
      where: { id: jobId },
      data: {
        status: input.status ? toRebalanceJobStatus(input.status) : undefined,
        analyzedCaseCount: input.analyzedCaseCount,
        suggestionCount: input.suggestionCount,
        executedMoveCount: input.executedMoveCount,
        skippedMoveCount: input.skippedMoveCount,
        warningCount: input.warningCount,
        errorMessage: input.errorMessage,
        finishedAt: input.finishedAt ? new Date(input.finishedAt) : undefined,
        metadata: input.metadata as never
      },
      include: {
        triggeredByUser: true,
        executions: {
          include: {
            fromUser: true,
            toUser: true
          },
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    return mapRebalanceJob(record);
  }

  async addRebalanceExecution(jobId: string, input: Omit<BackofficeRebalanceExecutionRecord, 'id' | 'jobId' | 'createdAt'>) {
    const record = await prisma.backofficeRebalanceExecution.create({
      data: {
        jobId,
        caseExternalId: input.caseExternalId,
        fromUserId: input.fromUserId,
        toUserId: input.toUserId,
        roleKey: toRoleKey(input.roleKey),
        status: toExecutionStatus(input.status),
        reason: input.reason,
        blocker: input.blocker,
        caseTitle: input.caseTitle,
        metadata: input.metadata as never
      },
      include: {
        fromUser: true,
        toUser: true
      }
    });

    return mapRebalanceExecution(record);
  }

  async addMessage(input: AddBackofficeMessageInput) {
    const record = await prisma.$transaction(async (tx) => {
      const created = await tx.backofficeMessage.create({
        data: {
          threadId: input.threadId,
          senderUserId: input.senderUserId,
          senderRoleKey: toRoleKey(input.senderRoleKey),
          visibility: toVisibility(input.visibility),
          direction: toDirection(input.direction),
          status: toMessageStatus(input.status ?? 'unread'),
          body: input.body,
          metadata: input.metadata as never
        }
      });

      await tx.backofficeThread.update({
        where: { id: input.threadId },
        data: {
          lastMessageAt: created.createdAt,
          status:
            input.visibility === 'external' && input.direction === 'outbound'
              ? 'WAITING_FOR_CUSTOMER'
              : input.visibility === 'external'
                ? 'WAITING_FOR_BACKOFFICE'
                : undefined
        }
      });

      return created;
    });

    return mapMessage(record);
  }

  async markThreadRead(threadId: string, userId?: string) {
    if (!userId) {
      return null;
    }

    const record = await prisma.backofficeThreadParticipant.updateMany({
      where: { threadId, userId, isActive: true },
      data: { lastReadAt: new Date() }
    });

    return record.count;
  }

  async markThreadReadByParticipantType(
    threadId: string,
    participantType: BackofficeThreadParticipantRecord['participantType']
  ) {
    const record = await prisma.backofficeThreadParticipant.updateMany({
      where: {
        threadId,
        participantType: participantType.toUpperCase() as 'INTERNAL_USER' | 'CUSTOMER_CONTACT' | 'SYSTEM',
        isActive: true
      },
      data: { lastReadAt: new Date() }
    });

    return record.count;
  }

  async listRebalancePolicies() {
    const records = await prisma.backofficeRebalancePolicy.findMany({
      where: { isActive: true },
      orderBy: [{ updatedAt: 'desc' }]
    });
    return records.map(mapRebalancePolicy);
  }

  async upsertRebalancePolicy(input: UpsertBackofficeRebalancePolicyInput) {
    const record = input.id
      ? await prisma.backofficeRebalancePolicy.update({
          where: { id: input.id },
          data: {
            name: input.name,
            isActive: input.isActive ?? true,
            mode: toRebalanceMode(input.mode),
            roleKey: toRoleKey(input.roleKey),
            overloadThreshold: input.overloadThreshold,
            underloadThreshold: input.underloadThreshold,
            maxMovesPerRun: input.maxMovesPerRun,
            excludeWaitingForCustomer: input.excludeWaitingForCustomer ?? true,
            rebalanceCooldownHours: input.rebalanceCooldownHours
          }
        })
      : await prisma.backofficeRebalancePolicy.create({
          data: {
            name: input.name,
            isActive: input.isActive ?? true,
            mode: toRebalanceMode(input.mode),
            roleKey: toRoleKey(input.roleKey),
            overloadThreshold: input.overloadThreshold,
            underloadThreshold: input.underloadThreshold,
            maxMovesPerRun: input.maxMovesPerRun,
            excludeWaitingForCustomer: input.excludeWaitingForCustomer ?? true,
            rebalanceCooldownHours: input.rebalanceCooldownHours
          }
        });

    return mapRebalancePolicy(record);
  }
}
