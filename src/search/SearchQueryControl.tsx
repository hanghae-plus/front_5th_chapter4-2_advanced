import { Input } from '@chakra-ui/react';
import { FormLabel } from '@chakra-ui/react';
import { FormControl } from '@chakra-ui/react';
import { memo } from 'react';

interface SearchQueryControlProps {
  query?: string;
  onChange: (query: string) => void;
}
const SearchQueryControl = memo(({ query, onChange }: SearchQueryControlProps) => {
  console.log('render');
  return (
    <FormControl>
      <FormLabel>검색어</FormLabel>
      <Input
        placeholder="과목명 또는 과목코드"
        value={query}
        onChange={(e) => onChange(e.target.value)}
      />
    </FormControl>
  );
});

export default SearchQueryControl;
