import type { JSX } from 'react';

import { ProjectDetailSkeleton } from './ProjectDetailSkeleton';

export function ProjectDetailLoadingState(): JSX.Element {
  return (
    <>
      <p className="sr-only" role="status">
        Loading project
      </p>
      <ProjectDetailSkeleton />
    </>
  );
}
