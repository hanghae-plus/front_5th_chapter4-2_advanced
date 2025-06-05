import {
  Checkbox,
  CheckboxGroup,
  FormControl,
  FormLabel,
  HStack,
} from "@chakra-ui/react";
import { SearchOption } from "@/SearchDialog";
import { memo } from "react";

interface Props {
  searchOptions: SearchOption;
  changeSearchOption: (
    field: keyof SearchOption,
    value: SearchOption[typeof field]
  ) => void;
}

function ScheduleGradeCheckbox({ searchOptions, changeSearchOption }: Props) {
  return (
    <FormControl>
      <FormLabel>학년</FormLabel>
      <CheckboxGroup
        value={searchOptions.grades}
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

export default memo(ScheduleGradeCheckbox);
