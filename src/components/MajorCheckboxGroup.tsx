import {
  CheckboxGroup,
  Checkbox,
  Stack,
  FormControl,
  FormLabel,
  Wrap,
  Tag,
  TagLabel,
  TagCloseButton,
  Box,
} from "@chakra-ui/react";
import { memo } from "react";
import { SearchOption } from "../types";

interface MajorCheckboxGroupProps {
  searchOptions: SearchOption;
  allMajors: string[];
  onChange: (
    field: keyof SearchOption,
    value: SearchOption[typeof field]
  ) => void;
}

const MajorCheckboxGroup = memo(
  ({ searchOptions, allMajors, onChange }: MajorCheckboxGroupProps) => {
    return (
      <FormControl>
        <FormLabel>전공</FormLabel>
        <CheckboxGroup
          colorScheme="green"
          value={searchOptions.majors}
          onChange={(values) => onChange("majors", values as string[])}
        >
          <Wrap spacing={1} mb={2}>
            {searchOptions.majors.map((major) => (
              <Tag key={major} size="sm" variant="outline" colorScheme="blue">
                <TagLabel>{major.split("<p>").pop()}</TagLabel>
                <TagCloseButton
                  onClick={() =>
                    onChange(
                      "majors",
                      searchOptions.majors.filter((v) => v !== major)
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

export default MajorCheckboxGroup;
