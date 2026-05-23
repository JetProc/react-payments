import {act, renderHook} from '@testing-library/react';
import {describe, expect, test, vi} from 'vitest';

import {useAsyncRequest} from './useAsyncRequest';

const createDeferred = <T,>() => {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;

  const promise = new Promise<T>((promiseResolve, promiseReject) => {
    resolve = promiseResolve;
    reject = promiseReject;
  });

  return {promise, resolve, reject};
};

describe('useAsyncRequest', () => {
  test('요청 실행 중 loading 상태로 전환한 뒤 성공하면 응답 데이터를 담는다', async () => {
    const deferred = createDeferred<string>();
    const request = vi.fn(() => deferred.promise);
    const {result} = renderHook(() => useAsyncRequest({request, errorMessage: '요청 실패'}));

    let runPromise!: Promise<string | null>;
    act(() => {
      runPromise = result.current.run();
    });

    expect(result.current.state).toEqual({status: 'loading'});

    await act(async () => {
      deferred.resolve('success');
      await runPromise;
    });

    expect(result.current.state).toEqual({status: 'success', data: 'success'});
  });

  test('요청이 실패하면 공통 에러 메시지를 담은 error 상태로 전환한다', async () => {
    const request = vi.fn().mockRejectedValue(new Error('server error'));
    const {result} = renderHook(() => useAsyncRequest({request, errorMessage: '요청 실패'}));

    await act(async () => {
      await result.current.run();
    });

    expect(result.current.state).toEqual({status: 'error', message: '요청 실패'});
  });
});
