import { memo } from "react";
import {
  FormControl,
  FormLabel,
  CheckboxGroup,
  HStack,
  Checkbox,
} from "@chakra-ui/react";
import { SearchOption } from "../types";

interface GradesSelectorProps {
  grades: SearchOption["grades"];
  changeSearchOption: (
    key: keyof SearchOption,
    values: SearchOption[typeof key]
  ) => void;
}

export const GradesSelector = memo(
  ({ grades, changeSearchOption }: GradesSelectorProps) => {
    return (
      <FormControl>
        <FormLabel>학년</FormLabel>
        <CheckboxGroup
          value={grades}
          onChange={(value) => changeSearchOption("grades", value.map(Number))}
        >
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
  }
);
