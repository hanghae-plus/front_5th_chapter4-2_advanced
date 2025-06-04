import { FormControl, FormLabel, Select } from "@chakra-ui/react";
import { memo } from "react";
import { SearchOption } from "../types";

interface CreditsSelectProps {
  credits?: number;
  onChange: (
    field: keyof SearchOption,
    value: SearchOption[typeof field]
  ) => void;
}

const CreditsSelect = memo(({ credits, onChange }: CreditsSelectProps) => {
  return (
    <FormControl>
      <FormLabel>학점</FormLabel>
      <Select
        value={credits}
        onChange={(e) => onChange("credits", e.target.value)}
      >
        <option value="">전체</option>
        <option value="1">1학점</option>
        <option value="2">2학점</option>
        <option value="3">3학점</option>
      </Select>
    </FormControl>
  );
});
export default CreditsSelect;
