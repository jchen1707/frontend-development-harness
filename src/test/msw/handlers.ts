import { HttpResponse, http } from 'msw';

import { env } from '@/env';
import {
  projectDetailSchema,
  projectListSchema,
} from '@/features/projects/repositories/schemas/project';
import { defaultProjects } from '@/test/fixtures/projects';

// Default request handlers for offline unit tests. Add per-test overrides with
// server.use(...) inside individual specs.
export const handlers = [
  http.get(`${env.VITE_API_BASE_URL}/healthz`, () =>
    HttpResponse.json({ status: 'ok', version: 'test' }),
  ),
  http.get(`${env.VITE_API_BASE_URL}/projects`, () =>
    HttpResponse.json(projectListSchema.parse({ projects: defaultProjects })),
  ),
  http.get(`${env.VITE_API_BASE_URL}/projects/:id`, ({ params }) => {
    const project = defaultProjects.find((candidate) => candidate.id === String(params.id));
    if (!project) {
      return HttpResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    return HttpResponse.json(projectDetailSchema.parse({ project }));
  }),
];
