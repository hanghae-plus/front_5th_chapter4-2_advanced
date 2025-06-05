import { memo } from "react";
import {
  Box,
  Button,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverCloseButton,
  PopoverContent,
  PopoverTrigger,
  Text,
} from "@chakra-ui/react";
import ScheduleTableGrid from "./ScheduleTableGrid";
import { CellSize, DAY_LABELS } from "@/constants.ts";
import { Schedule } from "@/types.ts";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { ComponentProps } from "react";

interface ScheduleTableBodyProps {
  tableId: string;
  schedules: Schedule[];
  isActive: boolean;
  onScheduleTimeClick?: (
    tableId: string,
    timeInfo: { day: string; time: number },
  ) => void;
  onDeleteButtonClick?: (
    tableId: string,
    timeInfo: { day: string; time: number },
  ) => void;
}

const ScheduleTableBody = ({
  tableId,
  schedules,
  isActive,
  onScheduleTimeClick,
  onDeleteButtonClick,
}: ScheduleTableBodyProps) => {
  const getColor = (lectureId: string): string => {
    const lectures = [...new Set(schedules.map(({ lecture }) => lecture.id))];
    const colors = ["#fdd", "#ffd", "#dff", "#ddf", "#fdf", "#dfd"];
    return colors[lectures.indexOf(lectureId) % colors.length];
  };

  return (
    <Box
      position="relative"
      outline={isActive ? "5px dashed" : undefined}
      outlineColor="blue.300">
      <ScheduleTableGrid
        tableId={tableId}
        onScheduleTimeClick={onScheduleTimeClick}
      />
      {schedules.map((schedule, index) => (
        <DraggableSchedule
          key={`${schedule.lecture.title}-${index}`}
          id={`${tableId}:${index}`}
          data={schedule}
          bg={getColor(schedule.lecture.id)}
          onDeleteButtonClick={() =>
            onDeleteButtonClick?.(tableId, {
              day: schedule.day,
              time: schedule.range[0],
            })
          }
        />
      ))}
    </Box>
  );
};

const DraggableSchedule = ({
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
          width={CellSize.WIDTH - 1 + "px"}
          height={CellSize.HEIGHT * size - 1 + "px"}
          bg={bg}
          p={1}
          boxSizing="border-box"
          cursor="pointer"
          ref={setNodeRef}
          transform={CSS.Translate.toString(transform)}
          {...listeners}
          {...attributes}>
          <Text
            fontSize="sm"
            fontWeight="bold">
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
          <Button
            colorScheme="red"
            size="xs"
            onClick={onDeleteButtonClick}>
            삭제
          </Button>
        </PopoverBody>
      </PopoverContent>
    </Popover>
  );
};

export default memo(ScheduleTableBody);
