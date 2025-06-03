import axios from "axios";
import { Lecture } from "../types";

const fetchMajors = () => axios.get<Lecture[]>("/schedules-majors.json");

const fetchLiberalArts = () =>
    axios.get<Lecture[]>("/schedules-liberal-arts.json");

const apiCache = new Map<string, Promise<unknown>>();

const cachedApiCall = async (key: string, apiCall: () => Promise<unknown>) => {
    // 이미 캐시에 있다면 캐시된 결과 반환
    if (apiCache.has(key)) {
      return apiCache.get(key);
    }
  
    const promise = apiCall();
    apiCache.set(key, promise);
    return promise;
  };

// TODO: 이 코드를 개선해서 API 호출을 최소화 해보세요 + Promise.all이 현재 잘못 사용되고 있습니다. 같이 개선해주세요.
export const getFetchAllLectures = async () =>
    await Promise.all([
      (console.log("API Call 1", performance.now()), cachedApiCall("fetchMajors", fetchMajors)),
      (console.log("API Call 2", performance.now()), cachedApiCall("fetchLiberalArts", fetchLiberalArts)),
      (console.log("API Call 3", performance.now()), cachedApiCall("fetchMajors", fetchMajors)),
      (console.log("API Call 4", performance.now()), cachedApiCall("fetchLiberalArts4", fetchLiberalArts)),
      (console.log("API Call 5", performance.now()), cachedApiCall("fetchMajors", fetchMajors)),
      (console.log("API Call 6", performance.now()), cachedApiCall("fetchLiberalArts", fetchLiberalArts)),
    ]);