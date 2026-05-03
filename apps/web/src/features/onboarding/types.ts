export type PlanId = 'basic' | 'premium';
export type CompanyType = 'enskild-firma' | 'aktiebolag' | 'handelsbolag';
export type CompanyStructure =
  | 'single-company'
  | 'holding-structure'
  | 'multiple-companies'
  | 'later';

export interface OnboardingData {
  planId: PlanId | null;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  companyName: string;
  organizationNumber: string;
  companyType: CompanyType | '';
  vatRegistered: boolean | null;
  companyStructure: CompanyStructure | null;
  parentCompanyName: string;
  companyCountNow: string;
  employeeCount: string;
  usesProjects: boolean | null;
  wantsTimeTracking: boolean | null;
  mobileInvoicing: boolean | null;
}

export const initialOnboardingData: OnboardingData = {
  planId: null,
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  phone: '',
  companyName: '',
  organizationNumber: '',
  companyType: '',
  vatRegistered: null,
  companyStructure: null,
  parentCompanyName: '',
  companyCountNow: '',
  employeeCount: '',
  usesProjects: null,
  wantsTimeTracking: null,
  mobileInvoicing: null
};
