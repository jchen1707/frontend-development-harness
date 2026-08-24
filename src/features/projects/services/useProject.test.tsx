import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import type { JSX, ReactNode } from 'react';
import { describe, expect, it } from 'vitest';

import { HttpError, ValidationError } from '@/core/errors';
import { defaultProjects } from '@/test/fixtures/projects';

import { FakeProjectsRepository } from '../repositories/projects';
import { useProject } from './useProject';

function makeWrapper(): (props: { children: ReactNode }) => JSX.Element {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return function Wrapper({ children }: { children: ReactNode }): JSX.Element {
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
  };
}

describe('useProject', () => {
  it('reads one Project by id through the repository', async () => {
    const repository = new FakeProjectsRepository(defaultProjects);
    const { result } = renderHook(() => useProject(defaultProjects[1]!.id, { repository }), {
      wrapper: makeWrapper(),
    });

    await waitFor(() => {
      expect(result.current.project).toEqual(defaultProjects[1]);
    });
  });

  it('distinguishes an unknown Project from other transport failures', async () => {
    const repository = {
      getProject: () => Promise.reject(new HttpError('Request failed: GET /projects/missing', 404)),
    };
    const { result } = renderHook(() => useProject('missing', { repository }), {
      wrapper: makeWrapper(),
    });

    await waitFor(() => {
      expect(result.current.errorKind).toBe('not-found');
    });
  });

  it('maps invalid Project data to a schema failure', async () => {
    const repository = {
      getProject: () => Promise.reject(new ValidationError('Project response failed validation')),
    };
    const { result } = renderHook(() => useProject('project-1', { repository }), {
      wrapper: makeWrapper(),
    });

    await waitFor(() => {
      expect(result.current.errorKind).toBe('schema');
    });
  });
});
