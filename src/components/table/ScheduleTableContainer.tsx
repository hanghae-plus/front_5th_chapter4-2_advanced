import React, { memo } from "react";
import { Box } from "@chakra-ui/react";
import { DAY_LABELS, TIMES } from "@/constants/constants.ts";
import ScheduleGrid from "./ScheduleGrid";

interface ScheduleTableContainerProps {
  tableId: string;
  isActive: boolean;
  children: React.ReactNode;
  onScheduleTimeClick?: (timeInfo: { day: string; time: number }) => void;
}

const ScheduleTableContainer = memo(
  ({
    isActive,
    children,
    onScheduleTimeClick,
  }: ScheduleTableContainerProps) => {
    return (
      <Box
        position="relative"
        outline={isActive ? "5px dashed" : undefined}
        outlineColor="blue.300"
      >
        <ScheduleGrid
          days={DAY_LABELS}
          times={TIMES}
          onScheduleTimeClick={onScheduleTimeClick}
        />
        {children}
      </Box>
    );
  }
);

ScheduleTableContainer.displayName = "ScheduleTableContainer";

export default ScheduleTableContainer;
