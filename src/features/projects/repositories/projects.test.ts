import { delay, HttpResponse, http } from 'msw';
import { ZodError } from 'zod';

import { HttpError, ValidationError } from '@/core/errors';
import { logger } from '@/core/logger';
import { env } from '@/env';
import { defaultProjects } from '@/test/fixtures/projects';
import { server } from '@/test/msw/server';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { FakeProjectsRepository, HttpProjectsRepository } from './projects';

vi.mock('@/core/logger', () => ({
  logger: {
    debug: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
  },
}));

const API_URL = `${env.VITE_API_BASE_URL}/projects`;

afterEach(() => {
  vi.clearAllMocks();
});

describe('HttpProjectsRepository', () => {
  it('parses a valid detail envelope and returns the unwrapped Project', async () => {
    const repository = new HttpProjectsRepository();

    const project = await repository.getProject(defaultProjects[0]!.id);

    expect(project).toEqual(defaultProjects[0]);
  });

  it('raises ValidationError with the ZodError as its cause for malformed Project data', async () => {
    server.use(
      http.get(`${API_URL}/bad-1`, () =>
        HttpResponse.json({
          project: {
            ...defaultProjects[0],
            status: 'deleted',
          },
        }),
      ),
    );
    const repository = new HttpProjectsRepository();

    let caughtError: unknown;
    try {
      await repository.getProject('bad-1');
    } catch (error) {
      caughtError = error;
    }

    expect(caughtError).toBeInstanceOf(ValidationError);
    expect((caughtError as Error).cause).toBeInstanceOf(ZodError);
  });

  it('preserves the 404 status for an unknown Project', async () => {
    const repository = new HttpProjectsRepository();

    await expect(repository.getProject('missing')).rejects.toMatchObject({ status: 404 });
  });

  it('parses a valid envelope and returns the unwrapped Project array', async () => {
    const repository = new HttpProjectsRepository();

    const projects = await repository.listProjects();

    expect(projects).toEqual(defaultProjects);
  });

  it('raises ValidationError, not ZodError, on a malformed response', async () => {
    server.use(
      http.get(API_URL, () =>
        HttpResponse.json({
          projects: [
            {
              id: 'bad-1',
              name: 'Bad project',
              status: 'deleted',
            },
          ],
        }),
      ),
    );
    const repository = new HttpProjectsRepository();

    let caughtError: unknown;
    try {
      await repository.listProjects();
    } catch (error) {
      caughtError = error;
    }

    expect(caughtError).toBeInstanceOf(ValidationError);
    expect((caughtError as Error).cause).toBeInstanceOf(ZodError);
    expect(logger.error).toHaveBeenCalled();
  });

  it('raises HttpError on a 500 response', async () => {
    server.use(http.get(API_URL, () => HttpResponse.json({ error: 'boom' }, { status: 500 })));
    const repository = new HttpProjectsRepository();

    await expect(repository.listProjects()).rejects.toBeInstanceOf(HttpError);
    await expect(repository.listProjects()).rejects.toMatchObject({ status: 500 });
  });

  it('rethrows an AbortError without logging', async () => {
    server.use(
      http.get(API_URL, async () => {
        await delay(200);
        return HttpResponse.json({ projects: defaultProjects });
      }),
    );
    const controller = new AbortController();
    const repository = new HttpProjectsRepository();
    const promise = repository.listProjects(controller.signal);
    controller.abort();

    await expect(promise).rejects.toThrow();
    expect(logger.error).not.toHaveBeenCalled();
  });
});

describe('FakeProjectsRepository', () => {
  it('resolves a Project from its constructor array', async () => {
    const repository = new FakeProjectsRepository(defaultProjects);

    await expect(repository.getProject(defaultProjects[1]!.id)).resolves.toEqual(
      defaultProjects[1],
    );
  });

  it('rejects with a 404 HttpError when a Project is absent', async () => {
    const repository = new FakeProjectsRepository(defaultProjects);

    await expect(repository.getProject('missing')).rejects.toMatchObject({ status: 404 });
  });

  it('rejects when the caller has already aborted the request', async () => {
    const controller = new AbortController();
    controller.abort();
    const repository = new FakeProjectsRepository(defaultProjects);

    await expect(repository.getProject(defaultProjects[0]!.id, controller.signal)).rejects.toThrow(
      'aborted',
    );
  });

  it('resolves the constructor array with no network', async () => {
    const repository = new FakeProjectsRepository(defaultProjects);

    const projects = await repository.listProjects();

    expect(projects).toEqual(defaultProjects);
  });
});
