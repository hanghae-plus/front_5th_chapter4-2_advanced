import { DialogChildProps } from "@/types";
import { Checkbox, CheckboxGroup, FormControl, FormLabel, HStack } from "@chakra-ui/react";
import { memo } from "react";

export const GradeCheckbox = memo(({ searchOptions, changeSearchOption }: DialogChildProps) => {
  return (
    <FormControl>
      <FormLabel>학년</FormLabel>
      <CheckboxGroup value={searchOptions.grades} onChange={(value) => changeSearchOption("grades", value.map(Number))}>
        <HStack spacing={4}>
          {[1, 2, 3, 4].map((grade) => (
            <Checkbox key={grade} value={grade}>
              {grade}학년
            </Checkbox>
          ))}
        </HStack>
      </CheckboxGroup>
    </FormControl>
  );
});
