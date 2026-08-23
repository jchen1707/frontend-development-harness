import type { JSX } from 'react';

interface ProjectRetryButtonProps {
  isBusy?: boolean | undefined;
  onRetry: () => void;
}

export function ProjectRetryButton({
  isBusy = false,
  onRetry,
}: ProjectRetryButtonProps): JSX.Element {
  return (
    <button
      type="button"
      onClick={onRetry}
      aria-busy={isBusy}
      disabled={isBusy}
      className="mt-4 rounded bg-slate-900 px-4 py-2 text-white hover:bg-slate-700 disabled:opacity-50"
    >
      Retry
    </button>
  );
}
