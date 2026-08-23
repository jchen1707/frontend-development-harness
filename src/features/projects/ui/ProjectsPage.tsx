import { useEffect, useRef, useState, type JSX } from 'react';
import { NavigationType, useNavigationType, useSearchParams } from 'react-router-dom';

import {
  parseProjectStatusFilter,
  useProjects,
  type UseProjectsOptions,
} from '../services/useProjects';
import { ProjectsEmptyActionState } from './ProjectsEmptyActionState';
import { ProjectsEmptyState } from './ProjectsEmptyState';
import { ProjectsErrorState } from './ProjectsErrorState';
import { ProjectsTable } from './ProjectsTable';
import { ProjectsTableSkeleton } from './ProjectsTableSkeleton';

type ProjectsPageProps = Pick<UseProjectsOptions, 'repository'>;

interface ResultAnnouncement {
  id: number;
  message: string;
}

// Route component = controller/transport layer: calls a service, shapes the view.
export function ProjectsPage({ repository }: ProjectsPageProps = {}): JSX.Element {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigationType = useNavigationType();
  const urlSearchText = searchParams.get('q') ?? '';
  const statusFilter = parseProjectStatusFilter(searchParams.get('status'));
  const [searchText, setSearchText] = useState(urlSearchText);
  const hasSearchHistoryEntry = useRef(urlSearchText.length > 0);
  const {
    projects,
    hasOnlyArchivedProjects,
    isPending,
    isRefetching,
    isSearchPending,
    errorKind,
    refetch,
  } = useProjects({ repository, searchText, statusFilter });
  const [resultAnnouncement, setResultAnnouncement] = useState<ResultAnnouncement>({
    id: 0,
    message: '',
  });

  useEffect(() => {
    if (navigationType === NavigationType.Pop) {
      setSearchText(urlSearchText);
      hasSearchHistoryEntry.current = urlSearchText.length > 0;
    }
  }, [navigationType, urlSearchText]);

  useEffect(() => {
    if (isPending || errorKind || isSearchPending) {
      return;
    }

    const announcementTimer = window.setTimeout(() => {
      const projectWord = projects.length === 1 ? 'project' : 'projects';
      setResultAnnouncement((currentAnnouncement) => ({
        id: currentAnnouncement.id + 1,
        message: `${String(projects.length)} ${projectWord} found.`,
      }));
    }, 500);

    return () => {
      window.clearTimeout(announcementTimer);
    };
  }, [errorKind, isPending, isSearchPending, projects.length, searchText, statusFilter]);

  function updateSearchText(value: string): void {
    setSearchText(value);
    const replace = hasSearchHistoryEntry.current;
    hasSearchHistoryEntry.current = value.length > 0;
    setSearchParams(
      (currentSearchParams) => {
        const nextSearchParams = new URLSearchParams(currentSearchParams);
        if (value) {
          nextSearchParams.set('q', value);
        } else {
          nextSearchParams.delete('q');
        }
        return nextSearchParams;
      },
      { replace },
    );
  }

  function updateStatusFilter(value: string): void {
    const nextStatusFilter = parseProjectStatusFilter(value);
    setSearchParams((currentSearchParams) => {
      const nextSearchParams = new URLSearchParams(currentSearchParams);
      if (nextStatusFilter) {
        nextSearchParams.set('status', nextStatusFilter);
      } else {
        nextSearchParams.delete('status');
      }
      return nextSearchParams;
    });
  }

  function clearFilters(): void {
    setSearchText('');
    hasSearchHistoryEntry.current = false;
    setSearchParams((currentSearchParams) => {
      const nextSearchParams = new URLSearchParams(currentSearchParams);
      nextSearchParams.delete('q');
      nextSearchParams.delete('status');
      return nextSearchParams;
    });
  }

  const showOnlyArchivedState = hasOnlyArchivedProjects && !statusFilter;

  return (
    <main className="mx-auto max-w-4xl p-8">
      <h1 className="text-2xl font-bold">Projects</h1>
      <div className="mt-6 max-w-md">
        <label htmlFor="project-search" className="block font-semibold">
          Search projects
        </label>
        <input
          id="project-search"
          type="search"
          value={searchText}
          onChange={(event) => {
            updateSearchText(event.target.value);
          }}
          className="mt-2 w-full rounded border border-slate-300 px-3 py-2 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-200"
        />
      </div>
      <div className="mt-4 max-w-md">
        <label htmlFor="project-status" className="block font-semibold">
          Status
        </label>
        <select
          id="project-status"
          value={statusFilter ?? ''}
          onChange={(event) => {
            updateStatusFilter(event.target.value);
          }}
          className="mt-2 w-full rounded border border-slate-300 bg-white px-3 py-2 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-200"
        >
          <option value="">Active and paused</option>
          <option value="all">All statuses</option>
          <option value="active">Active</option>
          <option value="paused">Paused</option>
          <option value="archived">Archived</option>
        </select>
      </div>
      <div className="sr-only" role="status" aria-live="polite">
        {isPending && !errorKind ? (
          'Loading projects'
        ) : (
          <span key={resultAnnouncement.id}>{resultAnnouncement.message}</span>
        )}
      </div>
      <section className="mt-6">
        {isPending && !errorKind && <ProjectsTableSkeleton />}
        {errorKind && (
          <ProjectsErrorState
            errorKind={errorKind}
            onRetry={() => {
              void refetch();
            }}
            isRefetching={isRefetching}
          />
        )}
        {!isPending && !errorKind && projects.length === 0 && showOnlyArchivedState && (
          <ProjectsEmptyActionState
            message="All your projects are archived."
            actionLabel="Include archived projects"
            onAction={() => {
              updateStatusFilter('all');
            }}
          />
        )}
        {!isPending &&
          !errorKind &&
          projects.length === 0 &&
          !showOnlyArchivedState &&
          !searchText &&
          !statusFilter && <ProjectsEmptyState />}
        {!isPending &&
          !errorKind &&
          projects.length === 0 &&
          !showOnlyArchivedState &&
          (searchText || statusFilter) && (
            <ProjectsEmptyActionState
              message={
                statusFilter ? 'No projects match your filters.' : 'No projects match your search.'
              }
              actionLabel="Clear filters"
              onAction={clearFilters}
            />
          )}
        {!errorKind && projects.length > 0 && <ProjectsTable projects={projects} />}
      </section>
    </main>
  );
}
