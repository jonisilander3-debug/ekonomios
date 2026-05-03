import { InvoiceDetailPage } from '@/features/details/detail-pages';

export default function Page({ params }: { params: { id: string } }) {
  return <InvoiceDetailPage invoiceId={params.id} />;
}
