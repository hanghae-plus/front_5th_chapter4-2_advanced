import { GridItem } from "@chakra-ui/react";
import { memo, useCallback } from "react";

interface DayLabelGridItemProps {
  day: string;
  timeIndex: number;
  onScheduleTimeClick?: (timeInfo: { day: string; time: number }) => void;
}

const DayLabelGridItem = memo(
  ({ day, timeIndex, onScheduleTimeClick }: DayLabelGridItemProps) => {
    const handleScheduleTimeClick = useCallback(
      (day: string, time: number) => {
        onScheduleTimeClick?.({ day, time });
      },
      [onScheduleTimeClick]
    );

    return (
      <GridItem
        borderWidth="1px 0 0 1px"
        borderColor="gray.300"
        bg={timeIndex > 17 ? "gray.100" : "white"}
        cursor="pointer"
        _hover={{ bg: "yellow.100" }}
        onClick={() => handleScheduleTimeClick(day, timeIndex + 1)}
      />
    );
  }
);

export default DayLabelGridItem;
