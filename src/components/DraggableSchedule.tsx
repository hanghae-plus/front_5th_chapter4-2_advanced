import React, { useMemo } from "react";
import { Schedule } from "../types";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { CellSize, DAY_LABELS } from "../constants";
import { ScheduleContent } from "./ScheduleContent";
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

interface DraggableScheduleProps {
  id: string;
  data: Schedule;
  bg: string;
  onDeleteButtonClick: () => void;
}

export const DraggableSchedule = React.memo(
  ({ id, data, bg, onDeleteButtonClick }: DraggableScheduleProps) => {
    const { day, range, room, lecture } = data;
    const { attributes, setNodeRef, listeners, transform, isDragging } =
      useDraggable({ id });
    const leftIndex = DAY_LABELS.indexOf(day as (typeof DAY_LABELS)[number]);
    const topIndex = range[0] - 1;
    const size = range.length;

    const positionStyle = useMemo(
      () => ({
        position: "absolute" as const,
        left: `${120 + CellSize.WIDTH * leftIndex + 1}px`,
        top: `${40 + (topIndex * CellSize.HEIGHT + 1)}px`,
        width: CellSize.WIDTH - 1 + "px",
        height: CellSize.HEIGHT * size - 1 + "px",
        backgroundColor: bg,
        padding: "4px",
        boxSizing: "border-box" as const,
        cursor: "pointer",
        zIndex: isDragging ? 10 : 1,
      }),
      [leftIndex, topIndex, size, bg, isDragging]
    );

    const transformStyle = useMemo(
      () => CSS.Translate.toString(transform),
      [transform]
    );

    const content = useMemo(
      () => <ScheduleContent title={lecture.title} room={room} />,
      [lecture.title, room]
    );

    return (
      <Popover>
        <PopoverTrigger>
          <Box
            ref={setNodeRef}
            {...positionStyle}
            transform={transformStyle}
            {...listeners}
            {...attributes}
          >
            {content}
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
  },
  (prevProps, nextProps) => {
    if (prevProps.id !== nextProps.id) return false;

    const prevData = prevProps.data;
    const nextData = nextProps.data;

    return (
      prevProps.bg === nextProps.bg &&
      prevData.day === nextData.day &&
      prevData.room === nextData.room &&
      prevData.lecture.id === nextData.lecture.id &&
      prevData.lecture.title === nextData.lecture.title &&
      JSON.stringify(prevData.range) === JSON.stringify(nextData.range)
    );
  }
);
