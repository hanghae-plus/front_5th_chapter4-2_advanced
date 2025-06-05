import { memo } from "react";
import { FormControl, FormLabel, Select } from "@chakra-ui/react";
import { SearchOption } from "../types";

interface CreditsSelectorProps {
  changeSearchOption: (
    key: keyof SearchOption,
    values: SearchOption[typeof key]
  ) => void;
  credits: SearchOption["credits"];
}

export const CreditsSelector = memo(
  ({ changeSearchOption, credits }: CreditsSelectorProps) => {
    return (
      <FormControl>
        <FormLabel>학점</FormLabel>
        <Select
          value={credits}
          onChange={(e) => changeSearchOption("credits", e.target.value)}
        >
          <option value="">전체</option>
          <option value="1">1학점</option>
          <option value="2">2학점</option>
          <option value="3">3학점</option>
        </Select>
      </FormControl>
    );
  }
);
