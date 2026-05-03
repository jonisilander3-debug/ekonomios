import { Prisma } from '@prisma/client';

import { prisma } from '../src/client';

const DEMO_PASSWORD = 'apakaka1';

type DemoCompanySeed = {
  key: string;
  name: string;
  organizationNumber: string;
  owner: {
    email: string;
    firstName: string;
    lastName: string;
    role: 'OWNER' | 'ADMIN';
    title: string;
    hourlyRate: number;
  };
  customers: Array<{
    id: string;
    name: string;
    email?: string;
    phone?: string;
  }>;
  project: {
    id: string;
    customerId: string;
    name: string;
    startDate: string;
  };
  invoice: {
    number: string;
    customerId: string;
    issueDate: string;
    dueDate: string;
    status: 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE';
    totalNet: number;
    totalVat: number;
    totalGross: number;
    description: string;
  };
  receipts: Array<{
    vendorName: string;
    amountGross: number;
    receiptDate: string;
  }>;
  payroll: {
    periodStart: string;
    periodEnd: string;
    grossAmount: number;
    description: string;
  };
  insights: Array<{
    title: string;
    body: string;
    type: 'INFO' | 'WARNING' | 'ACTION';
  }>;
};

const DEMO_COMPANIES: DemoCompanySeed[] = [
  {
    key: 'nordic-service',
    name: 'Nordic Service Group AB',
    organizationNumber: '559123-4567',
    owner: {
      email: 'anders@nordicservice.se',
      firstName: 'Anders',
      lastName: 'Larsson',
      role: 'OWNER',
      title: 'Driftledare',
      hourlyRate: 285
    },
    customers: [
      { id: 'demo-customer-nsg-1', name: 'Brf Solsidan', email: 'styrelsen@solsidan.se', phone: '08-555 10 20' },
      { id: 'demo-customer-nsg-2', name: 'Lindqvist Fastigheter', email: 'kontakt@lindqvistfast.se', phone: '031-80 10 20' }
    ],
    project: {
      id: 'demo-project-nsg-1',
      customerId: 'demo-customer-nsg-1',
      name: 'Varservice ventilation',
      startDate: '2026-04-01T08:00:00.000Z'
    },
    invoice: {
      number: '2026-1001',
      customerId: 'demo-customer-nsg-2',
      issueDate: '2026-04-10T00:00:00.000Z',
      dueDate: '2026-04-30T00:00:00.000Z',
      status: 'SENT',
      totalNet: 6400,
      totalVat: 1600,
      totalGross: 8000,
      description: 'Varservice ventilation'
    },
    receipts: [
      { vendorName: 'Tools Sverige AB', amountGross: 1280, receiptDate: '2026-04-14T07:10:00.000Z' },
      { vendorName: 'Byggvaror Norr', amountGross: 695, receiptDate: '2026-04-14T11:40:00.000Z' }
    ],
    payroll: {
      periodStart: '2026-04-01T00:00:00.000Z',
      periodEnd: '2026-04-30T00:00:00.000Z',
      grossAmount: 28500,
      description: 'Timlon april'
    },
    insights: [
      {
        title: 'Dagens lage',
        body: 'Tre underlag vantar pa kontroll och loneunderlaget ar nastan klart for manaden.',
        type: 'INFO'
      },
      {
        title: 'Nasta steg',
        body: 'Skicka in sista servicekvittot och kontrollera aprilfakturan innan manadsskiftet.',
        type: 'ACTION'
      }
    ]
  },
  {
    key: 'berg-dal',
    name: 'Berg & Dal Entreprenad AB',
    organizationNumber: '559233-1201',
    owner: {
      email: 'mia@bergdal.se',
      firstName: 'Mia',
      lastName: 'Berg',
      role: 'OWNER',
      title: 'Platschef',
      hourlyRate: 315
    },
    customers: [
      { id: 'demo-customer-bd-1', name: 'Uppsala Markservice', email: 'inkop@markservice.se', phone: '018-11 22 33' },
      { id: 'demo-customer-bd-2', name: 'Stadshuset Drift', email: 'drift@stadshuset.se', phone: '08-701 44 10' }
    ],
    project: {
      id: 'demo-project-bd-1',
      customerId: 'demo-customer-bd-1',
      name: 'Grundarbete etapp 2',
      startDate: '2026-04-04T07:00:00.000Z'
    },
    invoice: {
      number: '2026-2001',
      customerId: 'demo-customer-bd-2',
      issueDate: '2026-04-08T00:00:00.000Z',
      dueDate: '2026-04-28T00:00:00.000Z',
      status: 'OVERDUE',
      totalNet: 18200,
      totalVat: 4550,
      totalGross: 22750,
      description: 'Markberedning och etablering'
    },
    receipts: [
      { vendorName: 'Maskincentrum AB', amountGross: 4420, receiptDate: '2026-04-11T10:30:00.000Z' },
      { vendorName: 'Branslepartner Ost', amountGross: 1840, receiptDate: '2026-04-12T15:20:00.000Z' }
    ],
    payroll: {
      periodStart: '2026-04-01T00:00:00.000Z',
      periodEnd: '2026-04-30T00:00:00.000Z',
      grossAmount: 39200,
      description: 'Loner april'
    },
    insights: [
      {
        title: 'Likviditet',
        body: 'En forfallen faktura bor foljas upp innan nya maskininkop goras.',
        type: 'WARNING'
      },
      {
        title: 'Underlag',
        body: 'Tva drivmedelskvitton ligger fortfarande och vantar pa bokforing.',
        type: 'ACTION'
      }
    ]
  },
  {
    key: 'svea-el',
    name: 'Svea El & Montage AB',
    organizationNumber: '559244-8810',
    owner: {
      email: 'elin@sveael.se',
      firstName: 'Elin',
      lastName: 'Sund',
      role: 'OWNER',
      title: 'Projektansvarig',
      hourlyRate: 305
    },
    customers: [
      { id: 'demo-customer-se-1', name: 'Fastighetspartner Syd', email: 'projekt@fpsyd.se', phone: '040-14 55 20' },
      { id: 'demo-customer-se-2', name: 'Nya Hamnmagasinet', email: 'kontakt@hamnmagasinet.se', phone: '040-81 21 11' }
    ],
    project: {
      id: 'demo-project-se-1',
      customerId: 'demo-customer-se-1',
      name: 'Belysning lagerhall',
      startDate: '2026-04-02T06:30:00.000Z'
    },
    invoice: {
      number: '2026-3001',
      customerId: 'demo-customer-se-2',
      issueDate: '2026-04-09T00:00:00.000Z',
      dueDate: '2026-04-29T00:00:00.000Z',
      status: 'SENT',
      totalNet: 12400,
      totalVat: 3100,
      totalGross: 15500,
      description: 'Montage och material belysning'
    },
    receipts: [
      { vendorName: 'Elmaterial Syd', amountGross: 2675, receiptDate: '2026-04-13T08:45:00.000Z' },
      { vendorName: 'Liftuthyrning AB', amountGross: 3490, receiptDate: '2026-04-13T14:15:00.000Z' }
    ],
    payroll: {
      periodStart: '2026-04-01T00:00:00.000Z',
      periodEnd: '2026-04-30T00:00:00.000Z',
      grossAmount: 33100,
      description: 'Loner april'
    },
    insights: [
      {
        title: 'Tidrapport',
        body: 'En montor saknar tidrapport for fredag och bor fylla i den innan loner koras.',
        type: 'ACTION'
      },
      {
        title: 'Projektlage',
        body: 'Projektet i lagerhallen gar enligt plan och fakturaunderlaget ar klart.',
        type: 'INFO'
      }
    ]
  },
  {
    key: 'nordkap-holding',
    name: 'Nordkap Holding AB',
    organizationNumber: '559310-0001',
    owner: {
      email: 'clara@nordkapholding.se',
      firstName: 'Clara',
      lastName: 'Norin',
      role: 'OWNER',
      title: 'Koncernchef',
      hourlyRate: 355
    },
    customers: [
      { id: 'demo-customer-nh-1', name: 'Nordkap Drift AB', email: 'ledning@nordkapdrift.se', phone: '08-700 11 01' },
      { id: 'demo-customer-nh-2', name: 'Nordkap Teknik AB', email: 'ledning@nordkapteknik.se', phone: '08-700 11 02' }
    ],
    project: {
      id: 'demo-project-nh-1',
      customerId: 'demo-customer-nh-1',
      name: 'Koncernrapportering Q2',
      startDate: '2026-04-01T09:00:00.000Z'
    },
    invoice: {
      number: '2026-4001',
      customerId: 'demo-customer-nh-2',
      issueDate: '2026-04-15T00:00:00.000Z',
      dueDate: '2026-05-05T00:00:00.000Z',
      status: 'DRAFT',
      totalNet: 9800,
      totalVat: 2450,
      totalGross: 12250,
      description: 'Koncernledning och rapportering'
    },
    receipts: [
      { vendorName: 'Styrelserummet AB', amountGross: 1575, receiptDate: '2026-04-10T12:00:00.000Z' }
    ],
    payroll: {
      periodStart: '2026-04-01T00:00:00.000Z',
      periodEnd: '2026-04-30T00:00:00.000Z',
      grossAmount: 46800,
      description: 'Ledningslon april'
    },
    insights: [
      {
        title: 'Koncernoversikt',
        body: 'Holdingbolaget anvands som demo for koncernstyrning tillsammans med Nordkap Drift och Nordkap Teknik.',
        type: 'INFO'
      }
    ]
  },
  {
    key: 'nordkap-drift',
    name: 'Nordkap Drift AB',
    organizationNumber: '559310-0002',
    owner: {
      email: 'johan@nordkapdrift.se',
      firstName: 'Johan',
      lastName: 'Ek',
      role: 'OWNER',
      title: 'VD',
      hourlyRate: 295
    },
    customers: [
      { id: 'demo-customer-nd-1', name: 'Hamnterminalen AB', email: 'drift@hamnterminalen.se', phone: '031-44 55 66' },
      { id: 'demo-customer-nd-2', name: 'Citypark Forvaltning', email: 'kund@citypark.se', phone: '031-77 77 88' }
    ],
    project: {
      id: 'demo-project-nd-1',
      customerId: 'demo-customer-nd-1',
      name: 'Drift och tillsyn hamn',
      startDate: '2026-04-03T05:30:00.000Z'
    },
    invoice: {
      number: '2026-5001',
      customerId: 'demo-customer-nd-2',
      issueDate: '2026-04-07T00:00:00.000Z',
      dueDate: '2026-04-27T00:00:00.000Z',
      status: 'SENT',
      totalNet: 14800,
      totalVat: 3700,
      totalGross: 18500,
      description: 'Lopande drift och jour'
    },
    receipts: [
      { vendorName: 'Stadservice Vast', amountGross: 2140, receiptDate: '2026-04-11T09:35:00.000Z' },
      { vendorName: 'Jourlager AB', amountGross: 925, receiptDate: '2026-04-12T16:05:00.000Z' }
    ],
    payroll: {
      periodStart: '2026-04-01T00:00:00.000Z',
      periodEnd: '2026-04-30T00:00:00.000Z',
      grossAmount: 36200,
      description: 'Loner april'
    },
    insights: [
      {
        title: 'Driftlage',
        body: 'Jourkostnaderna ar under kontroll men ett kvitto saknar fortfarande underlag.',
        type: 'INFO'
      }
    ]
  },
  {
    key: 'nordkap-teknik',
    name: 'Nordkap Teknik AB',
    organizationNumber: '559310-0003',
    owner: {
      email: 'sara@nordkapteknik.se',
      firstName: 'Sara',
      lastName: 'Lind',
      role: 'OWNER',
      title: 'Teknisk chef',
      hourlyRate: 325
    },
    customers: [
      { id: 'demo-customer-nt-1', name: 'Arctic Logistics', email: 'service@arcticlogistics.se', phone: '0920-11 22 33' },
      { id: 'demo-customer-nt-2', name: 'Kylcenter Norr', email: 'ekonomi@kylcenternorr.se', phone: '0920-44 55 66' }
    ],
    project: {
      id: 'demo-project-nt-1',
      customerId: 'demo-customer-nt-1',
      name: 'Sensorbyte och uppgradering',
      startDate: '2026-04-05T07:45:00.000Z'
    },
    invoice: {
      number: '2026-6001',
      customerId: 'demo-customer-nt-2',
      issueDate: '2026-04-16T00:00:00.000Z',
      dueDate: '2026-05-06T00:00:00.000Z',
      status: 'SENT',
      totalNet: 22600,
      totalVat: 5650,
      totalGross: 28250,
      description: 'Teknisk uppgradering och sensorsats'
    },
    receipts: [
      { vendorName: 'Teknikgrossisten AB', amountGross: 5980, receiptDate: '2026-04-15T08:20:00.000Z' },
      { vendorName: 'Resor Norrland', amountGross: 1225, receiptDate: '2026-04-15T18:00:00.000Z' }
    ],
    payroll: {
      periodStart: '2026-04-01T00:00:00.000Z',
      periodEnd: '2026-04-30T00:00:00.000Z',
      grossAmount: 41800,
      description: 'Loner april'
    },
    insights: [
      {
        title: 'Underlag till loner',
        body: 'Reserakning och ett traktamentesunderlag vantar pa bekraftelse i slutet av veckan.',
        type: 'WARNING'
      }
    ]
  }
];

const BACKOFFICE_USERS = [
  {
    key: 'admin',
    email: 'admin.demo@ekonomios.local',
    firstName: 'Lina',
    lastName: 'Holm',
    role: 'ADMIN' as const,
    backofficeRole: 'ADMIN_SUPPORT' as const,
    department: 'drift'
  },
  {
    key: 'kundtjanst',
    email: 'kundtjanst.demo@ekonomios.local',
    firstName: 'Nora',
    lastName: 'Ekman',
    role: 'EMPLOYEE' as const,
    backofficeRole: 'CUSTOMER_SUPPORT' as const,
    department: 'kundtjanst'
  },
  {
    key: 'bokforare',
    email: 'bokforare.demo@ekonomios.local',
    firstName: 'Oskar',
    lastName: 'Bergman',
    role: 'EMPLOYEE' as const,
    backofficeRole: 'ACCOUNTANT' as const,
    department: 'bokforing'
  },
  {
    key: 'revisor',
    email: 'revisor.demo@ekonomios.local',
    firstName: 'Helena',
    lastName: 'Sjoberg',
    role: 'EMPLOYEE' as const,
    backofficeRole: 'AUDITOR' as const,
    department: 'revision'
  },
  {
    key: 'jurist',
    email: 'jurist.demo@ekonomios.local',
    firstName: 'Markus',
    lastName: 'Wallin',
    role: 'EMPLOYEE' as const,
    backofficeRole: 'CORPORATE_LAWYER' as const,
    department: 'juridik'
  },
  {
    key: 'skattejurist',
    email: 'skattejurist.demo@ekonomios.local',
    firstName: 'Iris',
    lastName: 'Dahl',
    role: 'EMPLOYEE' as const,
    backofficeRole: 'TAX_LAWYER' as const,
    department: 'skatt'
  }
];

type SeededUser = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
};

type BackofficeSeedUserMap = {
  admin: SeededUser;
  kundtjanst: SeededUser;
  bokforare: SeededUser;
  revisor: SeededUser;
  jurist: SeededUser;
  skattejurist: SeededUser;
};

function decimal(value: number) {
  return new Prisma.Decimal(value);
}

function fullName(user: { firstName: string; lastName: string }) {
  return `${user.firstName} ${user.lastName}`;
}

async function clearCompanyOperationalData(companyId: string) {
  await prisma.backofficeThread.deleteMany({ where: { companyId } });
  await prisma.attachment.deleteMany({ where: { companyId } });
  await prisma.aIInsight.deleteMany({ where: { companyId } });
  await prisma.payrollLine.deleteMany({
    where: {
      payrollRun: {
        companyId
      }
    }
  });
  await prisma.payrollRun.deleteMany({ where: { companyId } });
  await prisma.bookkeepingEntry.deleteMany({
    where: {
      voucher: {
        companyId
      }
    }
  });
  await prisma.bookkeepingVoucher.deleteMany({ where: { companyId } });
  await prisma.receipt.deleteMany({ where: { companyId } });
  await prisma.invoiceLine.deleteMany({
    where: {
      invoice: {
        companyId
      }
    }
  });
  await prisma.invoice.deleteMany({ where: { companyId } });
  await prisma.workDiaryEntry.deleteMany({ where: { companyId } });
  await prisma.timeEntry.deleteMany({ where: { companyId } });
}

async function seedBackofficeCompany() {
  const company = await prisma.company.upsert({
    where: { organizationNumber: '559900-1000' },
    update: {
      name: 'Ekonomi OS Backoffice AB'
    },
    create: {
      name: 'Ekonomi OS Backoffice AB',
      organizationNumber: '559900-1000'
    }
  });

  const users = await Promise.all(
    BACKOFFICE_USERS.map(async (definition) => {
      const user = await prisma.user.upsert({
        where: { email: definition.email },
        update: {
          companyId: company.id,
          firstName: definition.firstName,
          lastName: definition.lastName,
          passwordHash: DEMO_PASSWORD,
          role: definition.role
        },
        create: {
          companyId: company.id,
          email: definition.email,
          firstName: definition.firstName,
          lastName: definition.lastName,
          passwordHash: DEMO_PASSWORD,
          role: definition.role
        }
      });

      return { ...definition, user };
    })
  );

  await prisma.backofficeUserRoleAssignment.deleteMany({
    where: {
      userId: {
        in: users.map((item) => item.user.id)
      }
    }
  });

  await prisma.backofficeUserRoleAssignment.createMany({
    data: users.map((item) => ({
      userId: item.user.id,
      roleKey: item.backofficeRole,
      isPrimary: true,
      isActive: true,
      department: item.department
    }))
  });

  await prisma.backofficePermissionOverride.deleteMany({
    where: {
      userId: {
        in: users.map((item) => item.user.id)
      }
    }
  });

  return {
    company,
    users: {
      admin: users.find((item) => item.key === 'admin')!.user,
      kundtjanst: users.find((item) => item.key === 'kundtjanst')!.user,
      bokforare: users.find((item) => item.key === 'bokforare')!.user,
      revisor: users.find((item) => item.key === 'revisor')!.user,
      jurist: users.find((item) => item.key === 'jurist')!.user,
      skattejurist: users.find((item) => item.key === 'skattejurist')!.user
    }
  };
}

async function seedCompany(companySeed: DemoCompanySeed, backofficeUsers: BackofficeSeedUserMap) {
  const { admin, bokforare, kundtjanst, skattejurist } = backofficeUsers;
  const company = await prisma.company.upsert({
    where: { organizationNumber: companySeed.organizationNumber },
    update: {
      name: companySeed.name
    },
    create: {
      name: companySeed.name,
      organizationNumber: companySeed.organizationNumber
    }
  });

  const owner = await prisma.user.upsert({
    where: { email: companySeed.owner.email },
    update: {
      companyId: company.id,
      firstName: companySeed.owner.firstName,
      lastName: companySeed.owner.lastName,
      passwordHash: DEMO_PASSWORD,
      role: companySeed.owner.role
    },
    create: {
      companyId: company.id,
      email: companySeed.owner.email,
      firstName: companySeed.owner.firstName,
      lastName: companySeed.owner.lastName,
      passwordHash: DEMO_PASSWORD,
      role: companySeed.owner.role
    }
  });

  const employee = await prisma.employeeProfile.upsert({
    where: { userId: owner.id },
    update: {
      companyId: company.id,
      employeeNumber: `${companySeed.key}-001`,
      title: companySeed.owner.title,
      hourlyRate: decimal(companySeed.owner.hourlyRate)
    },
    create: {
      companyId: company.id,
      userId: owner.id,
      employeeNumber: `${companySeed.key}-001`,
      title: companySeed.owner.title,
      hourlyRate: decimal(companySeed.owner.hourlyRate)
    }
  });

  await Promise.all(
    companySeed.customers.map((customer) =>
      prisma.customer.upsert({
        where: { id: customer.id },
        update: {
          companyId: company.id,
          name: customer.name,
          email: customer.email,
          phone: customer.phone
        },
        create: {
          id: customer.id,
          companyId: company.id,
          name: customer.name,
          email: customer.email,
          phone: customer.phone
        }
      })
    )
  );

  await prisma.project.upsert({
    where: { id: companySeed.project.id },
    update: {
      companyId: company.id,
      customerId: companySeed.project.customerId,
      name: companySeed.project.name,
      status: 'ACTIVE',
      startDate: new Date(companySeed.project.startDate)
    },
    create: {
      id: companySeed.project.id,
      companyId: company.id,
      customerId: companySeed.project.customerId,
      name: companySeed.project.name,
      status: 'ACTIVE',
      startDate: new Date(companySeed.project.startDate)
    }
  });

  await clearCompanyOperationalData(company.id);

  await prisma.account.createMany({
    data: [
      { companyId: company.id, code: '1510', name: 'Kundfordringar' },
      { companyId: company.id, code: '1930', name: 'Foretagskonto' },
      { companyId: company.id, code: '2440', name: 'Leverantorsskulder' },
      { companyId: company.id, code: '2641', name: 'Ingaende moms' },
      { companyId: company.id, code: '3010', name: 'Forsaljning tjanster' }
    ],
    skipDuplicates: true
  });

  await prisma.vATCode.createMany({
    data: [{ companyId: company.id, code: '25', description: 'Moms 25%', rate: 25 }],
    skipDuplicates: true
  });

  await prisma.timeEntry.createMany({
    data: [
      {
        companyId: company.id,
        userId: owner.id,
        projectId: companySeed.project.id,
        startedAt: new Date('2026-04-14T06:00:00.000Z'),
        endedAt: new Date('2026-04-14T08:00:00.000Z'),
        minutes: 120,
        note: 'Planering och uppfoljning'
      },
      {
        companyId: company.id,
        userId: owner.id,
        projectId: companySeed.project.id,
        startedAt: new Date('2026-04-14T08:30:00.000Z'),
        endedAt: new Date('2026-04-14T10:00:00.000Z'),
        minutes: 90,
        note: 'Genomgang av underlag'
      }
    ]
  });

  await prisma.workDiaryEntry.create({
    data: {
      companyId: company.id,
      userId: owner.id,
      projectId: companySeed.project.id,
      title: 'Statusuppdatering',
      description: 'Arbetet fortsatter enligt plan och underlagen ar forberedda for vidare hantering.',
      workedOn: new Date('2026-04-14T09:00:00.000Z')
    }
  });

  const invoice = await prisma.invoice.create({
    data: {
      companyId: company.id,
      customerId: companySeed.invoice.customerId,
      projectId: companySeed.project.id,
      invoiceNumber: companySeed.invoice.number,
      issueDate: new Date(companySeed.invoice.issueDate),
      dueDate: new Date(companySeed.invoice.dueDate),
      status: companySeed.invoice.status,
      totalNet: decimal(companySeed.invoice.totalNet),
      totalVat: decimal(companySeed.invoice.totalVat),
      totalGross: decimal(companySeed.invoice.totalGross),
      lines: {
        create: [
          {
            description: companySeed.invoice.description,
            quantity: decimal(1),
            unitPrice: decimal(companySeed.invoice.totalNet),
            vatRate: decimal(25),
            totalNet: decimal(companySeed.invoice.totalNet),
            totalVat: decimal(companySeed.invoice.totalVat),
            totalGross: decimal(companySeed.invoice.totalGross)
          }
        ]
      }
    }
  });

  const createdReceipts = await Promise.all(
    companySeed.receipts.map((receipt) =>
      prisma.receipt.create({
        data: {
          companyId: company.id,
          userId: owner.id,
          receiptDate: new Date(receipt.receiptDate),
          vendorName: receipt.vendorName,
          amountGross: decimal(receipt.amountGross),
          status: 'PENDING_REVIEW'
        }
      })
    )
  );

  const payrollRun = await prisma.payrollRun.create({
    data: {
      companyId: company.id,
      periodStart: new Date(companySeed.payroll.periodStart),
      periodEnd: new Date(companySeed.payroll.periodEnd),
      status: 'DRAFT',
      lines: {
        create: [
          {
            employeeProfileId: employee.id,
            description: companySeed.payroll.description,
            grossAmount: decimal(companySeed.payroll.grossAmount)
          }
        ]
      }
    }
  });

  await prisma.aIInsight.createMany({
    data: companySeed.insights.map((insight) => ({
      companyId: company.id,
      userId: owner.id,
      title: insight.title,
      body: insight.body,
      type: insight.type
    }))
  });

  await prisma.attachment.createMany({
    data: [
      {
        companyId: company.id,
        receiptId: createdReceipts[0]?.id,
        fileName: `${companySeed.key}-receipt.pdf`,
        mimeType: 'application/pdf',
        storageKey: `demo/${companySeed.key}/receipts/primary.pdf`
      },
      {
        companyId: company.id,
        invoiceId: invoice.id,
        projectId: companySeed.project.id,
        fileName: `${companySeed.key}-invoice.pdf`,
        mimeType: 'application/pdf',
        storageKey: `demo/${companySeed.key}/invoices/${companySeed.invoice.number}.pdf`
      }
    ].filter((item) => Boolean(item.receiptId) || Boolean(item.invoiceId)) as Prisma.AttachmentCreateManyInput[]
  });

  const threads = [
    {
      id: `thread-${companySeed.key}-invoice`,
      title: `Fraga om faktura ${companySeed.invoice.number}`,
      status: 'WAITING_FOR_CUSTOMER' as const,
      priority: 'high',
      sourceType: 'invoice',
      sourceId: invoice.id,
      objectLinks: [
        {
          targetType: 'INVOICE' as const,
          targetId: invoice.id,
          label: `Faktura ${companySeed.invoice.number}`,
          href: '/fakturor',
          isPrimary: true
        }
      ],
      messages: [
        {
          senderUserId: bokforare.id,
          senderRoleKey: 'ACCOUNTANT' as const,
          visibility: 'EXTERNAL' as const,
          direction: 'OUTBOUND' as const,
          status: 'SENT' as const,
          body: 'Hej! Vi vill att du kontrollerar underlaget och bekraktar om fakturan kan skickas vidare idag.',
          metadata: {
            senderDisplayName: fullName(bokforare),
            senderEmail: bokforare.email
          }
        },
        {
          senderUserId: owner.id,
          visibility: 'EXTERNAL' as const,
          direction: 'INBOUND' as const,
          status: 'UNREAD' as const,
          body: 'Jag tittar pa detta under eftermiddagen och aterkommer med komplettering.',
          metadata: {
            senderDisplayName: fullName(owner),
            senderEmail: owner.email
          }
        }
      ]
    },
    {
      id: `thread-${companySeed.key}-receipt`,
      title: 'Komplettera kvitto',
      status: 'WAITING_FOR_BACKOFFICE' as const,
      priority: 'medium',
      sourceType: 'receipt',
      sourceId: createdReceipts[0]?.id,
      objectLinks: createdReceipts[0]
        ? [
            {
              targetType: 'RECEIPT' as const,
              targetId: createdReceipts[0].id,
              label: createdReceipts[0].vendorName,
              href: '/kvitton',
              isPrimary: true
            }
          ]
        : [],
      messages: [
        {
          senderUserId: owner.id,
          visibility: 'EXTERNAL' as const,
          direction: 'INBOUND' as const,
          status: 'READ' as const,
          body: 'Nu har jag laddat upp kvittot och skrivit vad inkopet avser.',
          metadata: {
            senderDisplayName: fullName(owner),
            senderEmail: owner.email
          }
        },
        {
          senderUserId: kundtjanst.id,
          senderRoleKey: 'CUSTOMER_SUPPORT' as const,
          visibility: 'EXTERNAL' as const,
          direction: 'OUTBOUND' as const,
          status: 'SENT' as const,
          body: 'Tack! Vi har tagit emot underlaget och skickar det vidare till bokforing.',
          metadata: {
            senderDisplayName: fullName(kundtjanst),
            senderEmail: kundtjanst.email
          }
        }
      ]
    },
    {
      id: `thread-${companySeed.key}-payroll`,
      title: 'Loneunderlag april',
      status: 'WAITING_FOR_CUSTOMER' as const,
      priority: 'high',
      sourceType: 'payroll_run',
      sourceId: payrollRun.id,
      objectLinks: [
        {
          targetType: 'PAYROLL_RUN' as const,
          targetId: payrollRun.id,
          label: 'Loner april',
          href: '/loner',
          isPrimary: true
        }
      ],
      messages: [
        {
          senderUserId: skattejurist.id,
          senderRoleKey: 'TAX_LAWYER' as const,
          visibility: 'EXTERNAL' as const,
          direction: 'OUTBOUND' as const,
          status: 'SENT' as const,
          body: 'Vi behover ett sista besked om reseersattning innan vi kan lasa lonekornigen.',
          metadata: {
            senderDisplayName: fullName(skattejurist),
            senderEmail: skattejurist.email
          }
        }
      ]
    }
  ];

  for (const threadSeed of threads) {
    await prisma.backofficeThread.create({
      data: {
        id: threadSeed.id,
        companyId: company.id,
        title: threadSeed.title,
        status: threadSeed.status,
        priority: threadSeed.priority,
        sourceType: threadSeed.sourceType,
        sourceId: threadSeed.sourceId,
        participants: {
          create: [
            {
              userId: owner.id,
              participantType: 'CUSTOMER_CONTACT',
              displayName: fullName(owner),
              email: owner.email
            },
            {
              userId: admin.id,
              roleKey: 'ADMIN_SUPPORT',
              participantType: 'INTERNAL_USER',
              displayName: fullName(admin),
              email: admin.email
            }
          ]
        },
        objectLinks: threadSeed.objectLinks.length
          ? {
              create: threadSeed.objectLinks
            }
          : undefined,
        messages: {
          create: threadSeed.messages
        }
      }
    });
  }

  return {
    company,
    owner,
    invoice,
    payrollRun
  };
}

async function main() {
  const backoffice = await seedBackofficeCompany();

  const seededCompanies = [];
  for (const companySeed of DEMO_COMPANIES) {
    seededCompanies.push(await seedCompany(companySeed, backoffice.users));
  }

  console.log('Seed klar.');
  console.log(`Demo-losenord for alla seedade konton: ${DEMO_PASSWORD}`);
  console.log('Kundbolag:');
  for (const item of DEMO_COMPANIES) {
    console.log(`- ${item.name} (${item.organizationNumber}) -> ${item.owner.email}`);
  }
  console.log('Backoffice-konton:');
  for (const item of BACKOFFICE_USERS) {
    console.log(`- ${item.backofficeRole}: ${item.email}`);
  }
  console.log(
    `Koncernfamilj skapad i demo: Nordkap Holding AB, Nordkap Drift AB och Nordkap Teknik AB. Totalt bolag seedade: ${seededCompanies.length + 1}`
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
