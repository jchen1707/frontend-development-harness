// Service layer (feature-internal): business logic + data hooks composing
// the feature's own repositories. UI → services → repositories → core.
import { useDeferredValue, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { z } from 'zod';

import { ValidationError } from '@/core/errors';

import { HttpProjectsRepository, type ProjectsRepository } from '../repositories/projects';
import { type Project, projectStatusSchema } from '../repositories/schemas/project';

export type { Project } from '../repositories/schemas/project';

const defaultRepository = new HttpProjectsRepository();
const projectStatusFilterSchema = projectStatusSchema.or(z.literal('all'));

export type ProjectsErrorKind = 'transport' | 'schema';
export type ProjectStatusFilter = z.infer<typeof projectStatusFilterSchema>;

export interface UseProjectsOptions {
  repository?: ProjectsRepository | undefined;
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

  // TanStack Query clears `error` while a refetch is in flight. Remember the last
  // error so the error state (and its busy retry button) stays on screen until
  // the refetch either succeeds or fails with a new error.
  const lastErrorKind = useRef<ProjectsErrorKind | null>(null);
  useEffect(() => {
    if (error) {
      lastErrorKind.current = toErrorKind(error);
    }
  }, [error]);
  useEffect(() => {
    if (data !== undefined) {
      lastErrorKind.current = null;
    }
  }, [data]);

  const currentErrorKind = error ? toErrorKind(error) : null;
  const retryingAfterError = isFetching && lastErrorKind.current !== null;
  const errorKind = currentErrorKind ?? (retryingAfterError ? lastErrorKind.current : null);
  const isRefetching = (isFetching && !isPending) || retryingAfterError;

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
