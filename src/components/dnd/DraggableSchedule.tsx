import { memo, useCallback, useMemo } from "react";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
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
import { ComponentProps } from "react";
import { Schedule } from "../../types";
import { CellSize, DAY_LABELS } from "../../data/constants";

interface DraggableScheduleProps {
  id: string;
  data: Schedule;
  bg?: string;
  onDeleteButtonClick?: (timeInfo: { day: string; time: number }) => void;
  scheduleDay: string;
  scheduleTime: number;
}

const DraggableSchedule = memo(
  ({
    id,
    data,
    bg,
    onDeleteButtonClick,
    scheduleDay,
    scheduleTime,
    ...boxProps
  }: DraggableScheduleProps & ComponentProps<typeof Box>) => {
    const { day, range, room, lecture } = data;
    const { attributes, setNodeRef, listeners, transform } = useDraggable({ id });

    // 메모이제이션된 계산
    const leftIndex = useMemo(() => DAY_LABELS.indexOf(day as (typeof DAY_LABELS)[number]), [day]);
    const topIndex = useMemo(() => range[0] - 1, [range]);
    const size = useMemo(() => range.length, [range]);

    // 메모이제이션된 스타일 계산
    const position = useMemo(
      () => ({
        left: `${120 + CellSize.WIDTH * leftIndex + 1}px`,
        top: `${40 + (topIndex * CellSize.HEIGHT + 1)}px`,
        width: CellSize.WIDTH - 1 + "px",
        height: CellSize.HEIGHT * size - 1 + "px",
      }),
      [leftIndex, topIndex, size]
    );

    const handleDeleteClick = useCallback(
      (event: React.MouseEvent) => {
        event.stopPropagation();
        onDeleteButtonClick?.({ day: scheduleDay, time: scheduleTime });
      },
      [onDeleteButtonClick, scheduleDay, scheduleTime]
    );

    return (
      <Popover>
        <PopoverTrigger>
          <Box
            position="absolute"
            left={position.left}
            top={position.top}
            width={position.width}
            height={position.height}
            bg={bg}
            p={1}
            boxSizing="border-box"
            cursor="pointer"
            ref={setNodeRef}
            transform={CSS.Translate.toString(transform)}
            {...listeners}
            {...attributes}
            {...boxProps}
          >
            <Text fontSize="sm" fontWeight="bold">
              {lecture.title}
            </Text>
            <Text fontSize="xs">{room}</Text>
          </Box>
        </PopoverTrigger>
        <PopoverContent onClick={event => event.stopPropagation()}>
          <PopoverArrow />
          <PopoverCloseButton />
          <PopoverBody>
            <Text>강의를 삭제하시겠습니까?</Text>
            <Button colorScheme="red" size="xs" onClick={handleDeleteClick}>
              삭제
            </Button>
          </PopoverBody>
        </PopoverContent>
      </Popover>
    );
  },
  (prevProps, nextProps) => {
    // data가 실제로 변경되었는지 확인 (성능 최적화)
    return (
      prevProps.id === nextProps.id &&
      prevProps.bg === nextProps.bg &&
      prevProps.data.day === nextProps.data.day &&
      prevProps.data.range.length === nextProps.data.range.length &&
      prevProps.data.range.every((time, index) => time === nextProps.data.range[index]) &&
      prevProps.data.room === nextProps.data.room &&
      prevProps.data.lecture.title === nextProps.data.lecture.title &&
      prevProps.onDeleteButtonClick === nextProps.onDeleteButtonClick &&
      prevProps.scheduleDay === nextProps.scheduleDay &&
      prevProps.scheduleTime === nextProps.scheduleTime
    );
  }
);

DraggableSchedule.displayName = "DraggableSchedule";

export default DraggableSchedule;
