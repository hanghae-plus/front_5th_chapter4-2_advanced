import {
  Checkbox,
  CheckboxGroup,
  FormControl,
  FormLabel,
  HStack,
} from "@chakra-ui/react";
import { memo } from "react";
import { DAY_LABELS } from "../constants";
import { SearchOption } from "../types";

interface DayCheckboxGroupProps {
  days: string[];
  onChange: (
    field: keyof SearchOption,
    value: SearchOption[typeof field]
  ) => void;
}

const DayCheckboxGroup = memo(({ days, onChange }: DayCheckboxGroupProps) => {
  return (
    <FormControl>
      <FormLabel>요일</FormLabel>
      <CheckboxGroup
        value={days}
        onChange={(value) => onChange("days", value as string[])}
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
});

export default DayCheckboxGroup;
