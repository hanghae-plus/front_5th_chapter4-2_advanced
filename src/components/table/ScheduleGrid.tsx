import { memo } from "react";
import { Grid } from "@chakra-ui/react";
import { CellSize } from "@/constants/constants.ts";
import ScheduleTableHeaderRow from "./ScheduleTableHeaderRow";
import ScheduleTableRow from "./ScheduleTableRow";

interface ScheduleGridProps {
  days: readonly string[];
  times: readonly string[];
  onScheduleTimeClick?: (timeInfo: { day: string; time: number }) => void;
}

const ScheduleGrid = memo(
  ({ days, times, onScheduleTimeClick }: ScheduleGridProps) => {
    return (
      <Grid
        templateColumns={`120px repeat(${days.length}, ${CellSize.WIDTH}px)`}
        templateRows={`40px repeat(${times.length}, ${CellSize.HEIGHT}px)`}
        bg="white"
        fontSize="sm"
        textAlign="center"
        outline="1px solid"
        outlineColor="gray.300"
      >
        <ScheduleTableHeaderRow days={days} />
        {times.map((time, timeIndex) => (
          <ScheduleTableRow
            key={`시간-${timeIndex + 1}`}
            timeIndex={timeIndex}
            time={time}
            days={days}
            onScheduleTimeClick={onScheduleTimeClick}
          />
        ))}
      </Grid>
    );
  }
);

ScheduleGrid.displayName = "ScheduleGrid";

export default ScheduleGrid;
