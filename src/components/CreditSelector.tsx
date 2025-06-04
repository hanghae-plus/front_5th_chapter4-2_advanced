import { FormControl, FormLabel, Select } from "@chakra-ui/react";
import { memo } from "react";

interface CreditSelectorProps {
  value?: number;
  onChange: (value: number) => void;
}

const CreditSelector = ({ value, onChange }: CreditSelectorProps) => {
  return (
    <FormControl>
      <FormLabel>학점</FormLabel>
      <Select value={value} onChange={(e) => onChange(Number(e.target.value))}>
        <option value={0}>전체</option>
        <option value={1}>1학점</option>
        <option value={2}>2학점</option>
        <option value={3}>3학점</option>
      </Select>
    </FormControl>
  );
};

export default memo(CreditSelector);
