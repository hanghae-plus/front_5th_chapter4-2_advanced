import { SearchOption } from "@/components/dialog/types";
import { useCallback, useEffect, useState } from "react";

interface SearchInfo {
  tableId: string;
  day?: string;
  time?: number;
}

export const useSearchOptions = (searchInfo?: SearchInfo | null) => {
  const [searchOptions, setSearchOptions] = useState<SearchOption>({
    query: "",
    grades: [],
    days: [],
    times: [],
    majors: [],
  });

  const changeSearchOption = useCallback(
    (field: keyof SearchOption, value: SearchOption[typeof field]) => {
      setSearchOptions((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  useEffect(() => {
    setSearchOptions((prev) => ({
      ...prev,
      days: searchInfo?.day ? [searchInfo.day] : [],
      times: searchInfo?.time ? [searchInfo.time] : [],
    }));
  }, [searchInfo]);

  return {
    searchOptions,
    changeSearchOption,
  };
};
