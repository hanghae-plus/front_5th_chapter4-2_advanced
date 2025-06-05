import { memo } from "react";
import {
  FormControl,
  FormLabel,
  CheckboxGroup,
  HStack,
  Checkbox,
} from "@chakra-ui/react";
import { DAY_LABELS } from "../constants";
import { SearchOption } from "../types";

interface DaySelectorProps {
  days: SearchOption["days"];
  changeSearchOption: (
    key: keyof SearchOption,
    values: SearchOption[typeof key]
  ) => void;
}

export const DaySelector = memo(
  ({ days, changeSearchOption }: DaySelectorProps) => {
    return (
      <FormControl>
        <FormLabel>요일</FormLabel>
        <CheckboxGroup
          value={days}
          onChange={(value) => changeSearchOption("days", value as string[])}
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
  }
);
