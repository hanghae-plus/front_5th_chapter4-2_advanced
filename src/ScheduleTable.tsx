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
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import {
  ComponentProps,
  Fragment,
  memo,
  useMemo,
  useState,
  useCallback,
} from "react";
import { useScheduleTableContext } from "./ScheduleTableContext.tsx";

interface Props {
  tableId: string;
  activeOutline?: boolean;
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

const ScheduleTable = memo(
  ({
    tableId,
    activeOutline = false,
    onScheduleTimeClick,
    onDeleteButtonClick,
  }: Props) => {
    const { schedules } = useScheduleTableContext();

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

    const deleteButtonHandlers = useMemo(() => {
      return schedules.map(
        (schedule) => () =>
          onDeleteButtonClick?.({
            day: schedule.day,
            time: schedule.range[0],
          })
      );
    }, [onDeleteButtonClick, schedules]);

    return (
      <Box
        position="relative"
        outline={activeOutline ? "5px dashed" : undefined}
        outlineColor="blue.300"
      >
        <ScheduleTableGrid onScheduleTimeClick={onScheduleTimeClick} />

        {schedules.map((schedule, index) => (
          <DraggableSchedule
            key={`${schedule.lecture.title}-${index}`}
            id={`${tableId}:${index}`}
            data={schedule}
            bg={getColor(schedule.lecture.id)}
            onDeleteButtonClick={deleteButtonHandlers[index]}
          />
        ))}
      </Box>
    );
  }
);

interface TableHeaderProps {
  time: string;
  timeIndex: number;
}

const TableHeader = memo(({ time, timeIndex }: TableHeaderProps) => (
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
));

const ScheduleTableGrid = memo(
  ({
    onScheduleTimeClick,
  }: {
    onScheduleTimeClick?: (timeInfo: { day: string; time: number }) => void;
  }) => {
    const handleCellClick = useCallback(
      (day: string, timeIndex: number) => {
        onScheduleTimeClick?.({ day, time: timeIndex + 1 });
      },
      [onScheduleTimeClick]
    );

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
        {TIMES.map((time, timeIndex) => (
          <Fragment key={`시간-${timeIndex + 1}`}>
            <TableHeader time={time} timeIndex={timeIndex} />
            {DAY_LABELS.map((day) => (
              <GridItem
                key={`${day}-${timeIndex + 2}`}
                borderWidth="1px 0 0 1px"
                borderColor="gray.300"
                bg={timeIndex > 17 ? "gray.100" : "white"}
                cursor="pointer"
                _hover={{ bg: "yellow.100" }}
                onClick={() => handleCellClick(day, timeIndex)}
              />
            ))}
          </Fragment>
        ))}
      </Grid>
    );
  }
);

type DraggableScheduleProps = {
  id: string;
  data: Schedule;
  onDeleteButtonClick: () => void;
};

const DraggableSchedule = ({
  id,
  data,
  onDeleteButtonClick,
  ...props
}: DraggableScheduleProps & ComponentProps<typeof Box>) => {
  const { day, range, room, lecture } = data;
  const { attributes, setNodeRef, listeners, transform } = useDraggable({ id });
  const [enablePopover, setEnablePopover] = useState(false);

  const { leftIndex, topIndex, size } = useMemo(
    () => ({
      leftIndex: DAY_LABELS.indexOf(day as (typeof DAY_LABELS)[number]),
      topIndex: range[0] - 1,
      size: range.length,
    }),
    [day, range]
  );

  const handleMouseEnter = useCallback(() => setEnablePopover(true), []);
  const handleMouseLeave = useCallback(() => setEnablePopover(false), []);

  const child = useMemo(
    () => (
      <Box
        position="absolute"
        left={`${120 + CellSize.WIDTH * leftIndex + 1}px`}
        top={`${40 + (topIndex * CellSize.HEIGHT + 1)}px`}
        width={CellSize.WIDTH - 1 + "px"}
        height={CellSize.HEIGHT * size - 1 + "px"}
        p={1}
        boxSizing="border-box"
        cursor="pointer"
        ref={setNodeRef}
        transform={CSS.Translate.toString(transform)}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        {...listeners}
        {...attributes}
        {...props}
      >
        <Text fontSize="sm" fontWeight="bold">
          {lecture.title}
        </Text>
        <Text fontSize="xs">{room}</Text>
      </Box>
    ),
    [
      leftIndex,
      topIndex,
      size,
      transform,
      setNodeRef,
      listeners,
      attributes,
      props,
      handleMouseEnter,
      handleMouseLeave,
      lecture.title,
      room,
    ]
  );

  if (enablePopover) {
    return (
      <Popover>
        <PopoverTrigger>{child}</PopoverTrigger>
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

  return child;
};

export default ScheduleTable;
