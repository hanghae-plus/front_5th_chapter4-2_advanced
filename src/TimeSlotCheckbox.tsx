// src/LectureRow.tsx
import React, { memo } from "react";
import { Box, Checkbox } from "@chakra-ui/react";

interface TimeSlotCheckboxProps {
  timeSlot: {
    id: number;
    label: string;
  };
}

const TimeSlotCheckbox: React.FC<TimeSlotCheckboxProps> = memo(
  ({ timeSlot: { id, label } }) => {
    return (
      <Box>
        <Checkbox id={`timeslot-${id}`} size="sm" value={id}>
          {id}교시({label})
        </Checkbox>
      </Box>
    );
  }
);

export default TimeSlotCheckbox;
