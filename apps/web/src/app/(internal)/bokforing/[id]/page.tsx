import { BookkeepingDetailPage } from '@/features/details/detail-pages';

export default function Page({ params }: { params: { id: string } }) {
  return <BookkeepingDetailPage bookkeepingEntryId={params.id} />;
}
