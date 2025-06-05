import { Grid } from "@chakra-ui/react";
import React from "react";
import { DAY_LABELS, 분, CellSize } from "../../consts";
import { ScheduleTableHeader } from "./ScheduleTableHeader";
import { TimeRow } from "./TimeRow";
import { parseHnM } from "../../utils/utils";

const TIMES = [
  ...Array(18)
    .fill(0)
    .map((v, k) => v + k * 30 * 분)
    .map((v) => `${parseHnM(v)}~${parseHnM(v + 30 * 분)}`),

  ...Array(6)
    .fill(18 * 30 * 분)
    .map((v, k) => v + k * 55 * 분)
    .map((v) => `${parseHnM(v)}~${parseHnM(v + 50 * 분)}`),
] as const;

interface TableGridProps {
  onTimeClick: (day: string, time: number) => void;
}

export const TableGrid = React.memo(({ onTimeClick }: TableGridProps) => {
  return (
    <Grid
      templateColumns={`120px repeat(${DAY_LABELS.length}, ${CellSize.WIDTH}px)`}
      templateRows={`40px repeat(${TIMES.length}, ${CellSize.HEIGHT}px)`}
      bg="white"
      fontSize="sm"
      textAlign="center"
      outline="1px solid"
      outlineColor="gray.300"
    >
      <ScheduleTableHeader />

      {TIMES.map((time, timeIndex) => (
        <TimeRow
          key={`time-row-${timeIndex}`}
          timeIndex={timeIndex}
          time={time}
          onScheduleTimeClick={onTimeClick}
        />
      ))}
    </Grid>
  );
});
