import { ReceiptDetailPage } from '@/features/details/detail-pages';

export default function Page({ params }: { params: { id: string } }) {
  return <ReceiptDetailPage receiptId={params.id} />;
}
