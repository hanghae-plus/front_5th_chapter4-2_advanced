import React from "react";
import { Stack } from "@chakra-ui/react";
import { MajorItem } from "./MajorItem";

interface MajorCheckboxListProps {
  majors: string[];
  selectedMajors: string[];
  onToggle: (major: string) => void;
}

export const MajorCheckboxList = React.memo(
  ({ majors, selectedMajors, onToggle }: MajorCheckboxListProps) => {
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
          <MajorItem
            key={major}
            major={major}
            isSelected={selectedMajors.includes(major)}
            onToggle={onToggle}
          />
        ))}
      </Stack>
    );
  }
);
