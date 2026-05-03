import { Injectable } from '@nestjs/common';

import { BackofficeOpsRepository } from './backoffice-ops.repository';
import { BackofficeRepository } from './backoffice.repository';
import type { BackofficeCompanyProfileRecord } from './backoffice-ops.types';
import type { BackofficeRole } from './backoffice.types';

type CompanyProfileBase = {
  companyId: string;
  companyName: string;
  organizationNumber: string;
  customerCount: number;
  projectCount: number;
  invoiceCount: number;
  receiptCount: number;
  voucherCount: number;
  payrollRunCount: number;
};

@Injectable()
export class BackofficeCompanyProfileService {
  constructor(
    private readonly opsRepository: BackofficeOpsRepository,
    private readonly repository: BackofficeRepository
  ) {}

  async listProfiles(role: BackofficeRole = 'accountant') {
    const bases = await this.opsRepository.listCompanyProfilesBase();
    return Promise.all(bases.map((base) => this.buildProfile(base, role)));
  }

  async getProfile(companyId: string, role: BackofficeRole = 'accountant') {
    const base = await this.opsRepository.getCompanyProfileBase(companyId);
    if (!base) {
      return null;
    }

    return this.buildProfile(base, role);
  }

  private async buildProfile(base: CompanyProfileBase, role: BackofficeRole): Promise<BackofficeCompanyProfileRecord> {
    const [threads, cases] = await Promise.all([
      this.opsRepository.listThreadsByCompany(base.companyId),
      Promise.resolve(this.repository.listCases().filter((item) => item.companyId === base.companyId))
    ]);

    const openCasesCount = cases.filter((item) => item.status !== 'closed' && item.status !== 'resolved').length;
    const unreadMessagesCount = threads.reduce(
      (sum, thread) => sum + thread.messages.filter((message) => message.visibility === 'external' && message.status === 'unread').length,
      0
    );
    const bookkeepingReviewCount = cases.filter((item) =>
      item.caseType === 'bookkeeping_exception' || item.caseType === 'vat_review' || item.sourceType === 'bookkeeping'
    ).length;
    const receiptReviewCount = cases.filter((item) => item.sourceType === 'receipt').length + base.receiptCount;
    const payrollReviewCount = cases.filter((item) => item.sourceType === 'payroll' || item.caseType === 'declaration_review').length;
    const totalLoad = bookkeepingReviewCount + receiptReviewCount + payrollReviewCount + openCasesCount;

    return {
      companyId: base.companyId,
      companyName: base.companyName,
      organizationNumber: base.organizationNumber,
      status: totalLoad > 10 ? 'busy' : totalLoad > 4 ? 'attention' : 'healthy',
      assignedOwnerRole: role,
      openCasesCount,
      unreadMessagesCount,
      bookkeepingReviewCount,
      receiptReviewCount,
      payrollReviewCount,
      customerCount: base.customerCount,
      projectCount: base.projectCount,
      invoiceCount: base.invoiceCount,
      voucherCount: base.voucherCount,
      aiInsight:
        unreadMessagesCount > 0
          ? 'Kommunikationen ar aktiv och bor foljas upp direkt i samma arbetsflode.'
          : totalLoad > 6
            ? 'Bolaget har hog aktivitet och bor hanteras i tydlig ordning for att undvika backlog.'
            : 'Bolaget ser stabilt ut just nu, men hall koll pa kommunikation och oppna arenden.',
      source: 'backend'
    };
  }
}
