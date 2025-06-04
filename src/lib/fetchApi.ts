import axios from "axios";
import type { AxiosRequestConfig, AxiosResponse } from "axios";
import type { fetchApiParams } from "../types";

export default function fetchApi<T>({
  method,
  url,
  body,
}: fetchApiParams): () => Promise<AxiosResponse<T, any>> | null {
  const cachedApi: Record<string, Promise<AxiosResponse<T>> | null> = {};

  return () => {
    const key = `${url}-${method}`;

    if (!cachedApi[key]) {
      const config: AxiosRequestConfig = {
        url,
        method,
      };

      if (body) {
        config.data = body;
      }

      cachedApi[key] = axios.request<T>(config);
    }

    return cachedApi[key];
  };
}
