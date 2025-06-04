import React from "react";
import { Wrap, Tag, TagLabel, TagCloseButton } from "@chakra-ui/react";

interface SelectedMajorTagsProps {
  selectedMajors: string[];
  onMajorToggle: (major: string) => void;
}

export const SelectedMajorTags = React.memo(
  ({ selectedMajors, onMajorToggle }: SelectedMajorTagsProps) => {
    return (
      <Wrap spacing={1} mb={2}>
        {selectedMajors.map((major) => (
          <Tag key={major} size="sm" variant="outline" colorScheme="blue">
            <TagLabel>{major.split("<p>").pop()}</TagLabel>
            <TagCloseButton onClick={() => onMajorToggle(major)} />
          </Tag>
        ))}
      </Wrap>
    );
  }
);
