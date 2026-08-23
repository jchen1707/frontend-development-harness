import { render, screen } from '@testing-library/react';
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
  it('shows safe route failure copy without describing it as a request failure', () => {
    const { container } = render(
      <MemoryRouter>
        <ProjectDetailErrorBoundary>
          <BrokenProjectDetail />
        </ProjectDetailErrorBoundary>
      </MemoryRouter>,
      { onCaughtError: () => undefined },
    );

    expect(screen.getByText('We could not show this project screen.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Back to projects' })).toHaveAttribute(
      'href',
      '/projects',
    );
    expect(container).not.toHaveTextContent('/projects/project-1');
    expect(screen.queryByRole('button', { name: 'Retry' })).not.toBeInTheDocument();
  });
});
