import React from "react";
import { Box, Checkbox } from "@chakra-ui/react";

interface MajorItemProps {
  major: string;
  isChecked: boolean;
  onToggle: (major: string) => void;
}

export const MajorItem = React.memo(
  ({ major, isChecked, onToggle }: MajorItemProps) => {
    return (
      <Box>
        <Checkbox
          size="sm"
          value={major}
          isChecked={isChecked}
          onChange={() => onToggle(major)}
        >
          {major.replace(/<p>/gi, " ")}
        </Checkbox>
      </Box>
    );
  }
);
