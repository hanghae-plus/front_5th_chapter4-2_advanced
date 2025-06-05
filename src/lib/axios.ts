import axios, { AxiosResponse } from "axios";

// 레포지토리 base URL 추가
const api = axios.create({
  baseURL: import.meta.env.BASE_URL,
});

// instance 캐싱 전략
const cache: Record<string, AxiosResponse<unknown>> = {};

const cacheGet = async <T = unknown>(url: string): Promise<AxiosResponse<T>> => {
  if (cache[url]) return cache[url] as AxiosResponse<T>;

  const response = await api.get<T>(url);
  cache[url] = response;
  return response;
};

export { api, cacheGet };

// interceptor 캐싱 전략, 미사용
type CachedWithTTL = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  response: AxiosResponse<any, any>;
  timestamp: number;
};

const cachedApi = axios.create({
  baseURL: import.meta.env.BASE_URL,
});

const cachedResponse: Record<string, CachedWithTTL> = {};
const CACHE_TTL = 5 * 1_000 * 60;

cachedApi.interceptors.request.use((config) => {
  const key = config.url ?? "";
  const cached = cachedResponse[key];

  if (cached) {
    const isExpired = Date.now() - cached.timestamp > CACHE_TTL;
    if (!isExpired) {
      config.headers["x-from-cache"] = "true";
      config.adapter = () => Promise.resolve(cached.response);
    } else {
      delete cachedResponse[key];
    }
  }
  return config;
});

api.interceptors.response.use((response) => {
  const key = response.config.url ?? "";

  if (response.config.headers["x-from-cache"] !== "true") {
    cachedResponse[key] = { response, timestamp: Date.now() };
  }

  return response;
});
