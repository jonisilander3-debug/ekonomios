import { CustomerDetailPage } from '@/features/details/detail-pages';

export default function Page({ params }: { params: { id: string } }) {
  return <CustomerDetailPage customerId={params.id} />;
}
