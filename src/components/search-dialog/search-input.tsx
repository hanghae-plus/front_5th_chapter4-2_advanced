import { DialogChildProps } from "@/types";
import { FormControl, FormLabel, Input } from "@chakra-ui/react";
import { memo } from "react";

export const SearchInput = memo(({ searchOptions, changeSearchOption }: DialogChildProps) => {
  return (
    <FormControl>
      <FormLabel>검색어</FormLabel>
      <Input
        placeholder="과목명 또는 과목코드"
        value={searchOptions.query}
        onChange={(e) => changeSearchOption("query", e.target.value)}
      />
    </FormControl>
  );
});
