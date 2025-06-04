import {
  Checkbox,
  CheckboxGroup,
  FormControl,
  FormLabel,
  HStack,
} from "@chakra-ui/react";
import { memo } from "react";
import { SearchOption } from "../types";

interface GradeCheckboxGroupProps {
  grades: number[];
  onChange: (
    field: keyof SearchOption,
    value: SearchOption[typeof field]
  ) => void;
}

const GradeCheckboxGroup = memo(
  ({ grades, onChange }: GradeCheckboxGroupProps) => {
    return (
      <FormControl>
        <FormLabel>학년</FormLabel>
        <CheckboxGroup
          value={grades}
          onChange={(value) => onChange("grades", value.map(Number))}
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

export default GradeCheckboxGroup;
