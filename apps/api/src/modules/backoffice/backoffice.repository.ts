import { Injectable } from '@nestjs/common';

import type {
  AuditLogEntry,
  BackofficeCase,
  CaseComment,
  CaseEscalationHistoryItem,
  RuleUpdateCandidate,
  RuleValue,
  WorkspaceLayoutPreference
} from './backoffice.types';

@Injectable()
export class BackofficeRepository {
  private readonly cases = new Map<string, BackofficeCase>([
    [
      'case-vat-1',
      {
        id: 'case-vat-1',
        caseType: 'vat_review',
        sourceType: 'vat',
        sourceId: 'vat-2026-04',
        companyId: 'company-main',
        status: 'new',
        priority: 'high',
        assignedRole: 'accountant',
        createdByType: 'ai',
        confidenceScore: 0.86,
        title: 'Momsperiod behöver granskas',
        description: 'AI har flaggat att perioden innehåller underlag som kan behöva dubbelkontroll.',
        createdAt: '2026-04-17T08:30:00.000Z',
        updatedAt: '2026-04-17T08:30:00.000Z'
      }
    ],
    [
      'case-legal-1',
      {
        id: 'case-legal-1',
        caseType: 'legal_contract_review',
        sourceType: 'project',
        sourceId: 'project-101',
        companyId: 'company-main',
        customerId: 'customer-101',
        projectId: 'project-101',
        status: 'in_progress',
        priority: 'medium',
        assignedRole: 'corporate_lawyer',
        assignedUserId: 'user-legal-1',
        createdByType: 'user',
        title: 'Granska avtalsbilaga inför nytt projekt',
        description: 'Kunden vill att avtalsbilagan ses över innan projektstart.',
        createdAt: '2026-04-16T13:15:00.000Z',
        updatedAt: '2026-04-17T07:10:00.000Z'
      }
    ]
  ]);

  private readonly comments = new Map<string, CaseComment[]>([
    [
      'case-vat-1',
      [
        {
          id: 'comment-vat-1',
          caseId: 'case-vat-1',
          authorUserId: 'user-acc-1',
          authorRole: 'accountant',
          body: 'Jag går igenom underlagen för perioden idag.',
          createdAt: '2026-04-17T09:05:00.000Z',
          isInternal: true
        }
      ]
    ]
  ]);

  private readonly escalations = new Map<string, CaseEscalationHistoryItem[]>([
    [
      'case-legal-1',
      [
        {
          id: 'escalation-legal-1',
          caseId: 'case-legal-1',
          toRole: 'corporate_lawyer',
          escalatedByUserId: 'user-support-1',
          reason: 'Avtalsfråga som behöver juridisk granskning.',
          createdAt: '2026-04-16T13:16:00.000Z'
        }
      ]
    ]
  ]);

  private readonly ruleValues = new Map<string, RuleValue>([
    [
      'rule-vat-threshold-1',
      {
        id: 'rule-vat-threshold-1',
        ruleKey: 'vat.standard_rate',
        category: 'vat',
        value: '25',
        validFrom: '2026-01-01',
        description: 'Standardnivå för utgående moms.',
        updatedByUserId: 'user-tax-1',
        updatedAt: '2026-04-10T08:00:00.000Z',
        version: 1
      }
    ],
    [
      'rule-tax-threshold-1',
      {
        id: 'rule-tax-threshold-1',
        ruleKey: 'tax.company_return_deadline_days',
        category: 'tax',
        value: '30',
        validFrom: '2026-01-01',
        description: 'Intern parameter för hur tidigt deklarationsgranskning ska flaggas.',
        updatedByUserId: 'user-tax-1',
        updatedAt: '2026-04-10T08:15:00.000Z',
        version: 1
      }
    ]
  ]);

  private readonly auditLog: AuditLogEntry[] = [
    {
      id: 'audit-case-vat-1',
      entityType: 'case',
      entityId: 'case-vat-1',
      actionType: 'case_created',
      actorRole: 'ai',
      createdAt: '2026-04-17T08:30:00.000Z',
      metadata: { assignedRole: 'accountant', priority: 'high' }
    }
  ];

  private readonly ruleUpdateCandidates = new Map<string, RuleUpdateCandidate>();
  private readonly workspaceLayoutPreferences = new Map<string, WorkspaceLayoutPreference>();

  listCases() {
    return Array.from(this.cases.values());
  }

  getCase(caseId: string) {
    return this.cases.get(caseId);
  }

  saveCase(nextCase: BackofficeCase) {
    this.cases.set(nextCase.id, nextCase);
    return nextCase;
  }

  listComments(caseId: string) {
    return [...(this.comments.get(caseId) ?? [])];
  }

  addComment(comment: CaseComment) {
    const comments = this.comments.get(comment.caseId) ?? [];
    comments.push(comment);
    this.comments.set(comment.caseId, comments);
    return comment;
  }

  listEscalations(caseId: string) {
    return [...(this.escalations.get(caseId) ?? [])];
  }

  addEscalation(historyItem: CaseEscalationHistoryItem) {
    const items = this.escalations.get(historyItem.caseId) ?? [];
    items.push(historyItem);
    this.escalations.set(historyItem.caseId, items);
    return historyItem;
  }

  listRuleValues() {
    return Array.from(this.ruleValues.values());
  }

  getRuleValue(ruleId: string) {
    return this.ruleValues.get(ruleId);
  }

  saveRuleValue(ruleValue: RuleValue) {
    this.ruleValues.set(ruleValue.id, ruleValue);
    return ruleValue;
  }

  listRuleUpdateCandidates() {
    return Array.from(this.ruleUpdateCandidates.values());
  }

  getRuleUpdateCandidate(candidateId: string) {
    return this.ruleUpdateCandidates.get(candidateId);
  }

  saveRuleUpdateCandidate(candidate: RuleUpdateCandidate) {
    this.ruleUpdateCandidates.set(candidate.id, candidate);
    return candidate;
  }

  listAuditLog() {
    return [...this.auditLog];
  }

  addAuditLog(entry: AuditLogEntry) {
    this.auditLog.unshift(entry);
    return entry;
  }

  getWorkspaceLayoutPreferenceKey(userId: string, companyId: string, roleKey: string) {
    return `${userId}:${companyId}:${roleKey}`;
  }

  listWorkspaceLayoutPreferences() {
    return Array.from(this.workspaceLayoutPreferences.values());
  }

  getWorkspaceLayoutPreference(userId: string, companyId: string, roleKey: string) {
    return this.workspaceLayoutPreferences.get(this.getWorkspaceLayoutPreferenceKey(userId, companyId, roleKey));
  }

  saveWorkspaceLayoutPreference(preference: WorkspaceLayoutPreference) {
    this.workspaceLayoutPreferences.set(
      this.getWorkspaceLayoutPreferenceKey(preference.userId, preference.companyId, preference.roleKey),
      preference
    );
    return preference;
  }

  deleteWorkspaceLayoutPreference(userId: string, companyId: string, roleKey: string) {
    this.workspaceLayoutPreferences.delete(this.getWorkspaceLayoutPreferenceKey(userId, companyId, roleKey));
  }
}
