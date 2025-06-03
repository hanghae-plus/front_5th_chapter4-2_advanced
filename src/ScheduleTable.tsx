import { Box, Button, Flex, Grid, GridItem, Popover, PopoverArrow, PopoverBody, PopoverCloseButton, PopoverContent, PopoverTrigger, Text } from "@chakra-ui/react";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { ComponentProps, Fragment, memo, useMemo } from "react";
import { CellSize, DAY_LABELS, SCHEDULE_TIMES } from "./constants.ts";
import { useLocalScheduleContext } from "./ScheduleContext.tsx";
import { Schedule } from "./types.ts";
import { fill2 } from "./utils.ts";

// ScheduleTable 에 memo 사용, Props중 다른 table과 영향이 있는 isActive를 제외하고 나머진 Context API에서 useMemo로 하달해서 사용됨
const ScheduleTable = memo(({ isActive = false }: { isActive: boolean }) => {
  const { tableId, schedules, onScheduleTimeClick, onDeleteButtonClick } = useLocalScheduleContext();
  const colorMap = useMemo(() => {
    const lectures = [...new Set(schedules.map(({ lecture }) => lecture.id))];
    const colors = ["#fdd", "#ffd", "#dff", "#ddf", "#fdf", "#dfd"];
    return lectures.reduce((acc, id, idx) => {
      acc[id] = colors[idx % colors.length];
      return acc;
    }, {} as Record<string, string>);
  }, [schedules]);

  const schedulesItems = useMemo(() => {
    return schedules.map((schedule, index) => (
      <DraggableSchedule
        key={`${schedule.lecture.title}-${index}`}
        id={`${tableId}:${index}`}
        data={schedule}
        bg={colorMap[schedule.lecture.id]}
        onDeleteButtonClick={() => onDeleteButtonClick?.({ day: schedule.day, time: schedule.range[0] })}
      />
    ));
  }, [schedules, tableId, colorMap, onDeleteButtonClick]);

  return (
    <Box position="relative" outline={isActive ? "5px dashed" : undefined} outlineColor="blue.300">
      <ScheduleTableGrid onScheduleTimeClick={onScheduleTimeClick} />
      {schedulesItems}
    </Box>
  );
});

// ScheduleTableGrid memo 사용
type ScheduleTableGridProps = { onScheduleTimeClick: ((timeInfo: { day: string; time: number }) => void) | undefined };
const ScheduleTableGrid = memo(({ onScheduleTimeClick }: ScheduleTableGridProps) => {
  return (
    <Grid
      templateColumns={`120px repeat(${DAY_LABELS.length}, ${CellSize.WIDTH}px)`}
      templateRows={`40px repeat(${SCHEDULE_TIMES.length}, ${CellSize.HEIGHT}px)`}
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
      {SCHEDULE_TIMES.map((time, timeIndex) => (
        <Fragment key={`시간-${timeIndex + 1}`}>
          <GridItem borderTop="1px solid" borderColor="gray.300" bg={timeIndex > 17 ? "gray.200" : "gray.100"}>
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
              onClick={() => onScheduleTimeClick?.({ day, time: timeIndex + 1 })}
            />
          ))}
        </Fragment>
      ))}
    </Grid>
  );
});

// DraggableSchedule memo 사용
type DraggableScheduleProps = { id: string; data: Schedule } & ComponentProps<typeof Box> & {
    onDeleteButtonClick: () => void;
  };
const DraggableSchedule = memo(({ id, data, bg, onDeleteButtonClick }: DraggableScheduleProps) => {
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
});

export default ScheduleTable;
