export const RETURN_TO_PROJECTS_STATE = { focusProjectsHeading: true } as const;

export function shouldFocusProjectsHeading(state: unknown): boolean {
  return (
    typeof state === 'object' &&
    state !== null &&
    'focusProjectsHeading' in state &&
    state.focusProjectsHeading === true
  );
}
