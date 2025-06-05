import { useCallback, useRef } from "react";
import { Lecture } from "../types";
import axios from "axios";

export const useLectureFetcher = () => {
  const majorsCacheRef = useRef<Lecture[] | null>(null);
  const liberalArtsCacheRef = useRef<Lecture[] | null>(null);

  const fetchMajors = useCallback(async () => {
    if (majorsCacheRef.current) {
      return majorsCacheRef.current;
    }
    const response = await axios.get<Lecture[]>("/schedules-majors.json");
    majorsCacheRef.current = response.data;
    return majorsCacheRef.current;
  }, []);

  const fetchLiberalArts = useCallback(async () => {
    if (liberalArtsCacheRef.current) {
      return liberalArtsCacheRef.current;
    }
    const response = await axios.get<Lecture[]>("/schedules-liberal-arts.json");
    liberalArtsCacheRef.current = response.data;
    return liberalArtsCacheRef.current;
  }, []);

  const fetchAllLectures = useCallback(async () => {
    return await Promise.all([
      (console.log("API Call 1", performance.now()), fetchMajors()),
      (console.log("API Call 2", performance.now()), fetchLiberalArts()),
      (console.log("API Call 3", performance.now()), fetchMajors()),
      (console.log("API Call 4", performance.now()), fetchLiberalArts()),
      (console.log("API Call 5", performance.now()), fetchMajors()),
      (console.log("API Call 6", performance.now()), fetchLiberalArts()),
    ]);
  }, [fetchMajors, fetchLiberalArts]);

  return { fetchAllLectures };
};
