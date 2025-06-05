import { Select } from '@chakra-ui/react';
import { FormLabel } from '@chakra-ui/react';
import { FormControl } from '@chakra-ui/react';
import { memo } from 'react';

interface SearchCreditsControlProps {
  credits?: number;
  onChange: (credits: number) => void;
}
const SearchCreditsControl = memo(({ credits, onChange }: SearchCreditsControlProps) => {
  return (
    <FormControl>
      <FormLabel>학점</FormLabel>
      <Select value={credits} onChange={(e) => onChange(Number(e.target.value))}>
        <option value="">전체</option>
        <option value="1">1학점</option>
        <option value="2">2학점</option>
        <option value="3">3학점</option>
      </Select>
    </FormControl>
  );
});

export default SearchCreditsControl;
