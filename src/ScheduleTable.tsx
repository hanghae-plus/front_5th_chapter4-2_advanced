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
import React, { ComponentProps, Fragment, useCallback, useMemo, memo } from "react";

interface ScheduleTableProps {
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

/**
 * TableOutlineWrapper 컴포넌트
 * 현재 활성화된 테이블에 외곽선을 표시하는 역할을 합니다.
 * useDndContext 훅을 사용하여 현재 드래그 앤 드롭 컨텍스트의 active 정보를 가져오고,
 * active 테이블의 ID와 비교하여 외곽선을 표시합니다.
 * React.memo를 사용해 tableId나 children이 변경될 때만 리렌더링합니다.
 */
const TableOutlineWrapper = memo(({ tableId, children }: { tableId: string; children: React.ReactNode }) => {
  const dndContext = useDndContext();
  const activeId = dndContext.active?.id;
  const activeTableId = activeId ? String(activeId).split(":")[0] : null;

  return (
    <Box
      position="relative"
      outline={activeTableId === tableId ? "5px dashed" : undefined}
      outlineColor="blue.300"
    >
      {children}
    </Box>
  );
});
TableOutlineWrapper.displayName = "TableOutlineWrapper";


/**
 * ScheduleTable 컴포넌트
 * - 강의 시간표를 표시하는 컴포넌트입니다.
 * - 각 시간대와 요일에 맞춰 강의 정보를 그리드 형태로 렌더링합니다.
 * - props (tableId, schedules 등)가 변경되지 않았을 때 불필요한 리렌더링을 방지하기 위해 React.memo로 감쌌습니다.
 * 
 * */ 
const ScheduleTable = memo(({ tableId, schedules, onScheduleTimeClick, onDeleteButtonClick }: ScheduleTableProps) => {
  const lecturesForColor = useMemo(() => {
    return [...new Set(schedules.map(({ lecture }) => lecture.id))];
  }, [schedules]);

  const getColor = useCallback(
    (lectureId: string): string => {
      const colors = ["#fdd", "#ffd", "#dff", "#ddf", "#fdf", "#dfd"];
      if (lecturesForColor.length === 0) return colors[0];
      const index = lecturesForColor.indexOf(lectureId);
      return colors[index % colors.length];
    },
    [lecturesForColor]
  );

  const handleScheduleTimeClick = useCallback(
    (day: string, time: number) => {
      onScheduleTimeClick?.({ day, time });
    },
    [onScheduleTimeClick]
  );

  const handleScheduleDelete = useCallback(
    (schedule: Schedule) => {
      onDeleteButtonClick?.({
        day: schedule.day,
        time: schedule.range[0],
      });
    },
    [onDeleteButtonClick]
  );

  return (
    <TableOutlineWrapper tableId={tableId}>
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
                onClick={() => handleScheduleTimeClick(day, timeIndex + 1)}
              />
            ))}
          </Fragment>
        ))}
      </Grid>

      {schedules.map((schedule, index) => (
        <DraggableSchedule
          key={`${schedule.lecture.title}-${index}`}
          id={`${tableId}:${index}`}
          data={schedule}
          bg={getColor(schedule.lecture.id)}
          requestDelete={handleScheduleDelete}
        />
      ))}
    </TableOutlineWrapper>
  );
});
ScheduleTable.displayName = "ScheduleTable";


interface DraggableScheduleProps extends ComponentProps<typeof Box> {
  id: string;
  data: Schedule;
  requestDelete: (schedule: Schedule) => void;
}

/**
 * DraggableSchedule 컴포넌트
 * - 드래그 가능한 강의 시간표 아이템을 렌더링합니다.
 * props가 변경되지 않았을 때 불필요한 리렌더링을 방지하기 위해 React.memo로 감쌌습니다.
 * ScheduleTable로부터 메모이제이션된 콜백 함수인 requestDelete prop을 받아, 강의를 삭제하는 기능을 제공합니다.
 * 
 * */ 
const DraggableSchedule = memo(({ id, data, bg, requestDelete, ...restOfBoxProps }: DraggableScheduleProps) => {
  const { day, range, room, lecture } = data;
  const { attributes, setNodeRef, listeners, transform, isDragging } = useDraggable({ id });
  const leftIndex = DAY_LABELS.indexOf(day as (typeof DAY_LABELS)[number]);
  const topIndex = range[0] - 1;
  const size = range.length;

  const style = {
    ...restOfBoxProps.style,
    position: "absolute" as const,
    left: `${120 + CellSize.WIDTH * leftIndex + 1}px`,
    top: `${40 + topIndex * CellSize.HEIGHT + 1}px`,
    width: `${CellSize.WIDTH - 1}px`,
    height: `${CellSize.HEIGHT * size - 1}px`,
    backgroundColor: bg,
    padding: "4px",
    boxSizing: "border-box" as const,
    cursor: isDragging ? "grabbing" : "grab",
    transform: CSS.Translate.toString(transform),
    zIndex: isDragging ? 100 : 1,
  };

  const handleDeleteClick = useCallback(() => {
    requestDelete(data);
  }, [requestDelete, data]);

  return (
    <Popover>
      <PopoverTrigger>
        <Box
          ref={setNodeRef}
          style={style}
          {...listeners}
          {...attributes}
          {...restOfBoxProps}
        >
          <Text fontSize="sm" fontWeight="bold">{lecture.title}</Text>
          <Text fontSize="xs">{room}</Text>
        </Box>
      </PopoverTrigger>
      <PopoverContent onClick={event => event.stopPropagation()}>
        <PopoverArrow />
        <PopoverCloseButton />
        <PopoverBody>
        <Text>강의를 삭제하시겠습니까?</Text>
          <Button colorScheme="red" size="xs" onClick={handleDeleteClick} >
            삭제
          </Button>
        </PopoverBody>
      </PopoverContent>
    </Popover>
  );
});
DraggableSchedule.displayName = "DraggableSchedule";

export default ScheduleTable;