import {
  FormControl,
  FormLabel,
  CheckboxGroup,
  HStack,
  Checkbox,
} from "@chakra-ui/react";
import { memo } from "react";

interface GradeCheckboxProps {
  value: number[];
  onChange: (value: number[]) => void;
}

const GradeCheckbox = ({ value, onChange }: GradeCheckboxProps) => {
  return (
    <FormControl>
      <FormLabel>학년</FormLabel>
      <CheckboxGroup
        value={value}
        onChange={(value) => onChange(value.map(Number))}
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
};

export default memo(GradeCheckbox);
