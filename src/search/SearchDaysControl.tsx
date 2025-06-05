import { FormControl, FormLabel, CheckboxGroup, HStack, Checkbox } from '@chakra-ui/react';
import { memo } from 'react';
import { DAY_LABELS } from '../constants';

interface SearchDaysControlProps {
  days?: string[];
  onChange: (days: string[]) => void;
}
const SearchDaysControl = memo(({ days, onChange }: SearchDaysControlProps) => {
  return (
    <FormControl>
      <FormLabel>요일</FormLabel>
      <CheckboxGroup value={days} onChange={onChange}>
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

export default SearchDaysControl;
