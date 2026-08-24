import type { JSX } from 'react';

function ProjectFieldSkeleton(): JSX.Element {
  return <div className="h-20 rounded bg-slate-200" />;
}

export function ProjectDetailSkeleton(): JSX.Element {
  return (
    <div aria-hidden className="mt-6 animate-pulse" data-testid="project-detail-skeleton">
      <div className="h-8 w-64 rounded bg-slate-200" />
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <ProjectFieldSkeleton />
        <ProjectFieldSkeleton />
        <ProjectFieldSkeleton />
      </div>
    </div>
  );
}
