import { BackofficeCaseDetailPage } from '@/features/backoffice/backoffice-pages';

export default function Page({ params }: { params: { id: string } }) {
  return <BackofficeCaseDetailPage caseId={params.id} />;
}
