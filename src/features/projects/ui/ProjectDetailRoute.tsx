import { lazy, Suspense, useState, type ComponentType, type JSX } from 'react';

import { ProjectDetailErrorBoundary } from './ProjectDetailErrorBoundary';
import { ProjectDetailLoadingState } from './ProjectDetailLoadingState';
import { ProjectDetailShell } from './ProjectDetailShell';

interface ProjectDetailModule {
  default: ComponentType;
}

type ProjectDetailPageLoader = () => Promise<ProjectDetailModule>;

interface ProjectDetailRouteProps {
  loadPage?: ProjectDetailPageLoader | undefined;
}

function createProjectDetailPage(loadPage: ProjectDetailPageLoader) {
  return lazy(loadPage);
}

async function loadProjectDetailPage(): Promise<ProjectDetailModule> {
  const projectDetail = await import('./ProjectDetailPage');
  return { default: projectDetail.ProjectDetailPage };
}

export function ProjectDetailRoute({
  loadPage = loadProjectDetailPage,
}: ProjectDetailRouteProps = {}): JSX.Element {
  const [ProjectDetailPage, setProjectDetailPage] = useState(() =>
    createProjectDetailPage(loadPage),
  );
  const [boundaryKey, setBoundaryKey] = useState(0);

  async function retryRouteLoad(): Promise<void> {
    const projectDetailPage = await loadPage();
    setProjectDetailPage(lazy(() => Promise.resolve(projectDetailPage)));
    setBoundaryKey((currentKey) => currentKey + 1);
  }

  return (
    <ProjectDetailErrorBoundary key={boundaryKey} onRetry={retryRouteLoad}>
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
