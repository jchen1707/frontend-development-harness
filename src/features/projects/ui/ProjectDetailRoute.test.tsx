import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { JSX } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

import { ProjectDetailRoute } from './ProjectDetailRoute';

vi.mock('@/core/logger', () => ({
  logger: { error: vi.fn() },
}));

interface ProjectDetailModule {
  default: () => JSX.Element;
}

function RecoveredProjectDetail(): JSX.Element {
  return <p>Recovered project detail</p>;
}

describe('ProjectDetailRoute', () => {
  it('shows the skeleton, reports a failed import, and recovers on retry', async () => {
    let rejectFirstLoad: ((reason: Error) => void) | undefined;
    let resolveRetryLoad: ((module: ProjectDetailModule) => void) | undefined;
    const firstLoad = new Promise<ProjectDetailModule>((_resolve, reject) => {
      rejectFirstLoad = reject;
    });
    const retryLoad = new Promise<ProjectDetailModule>((resolve) => {
      resolveRetryLoad = resolve;
    });
    const loadPage = vi.fn().mockReturnValueOnce(firstLoad).mockReturnValueOnce(retryLoad);

    render(
      <MemoryRouter>
        <ProjectDetailRoute loadPage={loadPage} />
      </MemoryRouter>,
      { onCaughtError: () => undefined },
    );

    expect(screen.getByTestId('project-detail-skeleton')).toHaveAttribute('aria-hidden');

    await act(async () => {
      rejectFirstLoad?.(new Error('Chunk request failed'));
      await firstLoad.catch(() => undefined);
    });
    expect(await screen.findByText('We could not load this project.')).toBeInTheDocument();

    const retryButton = screen.getByRole('button', { name: 'Retry' });
    await userEvent.click(retryButton);
    expect(retryButton).toHaveAttribute('aria-busy', 'true');

    resolveRetryLoad?.({ default: RecoveredProjectDetail });
    await waitFor(() => {
      expect(screen.getByText('Recovered project detail')).toBeInTheDocument();
    });
    expect(loadPage).toHaveBeenCalledTimes(2);
  });
});
