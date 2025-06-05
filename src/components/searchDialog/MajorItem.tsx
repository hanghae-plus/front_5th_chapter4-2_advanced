import { Box, Checkbox } from "@chakra-ui/react";
import React from "react";

interface MajorItemProps {
  major: string;
  isSelected: boolean;
  onToggle: (major: string) => void;
}

export const MajorItem = React.memo(
  ({ major, isSelected, onToggle }: MajorItemProps) => {
    return (
      <Box key={major}>
        <Checkbox
          key={major}
          size="sm"
          value={major}
          isChecked={isSelected}
          onChange={() => onToggle(major)}
        >
          {major.replace(/<p>/gi, " ")}
        </Checkbox>
      </Box>
    );
  }
);
