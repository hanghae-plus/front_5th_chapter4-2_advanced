import { Checkbox, CheckboxGroup, FormControl, FormLabel, HStack } from '@chakra-ui/react';
import { memo } from 'react';

interface SearchGradesControlProps {
  grades?: number[];
  onChange: (grades: number[]) => void;
}

const SearchGradesControl = memo(({ grades, onChange }: SearchGradesControlProps) => {
  const handleChange = (values: number[]) => {
    onChange(values.map(Number));
  };
  return (
    <FormControl>
      <FormLabel>학년</FormLabel>
      <CheckboxGroup value={grades} onChange={handleChange}>
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

export default SearchGradesControl;
