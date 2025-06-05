import { useCallback, useRef } from "react";

import axios, { AxiosResponse } from "axios";

export const useApiCache = () => {
  const cache = useRef<Map<string, Promise<AxiosResponse>>>(new Map());

  const cachedFetch = useCallback(
    <T>(url: string): Promise<AxiosResponse<T>> => {
      if (!cache.current.has(url)) {
        cache.current.set(url, axios.get<T>(url));
      }
      return cache.current.get(url)!;
    },
    []
  );

  return { cachedFetch };
};
