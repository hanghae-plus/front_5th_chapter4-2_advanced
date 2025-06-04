import React, { useCallback } from "react";
import { FormControl, FormLabel, CheckboxGroup } from "@chakra-ui/react";
import { SelectedMajorTags } from "./SelectedMajorTags";
import { MajorList } from "./MajorList";

interface MajorSelectorProps {
  allMajors: string[];
  selectedMajors: string[];
  onMajorsChange: (majors: string[]) => void;
}

export const MajorSelector = React.memo(
  ({ allMajors, selectedMajors, onMajorsChange }: MajorSelectorProps) => {
    const handleMajorToggle = useCallback(
      (major: string) => {
        const isSelected = selectedMajors.includes(major);
        if (isSelected) {
          onMajorsChange(selectedMajors.filter((m) => m !== major));
        } else {
          onMajorsChange([...selectedMajors, major]);
        }
      },
      [selectedMajors, onMajorsChange]
    );

    return (
      <FormControl>
        <FormLabel>전공</FormLabel>
        <CheckboxGroup
          colorScheme="green"
          value={selectedMajors}
          onChange={onMajorsChange}
        >
          <SelectedMajorTags
            selectedMajors={selectedMajors}
            onMajorToggle={handleMajorToggle}
          />
          <MajorList
            allMajors={allMajors}
            selectedMajors={selectedMajors}
            onMajorToggle={handleMajorToggle}
          />
        </CheckboxGroup>
      </FormControl>
    );
  }
);
