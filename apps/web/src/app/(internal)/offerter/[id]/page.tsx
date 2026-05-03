import { QuoteDetailPage } from '@/features/details/detail-pages';

export default function Page({ params }: { params: { id: string } }) {
  return <QuoteDetailPage quoteId={params.id} />;
}
