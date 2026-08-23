import { lazy, Suspense, type JSX } from 'react';

import { ProjectDetailErrorBoundary } from './ProjectDetailErrorBoundary';
import { ProjectDetailLoadingState } from './ProjectDetailLoadingState';
import { ProjectDetailShell } from './ProjectDetailShell';

const ProjectDetailPage = lazy(async () => {
  const projectDetail = await import('./ProjectDetailPage');
  return { default: projectDetail.ProjectDetailPage };
});

export function ProjectDetailRoute(): JSX.Element {
  return (
    <ProjectDetailErrorBoundary>
      <Suspense
        fallback={
          <ProjectDetailShell headingClassName="sr-only" title="Project">
            <ProjectDetailLoadingState />
          </ProjectDetailShell>
        }
      >
        <ProjectDetailPage />
      </Suspense>
    </ProjectDetailErrorBoundary>
  );
}
