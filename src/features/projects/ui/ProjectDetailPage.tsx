import type { JSX, ReactNode } from 'react';
import { useParams } from 'react-router-dom';

import { useProject, type ProjectErrorKind, type UseProjectOptions } from '../services/useProject';
import { ProjectDetailErrorState } from './ProjectDetailErrorState';
import { ProjectDetailLoadingState } from './ProjectDetailLoadingState';
import { ProjectDetailShell } from './ProjectDetailShell';
import { formatLastUpdated } from './formatLastUpdated';

type ProjectDetailPageProps = Pick<UseProjectOptions, 'repository'>;

const ERROR_COPY: Record<ProjectErrorKind, string> = {
  'not-found': 'That project could not be found.',
  transport: 'We could not load this project.',
  schema: 'Project data could not be read.',
};

interface ProjectFieldProps {
  label: string;
  children: ReactNode;
}

function ProjectField({ label, children }: ProjectFieldProps): JSX.Element {
  return (
    <div className="rounded border border-slate-200 p-4">
      <dt className="font-semibold text-slate-600">{label}</dt>
      <dd className="mt-1">{children}</dd>
    </div>
  );
}

export function ProjectDetailPage({ repository }: ProjectDetailPageProps = {}): JSX.Element {
  const { id = '' } = useParams();
  const { errorKind, isPending, isRefetching, project, refetch } = useProject(id, { repository });

  return (
    <ProjectDetailShell
      headingClassName={project ? 'mt-6 text-2xl font-bold' : 'sr-only'}
      title={project?.name ?? 'Project'}
    >
      {isPending && !errorKind && <ProjectDetailLoadingState />}
      {project && (
        <section>
          <dl className="mt-6 grid gap-4 sm:grid-cols-3">
            <ProjectField label="Status">
              <span className="capitalize">{project.status}</span>
            </ProjectField>
            <ProjectField label="Owner">{project.owner.name}</ProjectField>
            <ProjectField label="Last updated">
              <time dateTime={project.lastUpdatedAt} title={project.lastUpdatedAt}>
                {formatLastUpdated(project.lastUpdatedAt)}
              </time>
            </ProjectField>
          </dl>
        </section>
      )}
      {errorKind && (
        <ProjectDetailErrorState
          isBusy={isRefetching}
          message={ERROR_COPY[errorKind]}
          onRetry={() => {
            void refetch();
          }}
        />
      )}
    </ProjectDetailShell>
  );
}
