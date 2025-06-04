import {
  FormControl,
  FormLabel,
  CheckboxGroup,
  HStack,
  Checkbox,
} from "@chakra-ui/react";
import { memo } from "react";
import { DAY_LABELS } from "../constants.ts";

interface DayCheckboxProps {
  value: string[];
  onChange: (value: string[]) => void;
}

const DayCheckbox = ({ value, onChange }: DayCheckboxProps) => {
  return (
    <FormControl>
      <FormLabel>요일</FormLabel>
      <CheckboxGroup
        value={value}
        onChange={(value) => onChange(value as string[])}
      >
        <HStack spacing={4}>
          {DAY_LABELS.map((day) => (
            <Checkbox key={day} value={day}>
              {day}
            </Checkbox>
          ))}
        </HStack>
      </CheckboxGroup>
    </FormControl>
  );
};

export default memo(DayCheckbox);
