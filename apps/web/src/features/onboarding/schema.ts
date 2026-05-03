import { z } from 'zod';

const requiredString = (label: string) => z.string().min(1, `${label} är obligatoriskt.`);

export const planStepSchema = z.object({
  planId: z.enum(['basic', 'premium'], {
    required_error: 'Välj ett paket för att gå vidare.'
  })
});

export const accountStepSchema = z.object({
  firstName: requiredString('Förnamn'),
  lastName: requiredString('Efternamn'),
  email: z
    .string()
    .min(1, 'E-post är obligatoriskt.')
    .email('Skriv en giltig e-postadress.'),
  password: z.string().min(8, 'Lösenordet behöver vara minst 8 tecken.'),
  phone: z
    .string()
    .min(1, 'Mobilnummer är obligatoriskt.')
    .regex(/^[0-9+\-\s]+$/, 'Skriv ett giltigt mobilnummer.')
});

export const companyStepSchema = z.object({
  companyName: requiredString('Företagsnamn'),
  organizationNumber: z
    .string()
    .min(1, 'Organisationsnummer är obligatoriskt.')
    .regex(/^[0-9-]+$/, 'Skriv organisationsnumret med siffror.'),
  companyType: z.enum(['enskild-firma', 'aktiebolag', 'handelsbolag'], {
    required_error: 'Välj företagsform.'
  }),
  vatRegistered: z.boolean({
    required_error: 'Välj om ni är momsregistrerade.'
  })
});

export const structureStepSchema = z
  .object({
    companyStructure: z.enum(
      ['single-company', 'holding-structure', 'multiple-companies', 'later'],
      {
        required_error: 'Välj det som passar er bäst.'
      }
    ),
    parentCompanyName: z.string(),
    companyCountNow: z.string()
  })
  .superRefine((value, context) => {
    const needsMoreInfo =
      value.companyStructure === 'holding-structure' ||
      value.companyStructure === 'multiple-companies';

    if (needsMoreInfo && value.parentCompanyName.trim().length === 0) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['parentCompanyName'],
        message: 'Skriv namnet på huvudbolaget.'
      });
    }

    if (needsMoreInfo && value.companyCountNow.trim().length === 0) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['companyCountNow'],
        message: 'Skriv hur många bolag ni vill lägga upp nu.'
      });
    }
  });

export const workStepSchema = z.object({
  employeeCount: requiredString('Antal anställda'),
  usesProjects: z.boolean({
    required_error: 'Välj om ni jobbar med projekt.'
  }),
  wantsTimeTracking: z.boolean({
    required_error: 'Välj om ni vill använda tidrapportering.'
  }),
  mobileInvoicing: z.boolean({
    required_error: 'Välj om ni vill skapa fakturor i mobilen.'
  })
});

export type PlanStepValues = z.infer<typeof planStepSchema>;
export type AccountStepValues = z.infer<typeof accountStepSchema>;
export type CompanyStepValues = z.infer<typeof companyStepSchema>;
export type StructureStepValues = z.infer<typeof structureStepSchema>;
export type WorkStepValues = z.infer<typeof workStepSchema>;
