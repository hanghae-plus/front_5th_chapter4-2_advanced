import { memo } from "react";
import { GridItem } from "@chakra-ui/react";

interface ScheduleCellProps {
  day: string;
  timeIndex: number;
  onScheduleTimeClick?: (timeInfo: { day: string; time: number }) => void;
}

const ScheduleCell = memo(
  ({ day, timeIndex, onScheduleTimeClick }: ScheduleCellProps) => {
    return (
      <GridItem
        key={`${day}-${timeIndex + 2}`}
        borderWidth="1px 0 0 1px"
        borderColor="gray.300"
        bg={timeIndex > 17 ? "gray.100" : "white"}
        cursor="pointer"
        _hover={{ bg: "yellow.100" }}
        onClick={() => onScheduleTimeClick?.({ day, time: timeIndex + 1 })}
      />
    );
  }
);

ScheduleCell.displayName = "ScheduleCell";

export default ScheduleCell;
