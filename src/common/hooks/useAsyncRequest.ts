import {useCallback, useEffect, useRef, useState} from 'react';

export type AsyncRequestState<T> =
  | {status: 'idle'}
  | {status: 'loading'}
  | {status: 'success'; data: T}
  | {status: 'error'; message: string};

type UseAsyncRequestOptions<T> = {
  request: () => Promise<T>;
  errorMessage: string;
};

export const useAsyncRequest = <T,>({request, errorMessage}: UseAsyncRequestOptions<T>) => {
  const [state, setState] = useState<AsyncRequestState<T>>({status: 'idle'});
  const isMountedRef = useRef(false);

  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const setError = useCallback((message: string) => {
    if (isMountedRef.current) setState({status: 'error', message});
  }, []);

  const run = useCallback(async () => {
    if (isMountedRef.current) setState({status: 'loading'});

    try {
      const data = await request();
      if (isMountedRef.current) setState({status: 'success', data});

      return data;
    } catch {
      if (isMountedRef.current) setState({status: 'error', message: errorMessage});

      return null;
    }
  }, [errorMessage, request]);

  return {
    state,
    run,
    setError,
  };
};
