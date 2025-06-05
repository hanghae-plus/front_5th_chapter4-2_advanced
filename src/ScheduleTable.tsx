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
  onScheduleTimeClick?: (timeInfo: { day: string, time: number }) => void;
  onDeleteButtonClick?: (timeInfo: { day: string, time: number }) => void;
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

const COLORS = ["#fdd", "#ffd", "#dff", "#ddf", "#fdf", "#dfd"];

// 테이블 그리드 컴포넌트 분리
const TableGrid = memo(({ onTimeClick }: { onTimeClick: (day: string, time: number) => void }) => (
  <Grid
    templateColumns={`120px repeat(${DAY_LABELS.length}, ${CellSize.WIDTH}px)`}
    templateRows={`40px repeat(${TIMES.length}, ${CellSize.HEIGHT}px)`}
    bg="white"
    fontSize="sm"
    textAlign="center"
    outline="1px solid"
    outlineColor="gray.300"
  >
    <GridItem key="교시" borderColor="gray.300" bg="gray.100">
      <Flex justifyContent="center" alignItems="center" h="full" w="full">
        <Text fontWeight="bold">교시</Text>
      </Flex>
    </GridItem>
    {DAY_LABELS.map((day) => (
      <GridItem key={day} borderLeft="1px" borderColor="gray.300" bg="gray.100">
        <Flex justifyContent="center" alignItems="center" h="full">
          <Text fontWeight="bold">{day}</Text>
        </Flex>
      </GridItem>
    ))}
    {TIMES.map((time, timeIndex) => (
      <Fragment key={`시간-${timeIndex + 1}`}>
        <GridItem
          borderTop="1px solid"
          borderColor="gray.300"
          bg={timeIndex > 17 ? 'gray.200' : 'gray.100'}
        >
          <Flex justifyContent="center" alignItems="center" h="full">
            <Text fontSize="xs">{fill2(timeIndex + 1)} ({time})</Text>
          </Flex>
        </GridItem>
        {DAY_LABELS.map((day) => (
          <GridItem
            key={`${day}-${timeIndex + 2}`}
            borderWidth="1px 0 0 1px"
            borderColor="gray.300"
            bg={timeIndex > 17 ? 'gray.100' : 'white'}
            cursor="pointer"
            _hover={{ bg: 'yellow.100' }}
            onClick={() => onTimeClick(day, timeIndex + 1)}
          />
        ))}
      </Fragment>
    ))}
  </Grid>
));

TableGrid.displayName = 'TableGrid';

// 드래그 가능한 스케줄 컴포넌트
const DraggableSchedule = memo(({
  id,
  data,
  bg,
  onDeleteButtonClick
}: { id: string; data: Schedule } & ComponentProps<typeof Box> & {
  onDeleteButtonClick: () => void
}) => {
  const { day, range, room, lecture } = data;
  const { attributes, setNodeRef, listeners, transform } = useDraggable({ id });
  
  const position = useMemo(() => {
    const leftIndex = DAY_LABELS.indexOf(day as typeof DAY_LABELS[number]);
    const topIndex = range[0] - 1;
    const size = range.length;

    return {
      left: `${120 + (CellSize.WIDTH * leftIndex) + 1}px`,
      top: `${40 + (topIndex * CellSize.HEIGHT + 1)}px`,
      width: (CellSize.WIDTH - 1) + "px",
      height: (CellSize.HEIGHT * size - 1) + "px",
    };
  }, [day, range]);

  const style = useMemo(() => ({
    position: 'absolute' as const,
    ...position,
    transform: CSS.Translate.toString(transform),
  }), [position, transform]);

  return (
    <Popover>
      <PopoverTrigger>
        <Box
          ref={setNodeRef}
          {...style}
          bg={bg}
          p={1}
          boxSizing="border-box"
          cursor="pointer"
          {...listeners}
          {...attributes}
        >
          <Text fontSize="sm" fontWeight="bold">{lecture.title}</Text>
          <Text fontSize="xs">{room}</Text>
        </Box>
      </PopoverTrigger>
      <PopoverContent onClick={event => event.stopPropagation()}>
        <PopoverArrow/>
        <PopoverCloseButton/>
        <PopoverBody>
          <Text>강의를 삭제하시겠습니까?</Text>
          <Button colorScheme="red" size="xs" onClick={onDeleteButtonClick}>
            삭제
          </Button>
        </PopoverBody>
      </PopoverContent>
    </Popover>
  );
});

DraggableSchedule.displayName = 'DraggableSchedule';

const ScheduleTable = memo(({ tableId, schedules, onScheduleTimeClick, onDeleteButtonClick }: Props) => {
  const dndContext = useDndContext();

  const getColor = useCallback((lectureId: string): string => {
    const lectures = [...new Set(schedules.map(({ lecture }) => lecture.id))];
    return COLORS[lectures.indexOf(lectureId) % COLORS.length];
  }, [schedules]);

  const activeTableId = useMemo(() => {
    const activeId = dndContext.active?.id;
    if (activeId) {
      return String(activeId).split(":")[0];
    }
    return null;
  }, [dndContext.active?.id]);

  const handleTimeClick = useCallback((day: string, time: number) => {
    onScheduleTimeClick?.({ day, time });
  }, [onScheduleTimeClick]);

  const handleDeleteClick = useCallback((day: string, time: number) => {
    onDeleteButtonClick?.({ day, time });
  }, [onDeleteButtonClick]);

  return (
    <Box
      position="relative"
      outline={activeTableId === tableId ? "5px dashed" : undefined}
      outlineColor="blue.300"
    >
      <TableGrid onTimeClick={handleTimeClick} />

      {schedules.map((schedule, index) => (
        <DraggableSchedule
          key={`${schedule.lecture.title}-${index}`}
          id={`${tableId}:${index}`}
          data={schedule}
          bg={getColor(schedule.lecture.id)}
          onDeleteButtonClick={() => handleDeleteClick(schedule.day, schedule.range[0])}
        />
      ))}
    </Box>
  );
});

ScheduleTable.displayName = 'ScheduleTable';

export default ScheduleTable;
