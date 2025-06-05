import React from "react";
import {
  FormControl,
  FormLabel,
  Wrap,
  Tag,
  TagLabel,
  TagCloseButton,
} from "@chakra-ui/react";
import { MajorCheckboxList } from "./MajorCheckboxList";

interface MajorFilterSectionProps {
  majors: string[];
  selectedMajors: string[];
  onToggle: (major: string) => void;
}

export const MajorFilterSection = React.memo(
  ({ majors, selectedMajors, onToggle }: MajorFilterSectionProps) => {
    return (
      <FormControl>
        <FormLabel>전공</FormLabel>

        <Wrap spacing={1} mb={2}>
          {selectedMajors.map((major) => (
            <Tag key={major} size="sm" variant="outline" colorScheme="blue">
              <TagLabel>{major.split("<p>").pop()}</TagLabel>
              <TagCloseButton onClick={() => onToggle(major)} />
            </Tag>
          ))}
        </Wrap>

        <MajorCheckboxList
          majors={majors}
          selectedMajors={selectedMajors}
          onToggle={onToggle}
        />
      </FormControl>
    );
  }
);
