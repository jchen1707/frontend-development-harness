import type { JSX } from 'react';

interface ProjectsEmptyActionStateProps {
  message: string;
  actionLabel: string;
  onAction: () => void;
}

export function ProjectsEmptyActionState({
  message,
  actionLabel,
  onAction,
}: ProjectsEmptyActionStateProps): JSX.Element {
  return (
    <div>
      <p className="text-slate-600">{message}</p>
      <button
        type="button"
        onClick={onAction}
        className="mt-3 rounded bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-2"
      >
        {actionLabel}
      </button>
    </div>
  );
}
