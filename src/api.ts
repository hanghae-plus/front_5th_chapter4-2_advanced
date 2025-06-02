import axios from 'axios';
import { Lecture } from './types.ts';

export const fetchMajors = () => axios.get<Lecture[]>('/schedules-majors.json');
export const fetchLiberalArts = () => axios.get<Lecture[]>('/schedules-liberal-arts.json');

const createLectureFetcher = () => {
  let cache: Lecture[] | null = null;

  return async () => {
    if (cache) {
      return cache;
    }

    const [majorsResponse, liberalArtsResponse] = await Promise.all([
      fetchMajors(),
      fetchLiberalArts(),
    ]);

    cache = [...majorsResponse.data, ...liberalArtsResponse.data];
    return cache;
  };
};

export const fetchAllLectures = createLectureFetcher();
