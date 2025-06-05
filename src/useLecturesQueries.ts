import { Lecture } from "./types";
import axios, { AxiosResponse } from "axios";

const fetchMajors = () => axios.get<Lecture[]>("/schedules-majors.json");
const fetchLiberalArts = () =>
  axios.get<Lecture[]>("/schedules-liberal-arts.json");

export const useLecturesQueries = () => {
  // query key와 같은 형태로 query.type 캐시
  const cache = new Map<
    "major" | "liberal",
    Promise<AxiosResponse<Lecture[]>>
  >();

  const fetchAllLectures = async (
    queries: { query: string; type: "major" | "liberal" }[]
  ): Promise<AxiosResponse<Lecture[]>[]> => {
    const promises = queries.map(({ query, type }) => {
      console.log(`API Call ${query}`, performance.now());

      if (!cache.has(type)) {
        const promise = type === "major" ? fetchMajors() : fetchLiberalArts();
        cache.set(type, promise);
      }

      return cache.get(type)!;
    });

    return await Promise.all(promises);
  };

  return { fetchAllLectures };
};
