// Service layer (feature-internal): business logic + data hooks composing
// the feature's own repositories. UI → services → repositories → core.
import { useDeferredValue } from 'react';
import { useQuery } from '@tanstack/react-query';
import { z } from 'zod';

import { ValidationError } from '@/core/errors';

import { HttpProjectsRepository, type ProjectsRepository } from '../repositories/projects';
import { type Project, projectStatusSchema } from '../repositories/schemas/project';
import { useRetainedQueryError } from './useRetainedQueryError';

export type { Project } from '../repositories/schemas/project';

const defaultRepository = new HttpProjectsRepository();
const projectStatusFilterSchema = projectStatusSchema.or(z.literal('all'));

export type ProjectsErrorKind = 'transport' | 'schema';
export type ProjectStatusFilter = z.infer<typeof projectStatusFilterSchema>;

export interface UseProjectsOptions {
  repository?: Pick<ProjectsRepository, 'listProjects'> | undefined;
  searchText?: string | undefined;
  statusFilter?: ProjectStatusFilter | undefined;
}

export interface UseProjectsResult {
  projects: Project[];
  hasOnlyArchivedProjects: boolean;
  isPending: boolean;
  isRefetching: boolean;
  isSearchPending: boolean;
  errorKind: ProjectsErrorKind | null;
  refetch: () => Promise<unknown>;
}

function toErrorKind(error: Error): ProjectsErrorKind {
  if (error instanceof ValidationError) {
    return 'schema';
  }

  return 'transport';
}

export function parseProjectStatusFilter(value: string | null): ProjectStatusFilter | undefined {
  const result = projectStatusFilterSchema.safeParse(value);
  return result.success ? result.data : undefined;
}

export function useProjects(options: UseProjectsOptions = {}): UseProjectsResult {
  const { repository = defaultRepository, searchText = '', statusFilter } = options;
  const normalizedSearchText = searchText.trim().toLocaleLowerCase();
  const deferredSearchText = useDeferredValue(normalizedSearchText);

  const { data, isPending, isFetching, error, refetch } = useQuery({
    queryKey: ['projects'],
    queryFn: ({ signal }) => repository.listProjects(signal),
    select: (allProjects) => ({
      projects: allProjects
        .filter((project) => {
          if (statusFilter === 'all') {
            return true;
          }

          return statusFilter ? project.status === statusFilter : project.status !== 'archived';
        })
        .filter((project) => project.name.toLocaleLowerCase().includes(deferredSearchText))
        .sort((a, b) => b.lastUpdatedAt.localeCompare(a.lastUpdatedAt)),
      hasOnlyArchivedProjects:
        allProjects.length > 0 && allProjects.every((project) => project.status === 'archived'),
    }),
  });

  const { errorKind, isRetryingAfterError } = useRetainedQueryError({
    error,
    hasData: data !== undefined,
    isFetching,
    classifyError: toErrorKind,
  });
  const isRefetching = (isFetching && !isPending) || isRetryingAfterError;

  return {
    projects: data?.projects ?? [],
    hasOnlyArchivedProjects: data?.hasOnlyArchivedProjects ?? false,
    isPending,
    isRefetching,
    isSearchPending: normalizedSearchText !== deferredSearchText,
    errorKind,
    refetch,
  };
}
