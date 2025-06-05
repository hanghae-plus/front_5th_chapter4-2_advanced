import { DAY_LABELS } from "@/constants.ts";
import { DialogChildProps } from "@/types";
import { Checkbox, CheckboxGroup, FormControl, FormLabel, HStack } from "@chakra-ui/react";
import { memo } from "react";

export const DaysCheckbox = memo(({ searchOptions, changeSearchOption }: DialogChildProps) => {
  return (
    <FormControl>
      <FormLabel>요일</FormLabel>
      <CheckboxGroup value={searchOptions.days} onChange={(value) => changeSearchOption("days", value as string[])}>
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
