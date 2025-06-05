import { DAY_LABELS } from "../../constants";
import { SearchOption } from "@/SearchDialog";
import {
  Checkbox,
  CheckboxGroup,
  FormControl,
  FormLabel,
  HStack,
} from "@chakra-ui/react";
import { memo } from "react";

interface Props {
  searchOptions: SearchOption;
  changeSearchOption: (
    field: keyof SearchOption,
    value: SearchOption[typeof field]
  ) => void;
}

function ScheduleDaysCheckbox({ searchOptions, changeSearchOption }: Props) {
  return (
    <FormControl>
      <FormLabel>요일</FormLabel>
      <CheckboxGroup
        value={searchOptions.days}
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

export default memo(ScheduleDaysCheckbox);
