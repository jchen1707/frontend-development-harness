import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { JSX, ReactNode } from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { HttpError, ValidationError } from '@/core/errors';
import { defaultProjects } from '@/test/fixtures/projects';

import type { Project } from '../services/useProject';
import { ProjectDetailPage } from './ProjectDetailPage';

function makeWrapper(): (props: { children: ReactNode }) => JSX.Element {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return function Wrapper({ children }: { children: ReactNode }): JSX.Element {
    return (
      <MemoryRouter initialEntries={['/projects/project-1']}>
        <QueryClientProvider client={client}>
          <Routes>
            <Route path="/projects/:id" element={children} />
          </Routes>
        </QueryClientProvider>
      </MemoryRouter>
    );
  };
}

afterEach(() => {
  cleanup();
});

describe('ProjectDetailPage', () => {
  it('moves focus to the route heading', () => {
    const repository = {
      getProject: () => new Promise<Project>(() => undefined),
    };

    render(<ProjectDetailPage repository={repository} />, { wrapper: makeWrapper() });

    expect(screen.getByRole('heading', { name: 'Project' })).toHaveFocus();
  });

  it('keeps a hidden shimmer layout and a return control visible while loading', () => {
    const repository = {
      getProject: () => new Promise<Project>(() => undefined),
    };

    render(<ProjectDetailPage repository={repository} />, { wrapper: makeWrapper() });

    expect(screen.getByRole('link', { name: 'Back to projects' })).toHaveAttribute(
      'href',
      '/projects',
    );
    expect(screen.getByRole('status')).toHaveTextContent('Loading project');
    expect(screen.getByTestId('project-detail-skeleton')).toHaveAttribute('aria-hidden');
  });

  it('shows the Project fields after the return control', async () => {
    const project = defaultProjects[0]!;
    const repository = { getProject: () => Promise.resolve(project) };

    render(<ProjectDetailPage repository={repository} />, { wrapper: makeWrapper() });

    const heading = await screen.findByRole('heading', { name: project.name });
    const returnLink = screen.getByRole('link', { name: 'Back to projects' });
    expect(returnLink.compareDocumentPosition(heading)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
    expect(screen.getByText(project.status)).toBeInTheDocument();
    expect(screen.getByText(project.owner.name)).toBeInTheDocument();
    expect(screen.getByText('Last updated')).toBeInTheDocument();
    const lastUpdated = screen.getByTitle(project.lastUpdatedAt);
    expect(lastUpdated).toHaveAttribute('dateTime', project.lastUpdatedAt);
    expect(lastUpdated).not.toHaveTextContent('');
  });

  it('shows specific copy when the Project does not exist', async () => {
    const repository = {
      getProject: () => Promise.reject(new HttpError('Request failed: GET /projects/missing', 404)),
    };

    render(<ProjectDetailPage repository={repository} />, { wrapper: makeWrapper() });

    expect(await screen.findByText('That project could not be found.')).toBeInTheDocument();
  });

  it('shows fixed transport copy without the request path or raw error', async () => {
    const repository = {
      getProject: () =>
        Promise.reject(new HttpError('Request failed: GET /projects/project-1 body=boom', 500)),
    };

    const { container } = render(<ProjectDetailPage repository={repository} />, {
      wrapper: makeWrapper(),
    });

    expect(await screen.findByText('We could not load this project.')).toBeInTheDocument();
    expect(container).not.toHaveTextContent('/projects/project-1');
    expect(container).not.toHaveTextContent('Request failed');
    expect(container).not.toHaveTextContent('body=boom');
    expect(container).not.toHaveTextContent(' at ');
  });

  it('shows fixed copy when Project data cannot be read', async () => {
    const repository = {
      getProject: () => Promise.reject(new ValidationError('Project response failed validation')),
    };

    render(<ProjectDetailPage repository={repository} />, { wrapper: makeWrapper() });

    expect(await screen.findByText('Project data could not be read.')).toBeInTheDocument();
  });

  it('retries the request and reports aria-busy while it is in flight', async () => {
    const project = defaultProjects[0]!;
    let resolveRetry: ((value: Project) => void) | undefined;
    const getProject = vi
      .fn()
      .mockRejectedValueOnce(new HttpError('Request failed: GET /projects/project-1', 500))
      .mockImplementationOnce(
        () =>
          new Promise<Project>((resolve) => {
            resolveRetry = resolve;
          }),
      );

    render(<ProjectDetailPage repository={{ getProject }} />, { wrapper: makeWrapper() });

    const retryButton = await screen.findByRole('button', { name: 'Retry' });
    await userEvent.click(retryButton);

    await waitFor(() => {
      expect(retryButton).toHaveAttribute('aria-busy', 'true');
    });

    resolveRetry?.(project);
    expect(await screen.findByRole('heading', { name: project.name })).toBeInTheDocument();
    expect(getProject).toHaveBeenCalledTimes(2);
  });
});
