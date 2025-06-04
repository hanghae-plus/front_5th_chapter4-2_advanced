import { FormControl, FormLabel, Input } from "@chakra-ui/react";
import { memo } from "react";
import { SearchOption } from "../types";

interface SearchKeywordProps {
  query?: string;
  onChange: (
    field: keyof SearchOption,
    value: SearchOption[typeof field]
  ) => void;
}

const SearchKeyword = memo(({ query, onChange }: SearchKeywordProps) => {
  return (
    <FormControl>
      <FormLabel>검색어</FormLabel>
      <Input
        placeholder="과목명 또는 과목코드"
        value={query}
        onChange={(e) => onChange("query", e.target.value)}
      />
    </FormControl>
  );
});
export default SearchKeyword;
