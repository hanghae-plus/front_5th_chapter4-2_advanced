import { memo } from "react";
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
import type { SearchOption } from "@/types";

interface MajorSelectProps {
  majors: SearchOption["majors"];
  changeSearchOption: (
    field: keyof SearchOption,
    value: SearchOption[typeof field],
  ) => void;
  allMajors: string[];
}

const MajorSelect = ({
  majors,
  changeSearchOption,
  allMajors,
}: MajorSelectProps) => {
  return (
    <FormControl>
      <FormLabel>전공</FormLabel>
      <CheckboxGroup
        colorScheme="green"
        value={majors}
        onChange={(values) => changeSearchOption("majors", values as string[])}>
        <Wrap
          spacing={1}
          mb={2}>
          {majors.map((major) => (
            <Tag
              key={major}
              size="sm"
              variant="outline"
              colorScheme="blue">
              <TagLabel>{major.split("<p>").pop()}</TagLabel>
              <TagCloseButton
                onClick={() =>
                  changeSearchOption(
                    "majors",
                    majors.filter((v) => v !== major),
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
          p={2}>
          {allMajors.map((major) => (
            <Box key={`box-${major}`}>
              <Checkbox
                key={`checkbox-${major}`}
                size="sm"
                value={major}>
                {major.replace(/<p>/gi, " ")}
              </Checkbox>
            </Box>
          ))}
        </Stack>
      </CheckboxGroup>
    </FormControl>
  );
};

export default memo(MajorSelect);
