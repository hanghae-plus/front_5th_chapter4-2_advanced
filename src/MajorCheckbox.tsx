// src/LectureRow.tsx
import React, { memo } from "react";
import { Box, Checkbox } from "@chakra-ui/react";

interface MajorCheckboxProps {
  major: string;
}

const MajorCheckbox: React.FC<MajorCheckboxProps> = memo(({ major }) => {
  const safeId = major.replace(/[<>"/\s]/g, "").toLowerCase();

  return (
    <Box>
      <Checkbox id={`major-${safeId}`} size="sm" value={major}>
        {major.replace(/<p>/gi, " ")}
      </Checkbox>
    </Box>
  );
});

export default MajorCheckbox;
