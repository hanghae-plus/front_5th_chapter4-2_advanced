// ScheduleTable.tsx
import {
  Box,
  Button,
  Flex,
  Grid,
  GridItem,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverCloseButton,
  PopoverContent,
  PopoverTrigger,
  Text,
} from "@chakra-ui/react";
import { CellSize, DAY_LABELS, 분 } from "./constants.ts";
import { Schedule } from "./types.ts";
import { fill2, parseHnM } from "./utils.ts";
import { useDndContext, useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { ComponentProps, Fragment, memo, useCallback, useMemo } from "react";

interface Props {
  tableId: string;
  schedules: Schedule[];
  onScheduleTimeClick?: (timeInfo: { day: string; time: number }) => void;
  onDeleteButtonClick?: (timeInfo: { day: string; time: number }) => void;
}

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

const ScheduleContent = memo(
  ({ title, room }: { title: string; room?: string }) => {
    console.log(`ScheduleContent ${title} 렌더링`, performance.now());
    return (
      <>
        <Text fontSize="sm" fontWeight="bold">
          {title}
        </Text>
        <Text fontSize="xs">{room}</Text>
      </>
    );
  }
);

const ScheduleTableHeader = memo(() => {
  return (
    <>
      <GridItem key="교시" borderColor="gray.300" bg="gray.100">
        <Flex justifyContent="center" alignItems="center" h="full" w="full">
          <Text fontWeight="bold">교시</Text>
        </Flex>
      </GridItem>
      {DAY_LABELS.map((day) => (
        <GridItem
          key={day}
          borderLeft="1px"
          borderColor="gray.300"
          bg="gray.100"
        >
          <Flex justifyContent="center" alignItems="center" h="full">
            <Text fontWeight="bold">{day}</Text>
          </Flex>
        </GridItem>
      ))}
    </>
  );
});

interface TimeRowProps {
  timeIndex: number;
  time: string;
  onScheduleTimeClick?: (day: string, time: number) => void;
}
interface TimeRowProps {
  timeIndex: number;
  time: string;
  onScheduleTimeClick?: (day: string, time: number) => void;
}

const TimeRow = memo(
  ({ timeIndex, time, onScheduleTimeClick }: TimeRowProps) => {
    return (
      <Fragment key={`시간-${timeIndex + 1}`}>
        <GridItem
          borderTop="1px solid"
          borderColor="gray.300"
          bg={timeIndex > 17 ? "gray.200" : "gray.100"}
        >
          <Flex justifyContent="center" alignItems="center" h="full">
            <Text fontSize="xs">
              {fill2(timeIndex + 1)} ({time})
            </Text>
          </Flex>
        </GridItem>
        {DAY_LABELS.map((day) => (
          <GridItem
            key={`${day}-${timeIndex + 2}`}
            borderWidth="1px 0 0 1px"
            borderColor="gray.300"
            bg={timeIndex > 17 ? "gray.100" : "white"}
            cursor="pointer"
            _hover={{ bg: "yellow.100" }}
            onClick={() => onScheduleTimeClick?.(day, timeIndex + 1)}
          />
        ))}
      </Fragment>
    );
  }
);

interface DraggableScheduleProps {
  id: string;
  data: Schedule;
  bg: string;
  onDeleteButtonClick: () => void;
}

const DraggableSchedule = memo(
  ({
    id,
    data,
    bg,
    onDeleteButtonClick,
  }: DraggableScheduleProps & ComponentProps<typeof Box>) => {
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

const TableGrid = memo(
  ({ onTimeClick }: { onTimeClick: (day: string, time: number) => void }) => {
    console.log("TableGrid 렌더링", performance.now());

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
  }
);

const TableContainer = memo(
  ({
    isActive,
    children,
  }: {
    tableId: string;
    isActive: boolean;
    children: React.ReactNode;
  }) => {
    return (
      <Box
        position="relative"
        outline={isActive ? "5px dashed" : undefined}
        outlineColor="blue.300"
      >
        {children}
      </Box>
    );
  }
);

const ScheduleTable = memo(
  ({ tableId, schedules, onScheduleTimeClick, onDeleteButtonClick }: Props) => {
    const dndContext = useDndContext();

    const getColor = useCallback(
      (lectureId: string): string => {
        const lectures = [
          ...new Set(schedules.map(({ lecture }) => lecture.id)),
        ];
        const colors = ["#fdd", "#ffd", "#dff", "#ddf", "#fdf", "#dfd"];
        return colors[lectures.indexOf(lectureId) % colors.length];
      },
      [schedules]
    );

    const activeTableId = useMemo(() => {
      const activeId = dndContext.active?.id;
      if (activeId) {
        return String(activeId).split(":")[0];
      }
      return null;
    }, [dndContext.active?.id]);

    const handleTimeClick = useCallback(
      (day: string, time: number) => {
        onScheduleTimeClick?.({ day, time });
      },
      [onScheduleTimeClick]
    );

    const scheduleComponents = useMemo(() => {
      return schedules.map((schedule, index) => (
        <DraggableSchedule
          key={`${schedule.lecture.id}-${index}`}
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
      ));
    }, [schedules, tableId, getColor, onDeleteButtonClick]);

    return (
      <TableContainer tableId={tableId} isActive={activeTableId === tableId}>
        <TableGrid onTimeClick={handleTimeClick} />
        {scheduleComponents}
      </TableContainer>
    );
  }
);

export default ScheduleTable;
