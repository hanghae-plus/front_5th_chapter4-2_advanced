import { DAY_LABELS, CellSize, 분 } from '../constants';
import { Grid } from '@chakra-ui/react';
import TableHeader from './TableHeader';
import { parseHnM } from '../utils';
import TableRow from './TableRow';
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

interface Props {
  onTimeClick: (day: string, time: number) => void;
}

const TableGrid = ({ onTimeClick }: Props) => {
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
      <TableHeader />

      {TIMES.map((time, timeIndex) => (
        <TableRow
          key={`시간-${timeIndex + 1}`}
          time={time}
          timeIndex={timeIndex}
          onTimeClick={onTimeClick}
        />
      ))}
    </Grid>
  );
};

export default TableGrid;
