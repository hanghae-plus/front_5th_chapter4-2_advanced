import React from "react";
import { Box, Checkbox, Stack } from "@chakra-ui/react";

interface MajorCheckboxListProps {
  majors: string[];
  selectedMajors: string[];
  onChange: (values: string[]) => void;
}

export const MajorCheckboxList = React.memo(
  ({ majors, selectedMajors, onChange }: MajorCheckboxListProps) => {
    return (
      <Stack
        spacing={2}
        overflowY="auto"
        h="100px"
        border="1px solid"
        borderColor="gray.200"
        borderRadius={5}
        p={2}
      >
        {majors.map((major) => (
          <Box key={major}>
            <Checkbox
              size="sm"
              value={major}
              isChecked={selectedMajors.includes(major)}
              onChange={(e) => {
                if (e.target.checked) {
                  onChange([...selectedMajors, major]);
                } else {
                  onChange(selectedMajors.filter((v) => v !== major));
                }
              }}
            >
              {major.replace(/<p>/gi, " ")}
            </Checkbox>
          </Box>
        ))}
      </Stack>
    );
  }
);
