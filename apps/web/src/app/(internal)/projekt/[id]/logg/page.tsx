import { ProjectCaseLogPage } from '@/features/details/detail-pages';

export default function Page({ params }: { params: { id: string } }) {
  return <ProjectCaseLogPage projectId={params.id} />;
}
