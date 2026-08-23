// Public surface of the `projects` feature. This is the ONLY entry point other
// features and the app shell may import from — everything under ui/, services/,
// and repositories/ is feature-internal (enforced by eslint-plugin-boundaries).
export { ProjectDetailRoute } from './ui/ProjectDetailRoute';
export { ProjectsPage } from './ui/ProjectsPage';
export {
  useProjects,
  type ProjectStatusFilter,
  type ProjectsErrorKind,
  type UseProjectsOptions,
  type UseProjectsResult,
} from './services/useProjects';
export type { Project, ProjectOwner, ProjectStatus } from './repositories/schemas/project';
export type { ProjectsRepository } from './repositories/projects';
