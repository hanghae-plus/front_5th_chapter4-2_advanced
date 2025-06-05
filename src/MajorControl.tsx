import { memo, useMemo } from "react";
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
import { Lecture } from "./types";

interface PropsType {
  lectures: Lecture[];
  majors: string[];
  onChangeMajor: (value: string[]) => void;
}

const MajorControl = memo<PropsType>(({ lectures, majors, onChangeMajor }) => {
  const allMajors = useMemo(
    () => [...new Set(lectures.map((lecture) => lecture.major))],
    [lectures]
  );

  const SelectTag = useMemo(() => {
    return majors.map((major) => (
      <Tag key={major} size="sm" variant="outline" colorScheme="blue">
        <TagLabel>{major.split("<p>").pop()}</TagLabel>
        <TagCloseButton
          onClick={() => onChangeMajor(majors.filter((v) => v !== major))}
        />
      </Tag>
    ));
  }, [majors, onChangeMajor]);

  const MajorList = useMemo(() => {
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
        value={majors}
        onChange={(values) => onChangeMajor(values as string[])}
      >
        <Wrap spacing={1} mb={2}>
          {SelectTag}
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
          {MajorList}
        </Stack>
      </CheckboxGroup>
    </FormControl>
  );
});

export default MajorControl;
