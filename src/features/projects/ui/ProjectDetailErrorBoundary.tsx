import { Component, type ErrorInfo, type JSX, type ReactNode } from 'react';

import { logger } from '@/core/logger';

import { ProjectDetailShell } from './ProjectDetailShell';

interface ProjectDetailErrorBoundaryProps {
  children: ReactNode;
}

interface ProjectDetailErrorBoundaryState {
  hasError: boolean;
}

export class ProjectDetailErrorBoundary extends Component<
  ProjectDetailErrorBoundaryProps,
  ProjectDetailErrorBoundaryState
> {
  override state: ProjectDetailErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ProjectDetailErrorBoundaryState {
    return { hasError: true };
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    logger.error('Project detail route failed', { error, errorInfo });
  }

  override render(): JSX.Element {
    if (this.state.hasError) {
      return (
        <ProjectDetailShell headingClassName="sr-only" title="Project">
          <p role="alert" className="mt-6 text-slate-800">
            We could not show this project screen.
          </p>
        </ProjectDetailShell>
      );
    }

    return <>{this.props.children}</>;
  }
}
