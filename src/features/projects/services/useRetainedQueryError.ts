import { useEffect, useRef } from 'react';

interface UseRetainedQueryErrorOptions<ErrorKind extends string> {
  error: Error | null;
  hasData: boolean;
  isFetching: boolean;
  classifyError: (error: Error) => ErrorKind;
}

interface UseRetainedQueryErrorResult<ErrorKind extends string> {
  errorKind: ErrorKind | null;
  isRetryingAfterError: boolean;
}

export function useRetainedQueryError<ErrorKind extends string>({
  error,
  hasData,
  isFetching,
  classifyError,
}: UseRetainedQueryErrorOptions<ErrorKind>): UseRetainedQueryErrorResult<ErrorKind> {
  const lastErrorKind = useRef<ErrorKind | null>(null);

  useEffect(() => {
    if (error) {
      lastErrorKind.current = classifyError(error);
    }
  }, [classifyError, error]);

  useEffect(() => {
    if (hasData) {
      lastErrorKind.current = null;
    }
  }, [hasData]);

  const currentErrorKind = error ? classifyError(error) : null;
  const isRetryingAfterError = isFetching && lastErrorKind.current !== null;
  const errorKind = currentErrorKind ?? (isRetryingAfterError ? lastErrorKind.current : null);

  return { errorKind, isRetryingAfterError };
}
