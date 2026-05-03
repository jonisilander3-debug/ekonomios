import { CustomerProjectPage } from '@/features/details/detail-pages';

export default function Page({ params }: { params: { id: string } }) {
  return <CustomerProjectPage projectId={params.id} />;
}
