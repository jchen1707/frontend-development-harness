import type { JSX } from 'react';

import { ProjectRetryButton } from './ProjectRetryButton';

interface ProjectDetailErrorStateProps {
  isBusy?: boolean | undefined;
  message: string;
  onRetry: () => void;
}

export function ProjectDetailErrorState({
  isBusy = false,
  message,
  onRetry,
}: ProjectDetailErrorStateProps): JSX.Element {
  return (
    <div role="alert" className="mt-6 text-slate-800">
      <p>{message}</p>
      <ProjectRetryButton isBusy={isBusy} onRetry={onRetry} />
    </div>
  );
}
