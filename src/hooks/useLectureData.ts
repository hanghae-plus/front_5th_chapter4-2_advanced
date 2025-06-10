import { fetchAllLectures } from "@/api/lectures";
import { Lecture } from "@/types/types";
import { useEffect, useMemo, useState } from "react";

export const useLectureData = () => {
  const [lectures, setLectures] = useState<Lecture[]>([]);

  const allMajors = useMemo(
    () => [...new Set(lectures.map((lecture) => lecture.major))],
    [lectures]
  );

  useEffect(() => {
    const loadLectures = async () => {
      const start = performance.now();
      console.log("API 호출 시작: ", start);

      try {
        const results = await fetchAllLectures();
        const end = performance.now();
        console.log("모든 API 호출 완료 ", end);
        console.log("API 호출에 걸린 시간(ms): ", end - start);
        setLectures(results.flatMap((result) => result.data));
      } catch (error) {
        console.error("강의 데이터 로딩 실패:", error);
      }
    };

    loadLectures();
  }, []);

  return {
    lectures,
    allMajors,
  };
};
