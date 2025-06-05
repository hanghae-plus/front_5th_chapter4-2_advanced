import { Box, Checkbox } from "@chakra-ui/react";
import React from "react";

interface TimeSlotProps {
  id: number;
  label: string;
  isSelected: boolean;
  onToggle: (id: number) => void;
}

export const TimeSlotItem = React.memo(
  ({ id, label, isSelected, onToggle }: TimeSlotProps) => {
    return (
      <Box key={id}>
        <Checkbox
          key={id}
          size="sm"
          value={id}
          isChecked={isSelected}
          onChange={() => onToggle(id)}
        >
          {id}교시({label})
        </Checkbox>
      </Box>
    );
  }
);
