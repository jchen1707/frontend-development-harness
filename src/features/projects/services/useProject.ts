import { useQuery } from '@tanstack/react-query';

import { HttpError, ValidationError } from '@/core/errors';

import { HttpProjectsRepository, type ProjectsRepository } from '../repositories/projects';
import type { Project } from '../repositories/schemas/project';
import { useRetainedQueryError } from './useRetainedQueryError';

export type { Project } from '../repositories/schemas/project';

const defaultRepository = new HttpProjectsRepository();

export interface UseProjectOptions {
  repository?: Pick<ProjectsRepository, 'getProject'> | undefined;
}

export type ProjectErrorKind = 'not-found' | 'transport' | 'schema';

export interface UseProjectResult {
  project: Project | null;
  errorKind: ProjectErrorKind | null;
  isPending: boolean;
  isRefetching: boolean;
  refetch: () => Promise<unknown>;
}

function toErrorKind(error: Error): ProjectErrorKind {
  if (error instanceof ValidationError) {
    return 'schema';
  }

  return error instanceof HttpError && error.status === 404 ? 'not-found' : 'transport';
}

export function useProject(id: string, options: UseProjectOptions = {}): UseProjectResult {
  const { repository = defaultRepository } = options;
  const { data, error, isFetching, isPending, refetch } = useQuery({
    queryKey: ['projects', id],
    queryFn: ({ signal }) => repository.getProject(id, signal),
  });

  const { errorKind, isRetryingAfterError } = useRetainedQueryError({
    error,
    hasData: data !== undefined,
    isFetching,
    classifyError: toErrorKind,
  });

  return {
    project: data ?? null,
    errorKind,
    isPending,
    isRefetching: (isFetching && !isPending) || isRetryingAfterError,
    refetch,
  };
}
