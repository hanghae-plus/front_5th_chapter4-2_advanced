import React from "react";
import { Stack } from "@chakra-ui/react";
import { MajorItem } from "./MajorItem";

interface MajorListProps {
  allMajors: string[];
  selectedMajors: string[];
  onMajorToggle: (major: string) => void;
}

export const MajorList = React.memo(
  ({ allMajors, selectedMajors, onMajorToggle }: MajorListProps) => {
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
        {allMajors.map((major) => (
          <MajorItem
            key={major}
            major={major}
            isChecked={selectedMajors.includes(major)}
            onToggle={onMajorToggle}
          />
        ))}
      </Stack>
    );
  }
);
