# 과제 체크포인트

## 과제 요구사항

- [x] 배포 후 url 제출
- [x] API 호출 최적화(`Promise.all` 이해)
- [x] SearchDialog 불필요한 연산 최적화
- [x] SearchDialog 불필요한 리렌더링 최적화
- [ ] 시간표 블록 드래그시 렌더링 최적화
- [ ] 시간표 블록 드롭시 렌더링 최적화

## 과제 셀프회고

### 배포 URL

- https://anveloper.dev/front_5th_chapter4-2_advanced/

### API 호출 최적화

- API 호출 최적화 전 속도
  ![Screenshot 2025-06-03 at 16 54 52](https://github.com/user-attachments/assets/af75e867-4ef2-4198-a03c-7e5624cc4741)

<details><summary><strong>axios.ts</strong> 👈🏻</summary>

```ts
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
```
</details>

- `axios instance` 에서 메모리 캐싱 전략 사용 후 속도
  ![Screenshot 2025-06-03 at 16 55 52](https://github.com/user-attachments/assets/1b61c189-bbe4-40e8-932b-6cc7c9cf4202)
  - 배포를 위한 `baseURL` 설정하다가, 올바른 `Promise.all` 사용법 개선 보다 먼저 캐싱을 구현
  - `Record<string, AxiosResponse<unknown>>`로 간단하게 메모리 캐싱 구현
  - 추가적으로 `axios.interceptors`를 이용해 만료시간을 포함한 캐싱전략을 구현하였으나, `interceptor` 수준의 데이터는 서버에서 캐싱하는 것이 아닐까 하여 적용하지 않음
  - 배열에 `await`가 남아있는 상태에서 캐싱으로 인해, 메모리에 저장된 값을 그대로 불러와 호출시점이 동일한 시간 값을 확인할 수 있음

<details><summary><strong>SearchDialog.tsx</strong> 👈🏻</summary>

```tsx
// instance 캐싱 전략 사용 axios instance 객체에서 메모리에 캐싱, interceptor도 가능할 것으로 보이지만.. 실제론 서버에서 해야할 일로 생각됨
const fetchMajors = () => cacheGet<Lecture[]>("/schedules-majors.json");
const fetchLiberalArts = () => cacheGet<Lecture[]>("/schedules-liberal-arts.json");

// TODO: 이 코드를 개선해서 API 호출을 최소화 해보세요 + Promise.all이 현재 잘못 사용되고 있습니다. 같이 개선해주세요.
const fetchAllLectures = () => {
  // async await 제거, Promise.all은 Promise를 반환하고, async 또한 함수를 Promise로 반환해주기 위한 syntactic sugar
  return Promise.all([
    // await 제거, 배열 내에서 함수를 실행하는 것은 순차적으로 await없이 실행
    (console.log("API Call 1", performance.now()), fetchMajors()),
    (console.log("API Call 2", performance.now()), fetchLiberalArts()),
    (console.log("API Call 3", performance.now()), fetchMajors()),
    (console.log("API Call 4", performance.now()), fetchLiberalArts()),
    (console.log("API Call 5", performance.now()), fetchMajors()),
    (console.log("API Call 6", performance.now()), fetchLiberalArts()),
  ]);
};
```
</details>

- 올바른 `Promise.all` 사용 방법 적용
  ![Screenshot 2025-06-03 at 18 00 51](https://github.com/user-attachments/assets/c17f440d-ea41-45e8-8d37-5486a0a3efcb)
  - `Promise.all`의 배열 내에서 `await`로 기다리지 않고 모든 함수를 호출, `Promise.all`에서 한번에 비동기 대기 후 처리
  - `Promise.all`은  `Promise`를 반환하며, `async`도 `Promise`를 반환하는 `systactic sugar` 이기때문에 `async, await` 제거
  - 앞선 함수를 기다리지 않고 다음 함수를 바로 요청하기 때문에 호출 시간이 동일하고 호출에 걸린 시간이 감소
  - 이전 함수가 메모리에 저장되기 전에 다음 함수가 호출되기 때문에 과제의 `fetchAllLectures` 함수로는 캐싱이 의미가 없을 수 있음

## 리뷰 받고 싶은 내용
