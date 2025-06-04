import axios from 'axios';
import { Lecture } from '../types';

export const fetchMajors = () => axios.get<Lecture[]>('/schedules-majors.json');
export const fetchLiberalArts = () => axios.get<Lecture[]>('/schedules-liberal-arts.json');

let cache: Lecture[] | null = null;
let fetching: Promise<Lecture[]> | null = null;

export const fetchAllLectures = async (): Promise<Lecture[]> => {
  // 캐시된 결과가 있다면 그대로 반환
  if (cache) return cache;
  // 이미 fetching 중인 경우, 해당 Promise를 반환
  if (fetching) return fetching;

  // 캐시가 없고 fetching 중이지 않다면, 데이터를 가져오는 Promise를 생성
  fetching = Promise.all([fetchMajors(), fetchLiberalArts()]).then(([majors, liberal]) => {
    cache = [...majors.data, ...liberal.data]; // 결과 캐싱
    return cache;
  });

  // 진행중인 fetching Promise를 반환
  return fetching;
};
