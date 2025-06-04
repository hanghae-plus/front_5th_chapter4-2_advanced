import axios from 'axios';
import { Lecture } from '../types/index.ts';

export const fetchMajors = () => axios.get<Lecture[]>('/schedules-majors.json');
export const fetchLiberalArts = () => axios.get<Lecture[]>('/schedules-liberal-arts.json');

let cache: Lecture[] = [];
let isLoaded = false;

export const fetchAllLectures = async (): Promise<Lecture[]> => {
  if (isLoaded) return cache;

  // majors 먼저 가져오기
  const majors = await fetchMajors();
  cache = [...majors.data];

  // 백그라운드로 교양도 가져와서 병합 (await 안 함)
  fetchLiberalArts().then((res) => {
    cache = [...cache, ...res.data];
    isLoaded = true;
  });

  return cache;
};
