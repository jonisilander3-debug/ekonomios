import type { OnboardingData } from '@/features/onboarding/types';

import { resolveOnboardingData } from './storage';
import type {
  WorkspaceUser,
  MockActivity,
  MockBookkeepingEntry,
  MockBookkeepingLine,
  MockCompany,
  MockCustomer,
  MockImportantDateSeed,
  MockInvoice,
  MockInvoiceLine,
  MockPayrollLine,
  MockPlatformData,
  MockProject,
  MockProjectDiaryEntry,
  MockReceipt,
  MockTimeEntry,
  MockUser
} from './types';

function getPlanName(onboarding: OnboardingData | null) {
  return onboarding?.planId === 'premium' ? 'Premium AI Assistent' : 'Basic AI Assistent';
}

function createCompanies(onboarding: OnboardingData | null): MockCompany[] {
  const companyName = onboarding?.companyName || 'Nordic Service Group AB';
  const companyType =
    onboarding?.companyType === 'enskild-firma'
      ? 'Enskild firma'
      : onboarding?.companyType === 'handelsbolag'
        ? 'Handelsbolag'
        : 'Aktiebolag';
  const vatRegistered = onboarding?.vatRegistered ?? true;
  const structure = onboarding?.companyStructure;
  const companyCount = Math.max(1, Number.parseInt(onboarding?.companyCountNow || '2', 10) || 1);
  const hasHolding = structure === 'holding-structure';
  const hasMultipleCompanies = structure === 'holding-structure' || structure === 'multiple-companies';

  const companies: MockCompany[] = [];

  if (hasHolding) {
    companies.push({
      id: 'company-holding',
      name: onboarding?.parentCompanyName || 'Norra Holding AB',
      kind: 'holding',
      organizationNumber: '559900-2200',
      companyType: 'Aktiebolag',
      vatRegistered: false
    });
  }

  companies.push({
    id: 'company-main',
    name: companyName,
    kind: 'operating',
    organizationNumber: onboarding?.organizationNumber || '559123-4567',
    companyType,
    vatRegistered,
    parentCompanyId: hasHolding ? 'company-holding' : undefined
  });

  if (hasMultipleCompanies) {
    for (let index = 1; index < companyCount; index += 1) {
      companies.push({
        id: `company-${index + 1}`,
        name: `Servicebolag ${index + 1}`,
        kind: 'operating',
        organizationNumber: `559200-45${index}0`,
        companyType: 'Aktiebolag',
        vatRegistered: true,
        parentCompanyId: hasHolding ? 'company-holding' : undefined
      });
    }
  }

  return companies;
}

function createUser(onboarding: OnboardingData | null): MockUser {
  return {
    id: 'user-1',
    firstName: onboarding?.firstName || 'Anders',
    lastName: onboarding?.lastName || 'Larsson',
    email: onboarding?.email || 'anders@nordicservice.se',
    phone: onboarding?.phone || '070-123 45 67',
    planName: getPlanName(onboarding)
  };
}

function createWorkspaceUsers(onboarding: OnboardingData | null): WorkspaceUser[] {
  const baseEmailDomain = onboarding?.email?.split('@')[1] || 'toolsverige.se';

  return [
    {
      id: 'user-admin',
      username: 'anna.ekvall',
      displayName: 'Anna Ekvall',
      email: `anna.ekvall@${baseEmailDomain}`,
      role: 'admin'
    },
    {
      id: 'user-ekonomi',
      username: 'erik.holm',
      displayName: 'Erik Holm',
      email: `erik.holm@${baseEmailDomain}`,
      role: 'ekonomi'
    },
    {
      id: 'user-projekt',
      username: 'mikael.sand',
      displayName: 'Mikael Sand',
      email: `mikael.sand@${baseEmailDomain}`,
      role: 'projektledare'
    },
    {
      id: 'user-kundtjanst',
      username: 'sara.lind',
      displayName: 'Sara Lind',
      email: `sara.lind@${baseEmailDomain}`,
      role: 'customer_support'
    },
    {
      id: 'user-bokforare',
      username: 'jonas.nordin',
      displayName: 'Jonas Nordin',
      email: `jonas.nordin@${baseEmailDomain}`,
      role: 'accountant'
    },
    {
      id: 'user-revisor',
      username: 'lina.berg',
      displayName: 'Lina Berg',
      email: `lina.berg@${baseEmailDomain}`,
      role: 'auditor'
    },
    {
      id: 'user-jurist',
      username: 'tove.marklund',
      displayName: 'Tove Marklund',
      email: `tove.marklund@${baseEmailDomain}`,
      role: 'corporate_lawyer'
    },
    {
      id: 'user-skattejurist',
      username: 'oskar.wennberg',
      displayName: 'Oskar Wennberg',
      email: `oskar.wennberg@${baseEmailDomain}`,
      role: 'tax_lawyer'
    }
  ];
}

function createCustomers(companies: MockCompany[]): MockCustomer[] {
  const operatingCompanies = companies.filter((company) => company.kind === 'operating');
  const mainCompanyId = operatingCompanies[0]?.id || 'company-main';
  const secondCompanyId = operatingCompanies[1]?.id;

  const customers: MockCustomer[] = [
    {
      id: 'customer-1',
      companyId: mainCompanyId,
      name: 'Brf Solsidan',
      organizationNumber: '769612-4812',
      contactName: 'Eva Holm',
      contactEmail: 'eva@solsidan.se',
      contactPhone: '070-621 55 10',
      addressLine1: 'Solsidestigen 12',
      postalCode: '117 43',
      city: 'Stockholm',
      autoFilledFields: ['organizationNumber', 'addressLine1', 'postalCode', 'city']
    },
    {
      id: 'customer-2',
      companyId: mainCompanyId,
      name: 'Lindqvist Fastigheter',
      organizationNumber: '556901-7742',
      contactName: 'Hanna Lindqvist',
      contactEmail: 'ekonomi@lindqvistfast.se',
      contactPhone: '08-555 21 90',
      addressLine1: 'Kungsgatan 18',
      postalCode: '111 35',
      city: 'Stockholm',
      vatNumber: 'SE556901774201',
      fTaxApproved: true,
      autoFilledFields: ['organizationNumber', 'addressLine1', 'postalCode', 'city', 'vatNumber', 'fTaxApproved']
    },
    {
      id: 'customer-3',
      companyId: mainCompanyId,
      name: 'Nordbygg Service',
      organizationNumber: '559221-0488',
      contactName: 'Patrik Nyberg',
      contactEmail: 'drift@nordbygg.se',
      contactPhone: '070-442 01 33',
      addressLine1: 'Brunnsgatan 5',
      postalCode: '753 17',
      city: 'Uppsala',
      vatNumber: 'SE559221048801',
      fTaxApproved: true,
      autoFilledFields: ['organizationNumber', 'addressLine1', 'postalCode', 'city', 'vatNumber', 'fTaxApproved']
    },
    {
      id: 'customer-4',
      companyId: mainCompanyId,
      name: 'Brf Eken',
      organizationNumber: '769604-8891',
      contactName: 'Styrelsen Brf Eken',
      contactEmail: 'styrelsen@brfeken.se',
      addressLine1: 'Ekstigen 4',
      postalCode: '412 63',
      city: 'Goteborg',
      autoFilledFields: ['organizationNumber', 'addressLine1', 'postalCode', 'city']
    }
  ];

  if (secondCompanyId) {
    customers.push({ id: 'customer-5', companyId: secondCompanyId, name: 'Mälardalen Drift' });
    customers.push({ id: 'customer-6', companyId: secondCompanyId, name: 'Hamnkontoret AB' });
  }

  return customers.map((customer) => {
    if (customer.id === 'customer-5') {
      return {
        ...customer,
        organizationNumber: '559301-1002',
        addressLine1: 'Verkstadsgatan 21',
        postalCode: '721 30',
        city: 'Vasteras',
        vatNumber: 'SE559301100201',
        fTaxApproved: true,
        autoFilledFields: ['organizationNumber', 'addressLine1', 'postalCode', 'city', 'vatNumber', 'fTaxApproved']
      };
    }

    if (customer.id === 'customer-6') {
      return {
        ...customer,
        organizationNumber: '556711-3402',
        addressLine1: 'Kajplatsen 8',
        postalCode: '652 24',
        city: 'Karlstad',
        vatNumber: 'SE556711340201',
        fTaxApproved: true,
        autoFilledFields: ['organizationNumber', 'addressLine1', 'postalCode', 'city', 'vatNumber', 'fTaxApproved']
      };
    }

    return customer;
  });
}

function createProjects(customers: MockCustomer[]): MockProject[] {
  return [
    {
      id: 'project-1',
      companyId: customers[0]?.companyId || 'company-main',
      customerId: 'customer-1',
      name: 'Vårservice ventilation',
      status: 'Aktivt',
      projectType: 'Servicejobb',
      startDate: '2026-04-01',
      ownerName: 'Anders Larsson',
      checkedInEmployees: 2,
      hoursToday: 7.5,
      completedToday: false,
      contractEndsAt: '2026-06-02'
    },
    {
      id: 'project-2',
      companyId: customers[1]?.companyId || 'company-main',
      customerId: 'customer-2',
      name: 'Byte av styrsystem',
      status: 'Aktivt',
      projectType: 'Teknikrum',
      startDate: '2026-03-28',
      ownerName: 'Sara Nyström',
      checkedInEmployees: 1,
      hoursToday: 6,
      completedToday: false
    },
    {
      id: 'project-3',
      companyId: customers[2]?.companyId || 'company-main',
      customerId: 'customer-3',
      name: 'Filterrond april',
      status: 'Klart',
      projectType: 'Kvällspass',
      startDate: '2026-04-02',
      ownerName: 'Johan Berg',
      checkedInEmployees: 0,
      hoursToday: 3.5,
      completedToday: true
    },
    {
      id: 'project-4',
      companyId: customers[3]?.companyId || 'company-main',
      customerId: 'customer-4',
      name: 'Sommarförberedelse',
      status: 'Planerat',
      projectType: 'Planering',
      startDate: '2026-04-20',
      ownerName: 'Mikael Holm',
      checkedInEmployees: 0,
      hoursToday: 0,
      completedToday: false
    },
    {
      id: 'project-5',
      companyId: customers[4]?.companyId || 'company-main',
      customerId: 'customer-5',
      name: 'Tillsyn av fläktrum',
      status: 'Aktivt',
      projectType: 'Drift',
      startDate: '2026-04-05',
      ownerName: 'Linnea Ek',
      checkedInEmployees: 1,
      hoursToday: 2.5,
      completedToday: false
    },
    {
      id: 'project-6',
      companyId: customers[5]?.companyId || 'company-main',
      customerId: 'customer-6',
      name: 'Översyn av avtal',
      status: 'Planerat',
      projectType: 'Genomgång',
      startDate: '2026-04-22',
      ownerName: 'Anders Larsson',
      checkedInEmployees: 0,
      hoursToday: 0,
      completedToday: false,
      contractEndsAt: '2026-05-28'
    }
  ];
}

function createInvoices(customers: MockCustomer[]): MockInvoice[] {
  return [
    {
      id: 'invoice-1',
      companyId: customers[0]?.companyId || 'company-main',
      customerId: 'customer-1',
      projectId: 'project-1',
      number: '2026-1007',
      issuedDate: '2026-04-14',
      dueDate: '2026-04-28',
      amount: 8000,
      status: 'Skickad',
      createdAt: '2026-04-14T10:45:00.000Z'
    },
    {
      id: 'invoice-2',
      companyId: customers[1]?.companyId || 'company-main',
      customerId: 'customer-2',
      projectId: 'project-2',
      number: '2026-1006',
      issuedDate: '2026-04-13',
      dueDate: '2026-04-20',
      amount: 12500,
      status: 'Betald',
      createdAt: '2026-04-13T11:20:00.000Z'
    },
    {
      id: 'invoice-3',
      companyId: customers[2]?.companyId || 'company-main',
      customerId: 'customer-3',
      projectId: 'project-3',
      number: '2026-1005',
      issuedDate: '2026-04-12',
      dueDate: '2026-04-26',
      amount: 4200,
      status: 'Utkast',
      createdAt: '2026-04-12T14:10:00.000Z'
    },
    {
      id: 'invoice-4',
      companyId: customers[3]?.companyId || 'company-main',
      customerId: 'customer-4',
      projectId: 'project-4',
      number: '2026-1004',
      issuedDate: '2026-04-11',
      dueDate: '2026-04-25',
      amount: 6750,
      status: 'Skickad',
      createdAt: '2026-04-11T09:10:00.000Z'
    },
    {
      id: 'invoice-5',
      companyId: customers[4]?.companyId || 'company-main',
      customerId: 'customer-5',
      projectId: 'project-5',
      number: '2026-2002',
      issuedDate: '2026-04-10',
      dueDate: '2026-04-17',
      amount: 9600,
      status: 'Betald',
      createdAt: '2026-04-10T13:45:00.000Z'
    }
    ] satisfies MockInvoice[];
  }

function createInvoiceLines(): MockInvoiceLine[] {
  return [
    { id: 'invoice-line-1', invoiceId: 'invoice-1', description: 'Service ventilation', quantity: 8, unitPrice: 750 },
    { id: 'invoice-line-2', invoiceId: 'invoice-1', description: 'Material och filter', quantity: 1, unitPrice: 2000 },
    { id: 'invoice-line-3', invoiceId: 'invoice-2', description: 'Byte av styrsystem', quantity: 10, unitPrice: 950 },
    { id: 'invoice-line-4', invoiceId: 'invoice-2', description: 'Driftsättning', quantity: 2, unitPrice: 1500 },
    { id: 'invoice-line-5', invoiceId: 'invoice-3', description: 'Filterrond april', quantity: 6, unitPrice: 700 },
    { id: 'invoice-line-6', invoiceId: 'invoice-4', description: 'Sommarförberedelse', quantity: 5, unitPrice: 850 },
    { id: 'invoice-line-7', invoiceId: 'invoice-4', description: 'Planering på plats', quantity: 1, unitPrice: 2500 },
    { id: 'invoice-line-8', invoiceId: 'invoice-5', description: 'Tillsyn av fläktrum', quantity: 8, unitPrice: 900 },
    { id: 'invoice-line-9', invoiceId: 'invoice-5', description: 'Material', quantity: 1, unitPrice: 2400 }
  ];
}

function createReceipts(customers: MockCustomer[]): MockReceipt[] {
  return [
    {
      id: 'receipt-1',
      companyId: customers[0]?.companyId || 'company-main',
      projectId: 'project-1',
      supplier: 'Tools Sverige AB',
      receiptDate: '2026-04-14',
      amount: 1280,
      status: 'Väntar',
      createdAt: '2026-04-14T09:35:00.000Z'
    },
    {
      id: 'receipt-2',
      companyId: customers[0]?.companyId || 'company-main',
      projectId: 'project-1',
      supplier: 'Byggvaror Norr',
      receiptDate: '2026-04-14',
      amount: 695,
      status: 'Väntar',
      createdAt: '2026-04-14T08:55:00.000Z'
    },
    {
      id: 'receipt-3',
      companyId: customers[1]?.companyId || 'company-main',
      projectId: 'project-2',
      supplier: 'Macken City',
      receiptDate: '2026-04-13',
      amount: 840,
      status: 'Klar',
      createdAt: '2026-04-13T17:10:00.000Z'
    },
    {
      id: 'receipt-4',
      companyId: customers[2]?.companyId || 'company-main',
      projectId: 'project-3',
      supplier: 'Office Gross',
      receiptDate: '2026-04-12',
      amount: 390,
      status: 'Klar',
      createdAt: '2026-04-12T11:00:00.000Z'
    },
    {
      id: 'receipt-5',
      companyId: customers[4]?.companyId || 'company-main',
      projectId: 'project-5',
      supplier: 'Montage Partner',
      receiptDate: '2026-04-11',
      amount: 1560,
      status: 'Klar',
      createdAt: '2026-04-11T12:30:00.000Z'
    }
  ];
}

function createTimeEntries(projects: MockProject[]): MockTimeEntry[] {
  return [
    {
      id: 'time-1',
      companyId: projects[0]?.companyId || 'company-main',
      projectId: 'project-1',
      employeeName: 'Anders Larsson',
      hours: 3.5,
      entryDate: '2026-04-14',
      isCheckedIn: true,
      createdAt: '2026-04-14T08:55:00.000Z'
    },
    {
      id: 'time-2',
      companyId: projects[0]?.companyId || 'company-main',
      projectId: 'project-1',
      employeeName: 'Sara Nyström',
      hours: 2.5,
      entryDate: '2026-04-14',
      isCheckedIn: true,
      createdAt: '2026-04-14T08:30:00.000Z'
    },
    {
      id: 'time-3',
      companyId: projects[1]?.companyId || 'company-main',
      projectId: 'project-2',
      employeeName: 'Johan Berg',
      hours: 6,
      entryDate: '2026-04-14',
      isCheckedIn: true,
      createdAt: '2026-04-14T07:50:00.000Z'
    },
    {
      id: 'time-4',
      companyId: projects[2]?.companyId || 'company-main',
      projectId: 'project-3',
      employeeName: 'Mikael Holm',
      hours: 3.5,
      entryDate: '2026-04-14',
      isCheckedIn: false,
      createdAt: '2026-04-14T09:15:00.000Z'
    },
    {
      id: 'time-5',
      companyId: projects[4]?.companyId || 'company-main',
      projectId: 'project-5',
      employeeName: 'Linnea Ek',
      hours: 2.5,
      entryDate: '2026-04-14',
      isCheckedIn: true,
      createdAt: '2026-04-14T10:10:00.000Z'
    }
  ];
}

function createPayrollLines(projects: MockProject[]): MockPayrollLine[] {
  const mainCompanyId = projects[0]?.companyId || 'company-main';
  const secondCompanyId = projects[4]?.companyId || mainCompanyId;

  return [
    {
      id: 'payroll-1',
      companyId: mainCompanyId,
      employeeName: 'Anders Larsson',
      hours: 154,
      monthLabel: 'April',
      status: 'Klar',
      nextRunDate: '2026-04-25',
      updatedAt: '2026-04-14T08:00:00.000Z'
    },
    {
      id: 'payroll-2',
      companyId: mainCompanyId,
      employeeName: 'Sara Nyström',
      hours: 148,
      monthLabel: 'April',
      status: 'Kontroll',
      nextRunDate: '2026-04-25',
      updatedAt: '2026-04-14T07:40:00.000Z'
    },
    {
      id: 'payroll-3',
      companyId: mainCompanyId,
      employeeName: 'Johan Berg',
      hours: 162,
      monthLabel: 'April',
      status: 'Kontroll',
      nextRunDate: '2026-04-25',
      updatedAt: '2026-04-13T16:00:00.000Z'
    },
    {
      id: 'payroll-4',
      companyId: mainCompanyId,
      employeeName: 'Mikael Holm',
      hours: 144,
      monthLabel: 'April',
      status: 'Klar',
      nextRunDate: '2026-04-25',
      updatedAt: '2026-04-12T15:20:00.000Z'
    },
    {
      id: 'payroll-5',
      companyId: secondCompanyId,
      employeeName: 'Linnea Ek',
      hours: 136,
      monthLabel: 'April',
      status: 'Klar',
      nextRunDate: '2026-04-25',
      updatedAt: '2026-04-11T13:20:00.000Z'
    }
  ];
}

function createBookkeepingEntries(companies: MockCompany[]): MockBookkeepingEntry[] {
  const mainCompanyId = companies.find((company) => company.id === 'company-main')?.id || 'company-main';
  const secondCompanyId =
    companies.find((company) => company.kind === 'operating' && company.id !== 'company-main')?.id ||
    mainCompanyId;

  return [
      {
        id: 'bookkeeping-1',
        companyId: mainCompanyId,
        entryDate: '2026-04-14',
        voucherNumber: 'A-2026-041',
        typeLabel: 'Kundbetalning',
        description: 'Faktura 2026-1007',
        status: 'Bokförd',
        category: 'payment',
        invoiceId: 'invoice-1',
        projectId: 'project-1',
        createdAt: '2026-04-14T08:10:00.000Z'
      },
      {
        id: 'bookkeeping-2',
        companyId: mainCompanyId,
        entryDate: '2026-04-14',
        voucherNumber: 'A-2026-042',
        typeLabel: 'Kundbetalning',
        description: 'Faktura 2026-1002',
        status: 'Bokförd',
        category: 'payment',
        createdAt: '2026-04-14T09:20:00.000Z'
    },
    {
        id: 'bookkeeping-3',
        companyId: mainCompanyId,
        entryDate: '2026-04-14',
        voucherNumber: 'A-2026-043',
        typeLabel: 'Kundbetalning',
        description: 'Faktura 2026-0998',
        status: 'Bokförd',
        category: 'payment',
        createdAt: '2026-04-14T10:00:00.000Z'
    },
    {
        id: 'bookkeeping-4',
        companyId: secondCompanyId,
        entryDate: '2026-04-14',
        voucherNumber: 'B-2026-014',
        typeLabel: 'Kundbetalning',
        description: 'Faktura 2026-2002',
        status: 'Bokförd',
        category: 'payment',
        invoiceId: 'invoice-5',
        projectId: 'project-5',
        createdAt: '2026-04-14T10:30:00.000Z'
      },
      {
        id: 'bookkeeping-5',
        companyId: mainCompanyId,
        entryDate: '2026-04-14',
        voucherNumber: 'A-2026-044',
        typeLabel: 'Leverantörskvitto',
        description: 'Tools Sverige AB',
        status: 'Att gå igenom',
        category: 'receipt',
        receiptId: 'receipt-1',
        projectId: 'project-1',
        createdAt: '2026-04-14T09:35:00.000Z'
      },
      {
        id: 'bookkeeping-6',
        companyId: mainCompanyId,
        entryDate: '2026-04-13',
        voucherNumber: 'A-2026-039',
        typeLabel: 'Löneunderlag',
        description: 'April',
        status: 'Förbereds',
        category: 'payroll',
        createdAt: '2026-04-13T15:10:00.000Z'
    },
    {
        id: 'bookkeeping-7',
        companyId: mainCompanyId,
        entryDate: '2026-04-12',
        voucherNumber: 'A-2026-038',
        typeLabel: 'Bankavstämning',
        description: 'Företagskonto',
        status: 'Klar',
        category: 'reconciliation',
        createdAt: '2026-04-12T16:20:00.000Z'
    }
  ];
}

function createBookkeepingLines(): MockBookkeepingLine[] {
  return [
    { id: 'line-1', bookkeepingEntryId: 'bookkeeping-1', accountCode: '1930', accountName: 'Företagskonto', text: 'Inbetalning kund', debit: 8000, credit: 0 },
    { id: 'line-2', bookkeepingEntryId: 'bookkeeping-1', accountCode: '1510', accountName: 'Kundfordringar', text: 'Faktura 2026-1007', debit: 0, credit: 8000 },
    { id: 'line-3', bookkeepingEntryId: 'bookkeeping-5', accountCode: '5460', accountName: 'Förbrukningsmaterial', text: 'Tools Sverige AB', debit: 1024, credit: 0 },
    { id: 'line-4', bookkeepingEntryId: 'bookkeeping-5', accountCode: '2641', accountName: 'Ingående moms', text: 'Moms', debit: 256, credit: 0 },
    { id: 'line-5', bookkeepingEntryId: 'bookkeeping-5', accountCode: '2440', accountName: 'Leverantörsskulder', text: 'Att betala', debit: 0, credit: 1280 },
    { id: 'line-6', bookkeepingEntryId: 'bookkeeping-6', accountCode: '7010', accountName: 'Löner', text: 'Löneunderlag april', debit: 28400, credit: 0 },
    { id: 'line-7', bookkeepingEntryId: 'bookkeeping-6', accountCode: '2710', accountName: 'Personalskatt', text: 'Skatt', debit: 0, credit: 6400 },
    { id: 'line-8', bookkeepingEntryId: 'bookkeeping-6', accountCode: '1930', accountName: 'Företagskonto', text: 'Utbetalning lön', debit: 0, credit: 22000 },
    { id: 'line-9', bookkeepingEntryId: 'bookkeeping-7', accountCode: '1930', accountName: 'Företagskonto', text: 'Bankavstämning', debit: 0, credit: 0 }
  ];
}

function createImportantDateSeeds(
  companies: MockCompany[],
  projects: MockProject[],
  receipts: MockReceipt[],
  payrollLines: MockPayrollLine[]
): MockImportantDateSeed[] {
  const operatingCompanyIds = companies.filter((company) => company.kind === 'operating').map((company) => company.id);
  const mainCompanyId = operatingCompanyIds[0] || 'company-main';
  const contractProject = projects.find((project) => project.contractEndsAt);
  const pendingReceipts = receipts.filter((receipt) => receipt.status === 'Väntar').length;
  const payrollCompanyId = payrollLines[0]?.companyId || mainCompanyId;

  return [
    {
      id: 'important-1',
      companyId: mainCompanyId,
      date: '2026-05-12',
      title: 'Moms ska vara inne',
      description: 'Betalning och underlag behöver vara klara.',
      priority: 'Viktig',
      source: 'moms'
    },
    {
      id: 'important-2',
      companyId: mainCompanyId,
      date: '2026-05-08',
      title: 'Momsrapport ska förberedas',
      description: 'Bra läge att gå igenom underlagen nu.',
      priority: 'Snart',
      source: 'moms'
    },
    {
      id: 'important-3',
      companyId: payrollCompanyId,
      date: '2026-04-25',
      title: 'Lönekörning behöver godkännas',
      description: 'Några rader väntar på kontroll innan körning.',
      priority: 'Viktig',
      source: 'lön'
    },
    {
      id: 'important-4',
      companyId: mainCompanyId,
      date: '2026-06-15',
      title: 'Bokslut bör påbörjas',
      description: 'Samla underlag i lugn takt redan nu.',
      priority: 'Lugn',
      source: 'system'
    },
    {
      id: 'important-5',
      companyId: contractProject?.companyId || mainCompanyId,
      date: contractProject?.contractEndsAt || '2026-06-02',
      title: 'Avtal går ut snart',
      description: `${contractProject?.name || 'Ett avtal'} behöver ses över i tid.`,
      priority: 'Snart',
      source: 'avtal'
    },
    {
      id: 'important-6',
      companyId: mainCompanyId,
      date: '2026-04-14',
      title: 'Viktig påminnelse från systemet',
      description: `${pendingReceipts} kvitton väntar fortfarande på kontroll.`,
      priority: 'Snart',
      source: 'system'
    }
  ];
}

function createActivities(
  invoices: MockInvoice[],
  receipts: MockReceipt[],
  timeEntries: MockTimeEntry[],
  bookkeepingEntries: MockBookkeepingEntry[],
  customers: MockCustomer[]
): MockActivity[] {
  const customerById = new Map(customers.map((customer) => [customer.id, customer]));
  const latestInvoice = invoices[0];
  const latestReceipt = receipts[0];
  const latestTime = timeEntries[0];
  const latestPayment = bookkeepingEntries
    .filter((entry) => entry.category === 'payment')
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt))[0];

  return [
    latestInvoice
      ? {
          id: 'activity-invoice',
          companyId: latestInvoice.companyId,
          title: 'Faktura skapad',
          description: `Faktura ${latestInvoice.number} skapades för ${
            customerById.get(latestInvoice.customerId)?.name || 'kund'
          }.`,
          occurredAt: latestInvoice.createdAt,
          actorType: 'system' as const,
          sourceType: 'invoice' as const,
          sourceId: latestInvoice.id,
          activityType: 'invoice-created'
        }
      : null,
    latestReceipt
      ? {
          id: 'activity-receipt',
          companyId: latestReceipt.companyId,
          title: 'Kvitto uppladdat',
          description: `Kvitto från ${latestReceipt.supplier} ${
            latestReceipt.status === 'Väntar' ? 'väntar på kontroll.' : 'är klart.'
          }`,
          occurredAt: latestReceipt.createdAt,
          actorType: 'system' as const,
          sourceType: 'receipt' as const,
          sourceId: latestReceipt.id,
          activityType: 'receipt-uploaded'
        }
      : null,
    latestTime
      ? {
          id: 'activity-time',
          companyId: latestTime.companyId,
          title: 'Tid registrerad',
          description: `${latestTime.employeeName} registrerade ${latestTime.hours} timmar på dagens jobb.`,
          occurredAt: latestTime.createdAt,
          actorType: 'system' as const,
          sourceType: 'project' as const,
          sourceId: latestTime.projectId,
          activityType: 'time-registered'
        }
      : null,
    latestPayment
      ? {
          id: 'activity-payment',
          companyId: latestPayment.companyId,
          title: 'Betalning bokförd',
          description: `${latestPayment.description} bokfördes automatiskt.`,
          occurredAt: latestPayment.createdAt,
          actorType: 'system' as const,
          sourceType: 'bookkeeping' as const,
          sourceId: latestPayment.id,
          activityType: 'payment-booked'
        }
      : null
  ] as MockActivity[];
}

function createProjectDiaryEntries(projects: MockProject[]): MockProjectDiaryEntry[] {
  return [
    {
      id: 'diary-1',
      companyId: projects[0]?.companyId || 'company-main',
      projectId: 'project-1',
      authorName: 'Anders Larsson',
      noteDate: '2026-04-14',
      text: 'Arbetet går enligt plan och kunden vill gärna få en kort uppföljning i morgon.'
    },
    {
      id: 'diary-2',
      companyId: projects[0]?.companyId || 'company-main',
      projectId: 'project-1',
      authorName: 'Sara Nyström',
      noteDate: '2026-04-13',
      text: 'Två filter byttes ut och nytt material beställdes till nästa besök.'
    },
    {
      id: 'diary-3',
      companyId: projects[1]?.companyId || 'company-main',
      projectId: 'project-2',
      authorName: 'Sara Nyström',
      noteDate: '2026-04-14',
      text: 'Styrsystemet är på plats. Vi behöver en sista kontroll innan avslut.'
    },
    {
      id: 'diary-4',
      companyId: projects[2]?.companyId || 'company-main',
      projectId: 'project-3',
      authorName: 'Johan Berg',
      noteDate: '2026-04-12',
      text: 'Kvällspasset blev klart tidigare än väntat och kunden var nöjd.'
    },
    {
      id: 'diary-5',
      companyId: projects[4]?.companyId || 'company-main',
      projectId: 'project-5',
      authorName: 'Linnea Ek',
      noteDate: '2026-04-11',
      text: 'Fläktrummet behöver en till genomgång nästa vecka.'
    }
  ];
}

export function createMockPlatformData(
  onboardingInput: Partial<OnboardingData> | OnboardingData | null
): MockPlatformData {
  const onboarding = resolveOnboardingData(onboardingInput);
  const companies = createCompanies(onboarding);
  const customers = createCustomers(companies);
  const projects = createProjects(customers);
  const invoices = createInvoices(customers).sort((left, right) =>
    right.createdAt.localeCompare(left.createdAt)
  );
  const invoiceLines = createInvoiceLines();
  const receipts = createReceipts(customers).sort((left, right) =>
    right.createdAt.localeCompare(left.createdAt)
  );
  const timeEntries = createTimeEntries(projects).sort((left, right) =>
    right.createdAt.localeCompare(left.createdAt)
  );
  const payrollLines = createPayrollLines(projects).sort((left, right) =>
    right.updatedAt.localeCompare(left.updatedAt)
  );
  const bookkeepingEntries = createBookkeepingEntries(companies).sort((left, right) =>
    right.createdAt.localeCompare(left.createdAt)
  );
  const bookkeepingLines = createBookkeepingLines();
  const importantDateSeeds = createImportantDateSeeds(companies, projects, receipts, payrollLines);
  const activities = createActivities(invoices, receipts, timeEntries, bookkeepingEntries, customers).sort(
    (left, right) => right.occurredAt.localeCompare(left.occurredAt)
  );
  const projectDiaryEntries = createProjectDiaryEntries(projects).sort((left, right) =>
    right.noteDate.localeCompare(left.noteDate, 'sv')
  );

  return {
    onboarding,
    user: createUser(onboarding),
  workspaceUsers: createWorkspaceUsers(onboarding),
    companies,
    customers,
    projects,
    invoices,
    invoiceLines,
    receipts,
    timeEntries,
      payrollLines,
      bookkeepingEntries,
      bookkeepingLines,
      importantDateSeeds,
    activities
    ,
    projectDiaryEntries
  };
}
