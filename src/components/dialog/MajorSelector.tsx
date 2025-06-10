import { memo, useCallback } from "react";
import {
  FormControl,
  FormLabel,
  CheckboxGroup,
  Checkbox,
  Wrap,
  Tag,
  TagLabel,
  TagCloseButton,
  Stack,
  Box,
} from "@chakra-ui/react";

const MajorSelector = memo(
  ({
    majors,
    allMajors,
    onMajorsChange,
  }: {
    majors: string[];
    allMajors: string[];
    onMajorsChange: (majors: string[]) => void;
  }) => {
    const handleMajorRemove = useCallback(
      (majorToRemove: string) => {
        onMajorsChange(majors.filter((major) => major !== majorToRemove));
      },
      [majors, onMajorsChange]
    );

    const handleMajorToggle = useCallback(
      (values: string[]) => {
        onMajorsChange(values);
      },
      [onMajorsChange]
    );

    return (
      <FormControl>
        <FormLabel>전공</FormLabel>
        <CheckboxGroup
          colorScheme="green"
          value={majors}
          onChange={handleMajorToggle}
        >
          <Wrap spacing={1} mb={2}>
            {majors.map((major) => (
              <Tag key={major} size="sm" variant="outline" colorScheme="blue">
                <TagLabel>{major.split("<p>").pop()}</TagLabel>
                <TagCloseButton onClick={() => handleMajorRemove(major)} />
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
                  {major.replace(/<p>/gi, " ")}
                </Checkbox>
              </Box>
            ))}
          </Stack>
        </CheckboxGroup>
      </FormControl>
    );
  }
);

export default MajorSelector;
