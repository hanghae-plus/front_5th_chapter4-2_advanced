import {
  Checkbox,
  CheckboxGroup,
  FormControl,
  FormLabel,
  HStack,
} from "@chakra-ui/react";
import { memo } from "react";
import type { SearchOption } from "@/types";

interface GradeSelectProps {
  grades: SearchOption["grades"];
  changeSearchOption: (
    field: keyof SearchOption,
    value: SearchOption[typeof field],
  ) => void;
}

const GradeSelect = ({ grades, changeSearchOption }: GradeSelectProps) => {
  return (
    <FormControl>
      <FormLabel>학년</FormLabel>
      <CheckboxGroup
        value={grades}
        onChange={(value) => changeSearchOption("grades", value.map(Number))}>
        <HStack spacing={4}>
          {[1, 2, 3, 4].map((grade) => (
            <Checkbox
              key={grade}
              value={grade}>
              {grade}학년
            </Checkbox>
          ))}
        </HStack>
      </CheckboxGroup>
    </FormControl>
  );
};

export default memo(GradeSelect);
