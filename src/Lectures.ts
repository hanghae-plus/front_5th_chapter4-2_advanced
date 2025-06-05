import { Lecture } from "./types.ts";
import axios from "axios";

const fetchMajors = () => axios.get<Lecture[]>("/schedules-majors.json");
const fetchLiberalArts = () =>
  axios.get<Lecture[]>("/schedules-liberal-arts.json");

// 캐시를 위한 클로저를 사용한 함수 생성
const createCachedFetcher = () => {
  const cache = new Map();

  const cachedFetch = async (key: string, fetchFunction: () => void) => {
    // 이미 캐시된 데이터가 있으면 반환
    if (cache.has(key)) {
      console.log(`Cache Hit: ${key}`, performance.now());
      return cache.get(key);
    }

    // 캐시에 없으면 API 호출하고 결과를 캐시에 저장
    console.log(`API Call: ${key}`, performance.now());
    const result = await fetchFunction();
    cache.set(key, result);
    return result;
  };

  return cachedFetch;
};

// 캐시된 fetcher 인스턴스 생성
const cachedFetch = createCachedFetcher();

// 개선된 fetchAllLectures 함수
export const fetchAllLectures = async () => {
  // Promise.all에 Promise 객체들을 직접 전달 (await 제거로 병렬 실행)
  const results = await Promise.all([
    cachedFetch("1", fetchMajors),
    cachedFetch("2", fetchLiberalArts),
    cachedFetch("3", fetchMajors), // 캐시에서 반환
    cachedFetch("4", fetchLiberalArts), // 캐시에서 반환
    cachedFetch("5", fetchMajors), // 캐시에서 반환
    cachedFetch("6", fetchLiberalArts), // 캐시에서 반환
  ]);

  return results;
};
