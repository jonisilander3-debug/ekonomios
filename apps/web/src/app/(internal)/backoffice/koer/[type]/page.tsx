import { BackofficeQueueRoutePage } from '@/features/backoffice/backoffice-route-pages';
import type { BackofficeQueueType } from '@/features/backoffice/backoffice-queue.types';

export default function Page({ params }: { params: { type: string } }) {
  return <BackofficeQueueRoutePage queueType={params.type as BackofficeQueueType} />;
}
