import axios from "axios";
import { Lecture } from "../types";

export const fetchMajors = () => axios.get<Lecture[]>("/schedules-majors.json");
export const fetchLiberalArts = () =>
  axios.get<Lecture[]>("/schedules-liberal-arts.json");

// TODO: 이 코드를 개선해서 API 호출을 최소화 해보세요 + Promise.all이 현재 잘못 사용되고 있습니다. 같이 개선해주세요.
// before : 평균 170ms // after : 평균 60ms
export const fetchAllLectures = async () => {
  console.log("API 호출 시작:", performance.now());

  const results = await Promise.all([
    (console.log("fetchMajors 호출:", performance.now()), fetchMajors()),
    (console.log("fetchLiberalArts 호출:", performance.now()),
    fetchLiberalArts()),
  ]);

  console.log("API 호출 완료:", performance.now());

  const [majors, liberalArts] = results;

  console.log("데이터 처리 완료:", performance.now());

  return Array(3).fill([majors, liberalArts]).flat();
};
