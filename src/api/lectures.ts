import { Lecture } from "@/types/types";
import axios, { AxiosResponse } from "axios";

const fetchMajors = () => axios.get<Lecture[]>("/schedules-majors.json");
const fetchLiberalArts = () =>
  axios.get<Lecture[]>("/schedules-liberal-arts.json");

// 간단한 메모리 캐시
let majorsCache: Promise<AxiosResponse<Lecture[]>> | null = null;
let liberalArtsCache: Promise<AxiosResponse<Lecture[]>> | null = null;

const getCachedMajors = () => {
  if (!majorsCache) {
    console.log("전공 데이터 새로 요청", performance.now());
    majorsCache = fetchMajors();
  } else {
    console.log("전공 데이터 캐시 사용", performance.now());
  }
  return majorsCache;
};

const getCachedLiberalArts = () => {
  if (!liberalArtsCache) {
    console.log("교양 데이터 새로 요청", performance.now());
    liberalArtsCache = fetchLiberalArts();
  } else {
    console.log("교양 데이터 캐시 사용", performance.now());
  }
  return liberalArtsCache;
};

export const fetchAllLectures = async () => {
  console.log("API 호출 시작", performance.now());

  const promises = [
    getCachedMajors(), // 1번째 호출 시에만 실제 API 요청
    getCachedLiberalArts(), // 1번째 호출 시에만 실제 API 요청
    getCachedMajors(), // 캐시된 Promise 재사용
    getCachedLiberalArts(), // 캐시된 Promise 재사용
    getCachedMajors(), // 캐시된 Promise 재사용
    getCachedLiberalArts(), // 캐시된 Promise 재사용
  ];

  return await Promise.all(promises);
};
