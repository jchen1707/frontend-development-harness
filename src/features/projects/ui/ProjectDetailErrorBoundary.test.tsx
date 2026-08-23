import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { JSX } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

import { ProjectDetailErrorBoundary } from './ProjectDetailErrorBoundary';

vi.mock('@/core/logger', () => ({
  logger: { error: vi.fn() },
}));

function BrokenProjectDetail(): JSX.Element {
  throw new Error('Render failed at /projects/project-1');
}

describe('ProjectDetailErrorBoundary', () => {
  it('shows safe fixed copy and repeats the route load when requested', async () => {
    let resolveRetry: (() => void) | undefined;
    const onRetry = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          resolveRetry = resolve;
        }),
    );
    const { container } = render(
      <MemoryRouter>
        <ProjectDetailErrorBoundary onRetry={onRetry}>
          <BrokenProjectDetail />
        </ProjectDetailErrorBoundary>
      </MemoryRouter>,
      { onCaughtError: () => undefined },
    );

    expect(screen.getByText('We could not load this project.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Back to projects' })).toHaveAttribute(
      'href',
      '/projects',
    );
    expect(container).not.toHaveTextContent('/projects/project-1');

    const retryButton = screen.getByRole('button', { name: 'Retry' });
    await userEvent.click(retryButton);
    expect(onRetry).toHaveBeenCalledOnce();
    expect(retryButton).toHaveAttribute('aria-busy', 'true');

    resolveRetry?.();
    await waitFor(() => {
      expect(retryButton).toHaveAttribute('aria-busy', 'false');
    });
  });
});
