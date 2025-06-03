import type { AxiosResponse } from 'axios';

/**
 * 캐시된 fetcher 함수를 생성합니다.
 * 반환된 함수의 첫 번째 호출에서 fetcher가 실행되고,
 * 이후 호출에서는 캐시된 promise를 반환합니다.
 *
 * @param fetcher - AxiosResponse를 반환하는 프로미스 함수입니다.
 * @returns AxiosResponse의 data를 반환하는 프로미스 함수입니다.
 */
export function createCachedFetcher<T>(fetcher: () => Promise<AxiosResponse<T>>): () => Promise<T> {
  let promiseCache: Promise<T> | null = null;

  return () => {
    if (!promiseCache) {
      promiseCache = fetcher()
        .then(res => res.data)
        .catch(error => {
          promiseCache = null; // 에러가 발생하면 캐시를 비웁니다.
          throw error;
        });
    }
    return promiseCache;
  };
}
