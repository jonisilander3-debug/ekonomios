import type { BackofficeWorkspaceProfile } from './backoffice-roles.types';

export const BACKOFFICE_WORKSPACE_PROFILES: Record<BackofficeWorkspaceProfile['id'], BackofficeWorkspaceProfile> = {
  customer_service: {
    id: 'customer_service',
    title: 'Kundtjänst',
    summary: 'Inkorg, kundfrågor och sådant som riskerar att bryta vår svarstid.',
    heroTitle: 'Första linjen för kundfrågor och uppföljning',
    heroDescription: 'Börja med olästa frågor, eskalera det som kräver specialist och håll svarstiden kort.',
    queueOrder: ['customer_questions', 'tasks', 'ai_signals', 'exceptions', 'receipt_review', 'bookkeeping_review', 'vat_review', 'payroll_review', 'document_review'],
    spotlightQueues: ['customer_questions', 'tasks', 'ai_signals']
  },
  bookkeeper: {
    id: 'bookkeeper',
    title: 'Bokföring',
    summary: 'Verifikationer, kvitton, moms och sådant som stoppar periodarbetet.',
    heroTitle: 'Kontrolltorn för bokföring och löpande ekonomi',
    heroDescription: 'Fokusera på verifikationer, kvitton och momsflöden som behöver mänsklig kontroll.',
    queueOrder: ['bookkeeping_review', 'receipt_review', 'vat_review', 'payroll_review', 'exceptions', 'tasks', 'customer_questions', 'document_review', 'ai_signals'],
    spotlightQueues: ['bookkeeping_review', 'receipt_review', 'vat_review']
  },
  auditor: {
    id: 'auditor',
    title: 'Revision',
    summary: 'Avvikelser, bokslut, dokument och bolag med förhöjd risk.',
    heroTitle: 'Granskning, kontrollpunkter och fördjupad uppföljning',
    heroDescription: 'Ta först bolag med tydliga avvikelser, sena underlag eller förhöjd risknivå.',
    queueOrder: ['exceptions', 'document_review', 'vat_review', 'bookkeeping_review', 'tasks', 'customer_questions', 'receipt_review', 'payroll_review', 'ai_signals'],
    spotlightQueues: ['exceptions', 'document_review', 'vat_review']
  },
  lawyer: {
    id: 'lawyer',
    title: 'Bolagsjuridik',
    summary: 'Avtal, dokument och frågor som rör struktur, ansvar eller bolagsrätt.',
    heroTitle: 'Juridiskt arbetsläge för avtal och bolagsfrågor',
    heroDescription: 'Prioritera juridiska ärenden, dokument som väntar och sådant som påverkar bolagets ansvar.',
    queueOrder: ['exceptions', 'document_review', 'customer_questions', 'tasks', 'ai_signals', 'vat_review', 'bookkeeping_review', 'receipt_review', 'payroll_review'],
    spotlightQueues: ['exceptions', 'document_review', 'customer_questions']
  },
  tax: {
    id: 'tax',
    title: 'Skatt',
    summary: 'Skatteärenden, moms, AGI-risker och AI-flaggade frågor.',
    heroTitle: 'Skattebord för moms, AGI och riskärenden',
    heroDescription: 'Börja med det som påverkar skatterisk, momsdeadline eller flera bolag samtidigt.',
    queueOrder: ['vat_review', 'ai_signals', 'exceptions', 'tasks', 'bookkeeping_review', 'customer_questions', 'document_review', 'receipt_review', 'payroll_review'],
    spotlightQueues: ['vat_review', 'ai_signals', 'exceptions']
  },
  admin: {
    id: 'admin',
    title: 'Admin / support',
    summary: 'Tekniska problem, blockerade flöden, behörigheter och sådant som faller mellan team.',
    heroTitle: 'Överblick för support, incidenter och blockerade flöden',
    heroDescription: 'Se allt, hoppa in där flöden fastnar och hjälp andra team vidare utan att tappa kontrollen.',
    queueOrder: ['ai_signals', 'customer_questions', 'exceptions', 'tasks', 'bookkeeping_review', 'receipt_review', 'vat_review', 'payroll_review', 'document_review'],
    spotlightQueues: ['ai_signals', 'customer_questions', 'exceptions']
  }
};
