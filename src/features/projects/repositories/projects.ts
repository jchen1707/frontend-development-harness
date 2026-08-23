// Repository layer (feature-internal): data access behind an interface.
// Within the feature the dependency rule still holds — repositories may
// depend only on core/env, never on services or UI.
import { HttpError, ValidationError } from '@/core/errors';
import { request } from '@/core/http';
import { logger } from '@/core/logger';

import { projectDetailSchema, type Project, projectListSchema } from './schemas/project';

export interface ProjectsRepository {
  listProjects(signal?: AbortSignal): Promise<Project[]>;
  getProject(id: string, signal?: AbortSignal): Promise<Project>;
}

export class HttpProjectsRepository implements ProjectsRepository {
  async getProject(id: string, signal?: AbortSignal): Promise<Project> {
    const data = await request<unknown>(
      `/projects/${encodeURIComponent(id)}`,
      signal ? { signal } : {},
    );
    const parsed = projectDetailSchema.safeParse(data);
    if (!parsed.success) {
      logger.error('Project response failed validation', { issues: parsed.error.issues });
      throw new ValidationError('Project response failed validation', { cause: parsed.error });
    }

    return parsed.data.project;
  }

  async listProjects(signal?: AbortSignal): Promise<Project[]> {
    const data = await request<unknown>('/projects', signal ? { signal } : {});

    // Validate at the boundary before returning.
    const parsed = projectListSchema.safeParse(data);
    if (!parsed.success) {
      logger.error('Projects response failed validation', { issues: parsed.error.issues });
      throw new ValidationError('Projects response failed validation', { cause: parsed.error });
    }

    return parsed.data.projects;
  }
}

export class FakeProjectsRepository implements ProjectsRepository {
  constructor(private readonly projects: Project[] = []) {}

  getProject(id: string, signal?: AbortSignal): Promise<Project> {
    if (signal?.aborted) {
      return Promise.reject(new DOMException('The operation was aborted.', 'AbortError'));
    }

    const project = this.projects.find((candidate) => candidate.id === id);
    return project
      ? Promise.resolve(project)
      : Promise.reject(new HttpError('Project not found', 404));
  }

  listProjects(): Promise<Project[]> {
    return Promise.resolve(this.projects);
  }
}
