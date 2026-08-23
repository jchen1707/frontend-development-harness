import { Component, type ErrorInfo, type JSX, type ReactNode } from 'react';

import { logger } from '@/core/logger';

import { ProjectDetailErrorState } from './ProjectDetailErrorState';
import { ProjectDetailShell } from './ProjectDetailShell';

interface ProjectDetailErrorBoundaryProps {
  children: ReactNode;
  onRetry: () => Promise<void>;
}

interface ProjectDetailErrorBoundaryState {
  hasError: boolean;
  isRetrying: boolean;
}

export class ProjectDetailErrorBoundary extends Component<
  ProjectDetailErrorBoundaryProps,
  ProjectDetailErrorBoundaryState
> {
  override state: ProjectDetailErrorBoundaryState = { hasError: false, isRetrying: false };

  static getDerivedStateFromError(): ProjectDetailErrorBoundaryState {
    return { hasError: true, isRetrying: false };
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    logger.error('Project detail route failed', { error, errorInfo });
  }

  private readonly retryRoute = async (): Promise<void> => {
    this.setState({ isRetrying: true });
    try {
      await this.props.onRetry();
      this.setState({ isRetrying: false });
    } catch (error) {
      logger.error('Project detail route retry failed', { error });
      this.setState({ isRetrying: false });
    }
  };

  override render(): JSX.Element {
    if (this.state.hasError) {
      return (
        <ProjectDetailShell headingClassName="sr-only" title="Project">
          <ProjectDetailErrorState
            isBusy={this.state.isRetrying}
            message="We could not load this project."
            onRetry={() => {
              void this.retryRoute();
            }}
          />
        </ProjectDetailShell>
      );
    }

    return <>{this.props.children}</>;
  }
}
