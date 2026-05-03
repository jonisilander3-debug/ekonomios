import { CustomerCaseLogPage } from '@/features/details/detail-pages';

export default function Page({ params }: { params: { id: string } }) {
  return <CustomerCaseLogPage customerId={params.id} />;
}
