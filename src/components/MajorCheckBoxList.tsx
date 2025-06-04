import {
  Box,
  Checkbox,
  CheckboxGroup,
  Stack,
  Tag,
  TagCloseButton,
  TagLabel,
  Wrap,
} from "@chakra-ui/react";
import { memo } from "react";
import { SearchOption } from "../types";

interface Props {
  searchOptions: {
    majors: string[];
  };
  changeSearchOption: (
    field: keyof SearchOption,
    value: SearchOption[typeof field]
  ) => void;
  allMajors: string[];
}

function MajorCheckBoxList(props: Props) {
  const { searchOptions, changeSearchOption, allMajors } = props;

  console.log("🔁 MajorCheckboxList 렌더링", props);
  return (
    <CheckboxGroup
      colorScheme="green"
      value={searchOptions.majors}
      onChange={(values) => changeSearchOption("majors", values as string[])}
    >
      <Wrap spacing={1} mb={2}>
        {searchOptions.majors.map((major) => (
          <Tag key={major} size="sm" variant="outline" colorScheme="blue">
            <TagLabel>{major.split("<p>").pop()}</TagLabel>
            <TagCloseButton
              onClick={() =>
                changeSearchOption(
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
  );
}

export default memo(MajorCheckBoxList);
