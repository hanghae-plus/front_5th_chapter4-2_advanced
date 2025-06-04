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
import { CellSize, DAY_LABELS } from "./constants.ts";
import { Schedule } from "./types.ts";
import { useDndContext, useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { ComponentProps, useCallback } from "react";
import { memo } from "react";
import { ScheduleGrid } from "./components";

interface Props {
  tableId: string;
  schedules: Schedule[];
  // activeOutline: boolean;
  onScheduleTimeClick?: (timeInfo: { day: string; time: number }) => void;
  onDeleteButtonClick?: (timeInfo: { day: string; time: number }) => void;
}

const ScheduleTable = ({
  tableId,
  schedules,
  onScheduleTimeClick,
  onDeleteButtonClick,
}: Props) => {
  const getColor = (lectureId: string): string => {
    const lectures = [...new Set(schedules.map(({ lecture }) => lecture.id))];
    const colors = ["#fdd", "#ffd", "#dff", "#ddf", "#fdf", "#dfd"];
    return colors[lectures.indexOf(lectureId) % colors.length];
  };

  const dndContext = useDndContext();

  const getActiveTableId = () => {
    const activeId = dndContext.active?.id;
    if (activeId) {
      return String(activeId).split(":")[0];
    }
    return null;
  };

  const activeTableId = getActiveTableId();

  const onClickScheduleGrid = useCallback((day: string, time: number) => {
    onScheduleTimeClick?.({ day, time });
  }, []);

  return (
    <Box
      position="relative"
      outline={activeTableId === tableId ? "5px dashed" : undefined}
      outlineColor="blue.300"
    >
      <ScheduleGrid onScheduleTimeClick={onClickScheduleGrid} />

      {schedules.map((schedule, index) => (
        <DraggableSchedule
          key={`${schedule.lecture.title}-${index}`}
          id={`${tableId}:${index}`}
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
};

export default memo(ScheduleTable);
