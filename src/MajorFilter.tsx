import { useMemo, memo } from "react";
import {
  Box,
  Checkbox,
  CheckboxGroup,
  FormControl,
  FormLabel,
  Stack,
  Tag,
  TagCloseButton,
  TagLabel,
  Wrap,
} from "@chakra-ui/react";


interface MajorFilterProps {
  allMajors: string[];
  selectedMajors: string[];
  onChangeMajors: (majors: string[]) => void;
}

const MajorFilter = memo<MajorFilterProps>(
  ({ allMajors, selectedMajors, onChangeMajors }) => {
    const selectedTags = useMemo(() => {
      return selectedMajors.map((major) => (
        <Tag key={major} size="sm" variant="outline" colorScheme="blue">
          <TagLabel>{major.replace(/<p>/gi, " ")}</TagLabel>
          <TagCloseButton
            onClick={() =>
              onChangeMajors(selectedMajors.filter((v) => v !== major))
            }
          />
        </Tag>
      ));
    }, [selectedMajors, onChangeMajors]);

    const checkboxList = useMemo(() => {
      return allMajors.map((major) => (
        <Box key={major}>
          <Checkbox key={major} size="sm" value={major}>
            {major.replace(/<p>/gi, " ")}
          </Checkbox>
        </Box>
      ));
    }, [allMajors]);

    return (
      <FormControl>
        <FormLabel>전공</FormLabel>
        <CheckboxGroup
          colorScheme="green"
          value={selectedMajors}
          onChange={(vals) => onChangeMajors(vals as string[])}
        >
          <Wrap spacing={1} mb={2}>
            {selectedTags}
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
            {checkboxList}
          </Stack>
        </CheckboxGroup>
      </FormControl>
    );
  }
);

export default MajorFilter;