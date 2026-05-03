import { Injectable } from '@nestjs/common';

import { BackofficeOpsRepository } from './backoffice-ops.repository';
import { BackofficeRoleRepository } from './backoffice-role.repository';
import type {
  AddBackofficeMessageInput,
  BackofficeThreadDetails,
  CreateBackofficeThreadInput
} from './backoffice-ops.types';
import type { BackofficeCase } from './backoffice.types';

@Injectable()
export class BackofficeMessageService {
  constructor(
    private readonly opsRepository: BackofficeOpsRepository,
    private readonly roleRepository: BackofficeRoleRepository
  ) {}

  async listThreads() {
    return this.opsRepository.listThreads();
  }

  async listThreadsByCompany(companyId: string) {
    return this.opsRepository.listThreadsByCompany(companyId);
  }

  async getThread(threadId: string) {
    return this.opsRepository.getThread(threadId);
  }

  async getThreadForCompany(threadId: string, companyId: string) {
    return this.opsRepository.getThreadForCompany(threadId, companyId);
  }

  async getOrCreateCaseThread(caseItem: BackofficeCase): Promise<BackofficeThreadDetails> {
    const existing = await this.opsRepository.getThreadByCaseId(caseItem.id);
    if (existing) {
      return existing;
    }

    const companyUsers = await this.roleRepository.listCompanyUsers(caseItem.companyId);
    const customerUser = companyUsers[0];

    const created = await this.opsRepository.createThread({
      companyId: caseItem.companyId,
      caseId: caseItem.id,
      title: caseItem.title,
      status: caseItem.status === 'waiting_for_customer' ? 'waiting_for_customer' : 'open',
      priority: caseItem.priority,
      sourceType: caseItem.sourceType,
      sourceId: caseItem.sourceId,
      objectLinks: this.resolveObjectLinks(caseItem)
    });
    await this.opsRepository.addParticipant({
      threadId: created.id,
      roleKey: caseItem.assignedRole,
      participantType: 'internal_user',
      displayName: 'Backoffice'
    });
    await this.opsRepository.addParticipant({
      threadId: created.id,
      userId: customerUser?.id,
      participantType: 'customer_contact',
      displayName: customerUser ? `${customerUser.firstName} ${customerUser.lastName}`.trim() : caseItem.customerId ? 'Kundkontakt' : 'Foretagskontakt',
      email: customerUser?.email ?? undefined
    });
    await this.opsRepository.addMessage({
      threadId: created.id,
      senderRoleKey: caseItem.assignedRole,
      visibility: 'external',
      direction: 'inbound',
      status: 'unread',
      body: caseItem.description,
      metadata: {
        source: 'case-bootstrap',
        senderDisplayName: 'Backoffice',
        senderRoleKey: caseItem.assignedRole
      }
    });

    return (await this.opsRepository.getThread(created.id)) as BackofficeThreadDetails;
  }

  async createThread(input: CreateBackofficeThreadInput) {
    return this.opsRepository.createThread(input);
  }

  async addMessage(input: AddBackofficeMessageInput) {
    return this.opsRepository.addMessage({
      ...input,
      metadata: {
        ...(input.metadata ?? {}),
        senderEmail: input.senderEmail ?? input.metadata?.senderEmail,
        senderDisplayName: input.senderDisplayName ?? input.metadata?.senderDisplayName
      }
    });
  }

  async addCustomerReply(input: {
    threadId: string;
    companyId: string;
    body: string;
    senderUserId?: string;
    senderEmail?: string;
    senderDisplayName?: string;
  }) {
    const thread = await this.opsRepository.getThreadForCompany(input.threadId, input.companyId);

    if (!thread) {
      return null;
    }

    const senderUser =
      (input.senderUserId ? await this.roleRepository.findUser({ userId: input.senderUserId }) : null) ??
      (await this.roleRepository.findCompanyUserByEmail(input.companyId, input.senderEmail)) ??
      (await this.roleRepository.listCompanyUsers(input.companyId))[0] ??
      null;

    await this.opsRepository.addMessage({
      threadId: input.threadId,
      senderUserId: senderUser?.id,
      senderEmail: input.senderEmail ?? senderUser?.email ?? undefined,
      senderDisplayName:
        input.senderDisplayName ?? (senderUser ? `${senderUser.firstName} ${senderUser.lastName}`.trim() : 'Kundkontakt'),
      visibility: 'external',
      direction: 'inbound',
      status: 'unread',
      body: input.body,
      metadata: {
        source: 'customer-portal',
        senderDisplayName:
          input.senderDisplayName ?? (senderUser ? `${senderUser.firstName} ${senderUser.lastName}`.trim() : 'Kundkontakt'),
        senderEmail: input.senderEmail ?? senderUser?.email ?? undefined
      }
    });

    return this.opsRepository.getThread(input.threadId);
  }

  async markThreadRead(threadId: string, userId?: string) {
    return this.opsRepository.markThreadRead(threadId, userId);
  }

  async markCustomerThreadRead(threadId: string, companyId: string) {
    const thread = await this.opsRepository.getThreadForCompany(threadId, companyId);

    if (!thread) {
      return null;
    }

    return this.opsRepository.markThreadReadByParticipantType(threadId, 'customer_contact');
  }

  private resolveObjectLinks(caseItem: BackofficeCase): CreateBackofficeThreadInput['objectLinks'] {
    const links: NonNullable<CreateBackofficeThreadInput['objectLinks']> = [
      {
        targetType: 'case',
        targetId: caseItem.id,
        label: caseItem.title,
        href: `/backoffice/arenden/${caseItem.id}`,
        isPrimary: !caseItem.sourceId
      }
    ];

    if (!caseItem.sourceId) {
      return links;
    }

    const mappedType =
      caseItem.sourceType === 'invoice'
        ? 'invoice'
        : caseItem.sourceType === 'receipt'
          ? 'receipt'
          : caseItem.sourceType === 'payroll'
            ? 'payroll_run'
            : caseItem.sourceType === 'bookkeeping'
              ? 'voucher'
              : caseItem.sourceType === 'customer'
                ? 'customer'
                : caseItem.sourceType === 'project'
                  ? 'project'
                  : caseItem.sourceType === 'company'
                    ? 'company'
                    : 'document';

    links.unshift({
      targetType: mappedType,
      targetId: caseItem.sourceId,
      label: caseItem.sourceContext?.sourceLabel ?? caseItem.title,
      href: caseItem.sourceContext?.sourceRoute,
      isPrimary: true
    });

    return links;
  }
}
