import type { JSX, ReactNode } from 'react';
import { Link } from 'react-router-dom';

import { ProjectRouteHeading } from './ProjectRouteHeading';
import { RETURN_TO_PROJECTS_STATE } from './projectNavigation';

interface ProjectDetailShellProps {
  children: ReactNode;
  headingClassName: string;
  title: string;
}

export function ProjectDetailShell({
  children,
  headingClassName,
  title,
}: ProjectDetailShellProps): JSX.Element {
  return (
    <main className="mx-auto max-w-4xl p-8">
      <Link
        to="/projects"
        state={RETURN_TO_PROJECTS_STATE}
        className="text-blue-600 hover:underline"
      >
        Back to projects
      </Link>
      <ProjectRouteHeading className={headingClassName}>{title}</ProjectRouteHeading>
      {children}
    </main>
  );
}
