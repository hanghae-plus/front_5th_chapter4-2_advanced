import React, { ComponentProps, memo } from 'react';
import { Schedule } from '../types';
import {
  Box,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverArrow,
  PopoverCloseButton,
  PopoverBody,
  Button,
  Text,
} from '@chakra-ui/react';
import { useDraggable } from '@dnd-kit/core';
import { DAY_LABELS, CellSize } from '../constants';
import { CSS } from '@dnd-kit/utilities';

interface Props {
  schedules: Schedule[];
  tableId: string;
  getColor: (lectureId: string) => string;
  onDeleteButtonClick?: (timeInfo: { day: string; time: number }) => void;
}
const TableSchedule = memo(({ schedules, tableId, getColor, onDeleteButtonClick }: Props) => {
  return (
    <>
      {schedules.map((schedule) => (
        <DraggableSchedule
          key={`${schedule.lecture.id}-${schedule.day}-${schedule.range.join(',')}`}
          id={`${tableId}:${schedule.lecture.id}:${schedule.day}:${schedule.range.join(',')}`}
          data={schedule}
          bg={getColor(schedule.lecture.id)}
          onDeleteButtonClick={() =>
            onDeleteButtonClick?.({
              day: schedule.day,
              time: schedule.range[0],
            })
          }
        />
      ))}
    </>
  );
});

export const DraggableSchedule = React.memo(
  ({
    id,
    data,
    bg,
    onDeleteButtonClick,
  }: { id: string; data: Schedule } & ComponentProps<typeof Box> & {
      onDeleteButtonClick: () => void;
    }) => {
    const { day, range, room, lecture } = data;
    const { attributes, setNodeRef, listeners, transform } = useDraggable({ id });
    const leftIndex = DAY_LABELS.indexOf(day as (typeof DAY_LABELS)[number]);
    const topIndex = range[0] - 1;
    const size = range.length;

    return (
      <Popover>
        <PopoverTrigger>
          <Box
            position="absolute"
            left={`${120 + CellSize.WIDTH * leftIndex + 1}px`}
            top={`${40 + (topIndex * CellSize.HEIGHT + 1)}px`}
            width={CellSize.WIDTH - 1 + 'px'}
            height={CellSize.HEIGHT * size - 1 + 'px'}
            bg={bg}
            p={1}
            boxSizing="border-box"
            cursor="pointer"
            ref={setNodeRef}
            transform={CSS.Translate.toString(transform)}
            {...listeners}
            {...attributes}
          >
            <Text fontSize="sm" fontWeight="bold">
              {lecture.title}
            </Text>
            <Text fontSize="xs">{room}</Text>
          </Box>
        </PopoverTrigger>
        <PopoverContent onClick={(event) => event.stopPropagation()}>
          <PopoverArrow />
          <PopoverCloseButton />
          <PopoverBody>
            <Text>강의를 삭제하시겠습니까?</Text>
            <Button colorScheme="red" size="xs" onClick={onDeleteButtonClick}>
              삭제
            </Button>
          </PopoverBody>
        </PopoverContent>
      </Popover>
    );
  }
);

export default TableSchedule;
