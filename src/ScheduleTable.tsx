import { Box } from '@chakra-ui/react';
import { Schedule } from './types.ts';
import { useDndContext } from '@dnd-kit/core';
import { useCallback, useMemo } from 'react';
import React from 'react';
import TableSchedule from './table/TableSchedule.tsx';
import TableGrid from './table/TableGrid.tsx';
interface Props {
  tableId: string;
  schedules: Schedule[];
  onScheduleTimeClick?: (timeInfo: { day: string; time: number }) => void;
  onDeleteButtonClick?: (timeInfo: { day: string; time: number }) => void;
}

const ScheduleTable = React.memo(
  ({ tableId, schedules, onScheduleTimeClick, onDeleteButtonClick }: Props) => {
    const dndContext = useDndContext();
    const getColor = useCallback(
      (lectureId: string): string => {
        const lectures = [...new Set(schedules.map(({ lecture }) => lecture.id))];
        const colors = ['#fdd', '#ffd', '#dff', '#ddf', '#fdf', '#dfd'];
        return colors[lectures.indexOf(lectureId) % colors.length];
      },
      [schedules]
    );

    const activeTableId = useMemo(() => {
      const activeId = dndContext.active?.id;
      if (activeId) {
        return String(activeId).split(':')[0];
      }
      return null;
    }, [dndContext.active]);

    const handleTimeClick = useCallback(
      (day: string, time: number) => {
        onScheduleTimeClick?.({ day, time });
      },
      [onScheduleTimeClick]
    );

    return (
      <Box
        position="relative"
        outline={activeTableId === tableId ? '5px dashed' : undefined}
        outlineColor="blue.300"
      >
        <TableGrid onTimeClick={handleTimeClick} />
        <TableSchedule
          schedules={schedules}
          tableId={tableId}
          getColor={getColor}
          onDeleteButtonClick={onDeleteButtonClick}
        />
      </Box>
    );
  },
  (prevProps, nextProps) => {
    return prevProps.tableId === nextProps.tableId && prevProps.schedules === nextProps.schedules;
  }
);

export default ScheduleTable;
