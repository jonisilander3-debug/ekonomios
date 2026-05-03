import { ProjectDetailPage } from '@/features/details/detail-pages';

export default function Page({ params }: { params: { id: string } }) {
  return <ProjectDetailPage projectId={params.id} />;
}
