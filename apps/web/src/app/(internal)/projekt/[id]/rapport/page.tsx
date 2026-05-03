import { ProjectReportPage } from '@/features/details/detail-pages';
import type { ProjectReportType } from '@/features/platform-data/selectors';

export default function Page({
  params,
  searchParams
}: {
  params: { id: string };
  searchParams?: { typ?: string };
}) {
  const reportType = searchParams?.typ as ProjectReportType | undefined;

  return <ProjectReportPage projectId={params.id} reportType={reportType} />;
}
