import { BackofficeCompanyRoutePage } from '@/features/backoffice/backoffice-route-pages';

export default function Page({ params }: { params: { id: string } }) {
  return <BackofficeCompanyRoutePage companyId={params.id} />;
}
