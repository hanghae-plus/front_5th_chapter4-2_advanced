import { CheckboxGroup } from '@chakra-ui/react';
import { TagLabel } from '@chakra-ui/react';
import { TagCloseButton } from '@chakra-ui/react';
import { Checkbox } from '@chakra-ui/react';
import { Box } from '@chakra-ui/react';
import { Stack, Wrap } from '@chakra-ui/react';
import { Tag } from '@chakra-ui/react';
import { FormControl } from '@chakra-ui/react';
import { FormLabel } from '@chakra-ui/react';
import { SearchOption } from '../SearchDialog';
import { memo } from 'react';

interface SearchMajorsControlProps {
  majors: string[];
  allMajors: string[];
  onChange: (majors: string[]) => void;
  changeSearchOption: (field: keyof SearchOption, value: SearchOption[typeof field]) => void;
}

const SearchMajorsControl = memo(
  ({ majors, allMajors, onChange, changeSearchOption }: SearchMajorsControlProps) => {
    return (
      <FormControl>
        <FormLabel>전공</FormLabel>
        <CheckboxGroup colorScheme="green" value={majors} onChange={onChange}>
          <Wrap spacing={1} mb={2}>
            {majors.map((major) => (
              <Tag key={major} size="sm" variant="outline" colorScheme="blue">
                <TagLabel>{major.split('<p>').pop()}</TagLabel>
                <TagCloseButton
                  onClick={() =>
                    changeSearchOption(
                      'majors',
                      majors.filter((v) => v !== major)
                    )
                  }
                />
              </Tag>
            ))}
          </Wrap>
          <Stack
            spacing={2}
            overflowY="auto"
            h="100px"
            border="1px solid"
            borderColor="gray.200"
            borderRadius={5}
            p={2}
          >
            {allMajors.map((major) => (
              <Box key={major}>
                <Checkbox key={major} size="sm" value={major}>
                  {major.replace(/<p>/gi, ' ')}
                </Checkbox>
              </Box>
            ))}
          </Stack>
        </CheckboxGroup>
      </FormControl>
    );
  }
);

export default SearchMajorsControl;
