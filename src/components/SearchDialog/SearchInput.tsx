import { memo } from "react";
import { FormControl, FormLabel, Input } from "@chakra-ui/react";
import type { SearchOption } from "@/types";

interface SearchInputProps {
  query: SearchOption["query"];
  changeSearchOption: (
    field: keyof SearchOption,
    value: SearchOption[typeof field],
  ) => void;
}

const SearchInput = ({ query, changeSearchOption }: SearchInputProps) => {
  return (
    <FormControl>
      <FormLabel>검색어</FormLabel>
      <Input
        placeholder="과목명 또는 과목코드"
        value={query}
        onChange={(e) => changeSearchOption("query", e.target.value)}
      />
    </FormControl>
  );
};

export default memo(SearchInput);
