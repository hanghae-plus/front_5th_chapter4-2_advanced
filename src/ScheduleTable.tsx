import {
  Box,
  Flex,
  Grid,
  GridItem,
  Text,
  GridItemProps,
} from "@chakra-ui/react";
import { CellSize, DAY_LABELS, 분 } from "./constants.ts";
import { Schedule } from "./types.ts";
import { fill2, parseHnM } from "./utils.ts";
import { useDndContext, useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { Fragment, useCallback, useMemo } from "react";
import React from "react";
import { useDialog } from "./DialogContext.tsx";

interface Props {
  tableId: string;
  schedules: Schedule[];
  onScheduleTimeClick?: (timeInfo: { day: string; time: number }) => void;
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

const GRID_TEMPLATE_COLUMNS = `120px repeat(${DAY_LABELS.length}, ${CellSize.WIDTH}px)`;
const GRID_TEMPLATE_ROWS = `40px repeat(${TIMES.length}, ${CellSize.HEIGHT}px)`;

const HeaderCell = React.memo(
  ({
    children,
    ...props
  }: GridItemProps & {
    children: React.ReactNode;
  }) => (
    <GridItem
      borderColor="gray.300"
      bg="gray.100"
      {...props}
    >
      <Flex
        justifyContent="center"
        alignItems="center"
        h="full"
        w="full"
      >
        <Text fontWeight="bold">{children}</Text>
      </Flex>
    </GridItem>
  ),
);

const DayHeaderCell = React.memo(({ day }: { day: string }) => (
  <GridItem
    borderLeft="1px"
    borderColor="gray.300"
    bg="gray.100"
  >
    <Flex
      justifyContent="center"
      alignItems="center"
      h="full"
    >
      <Text fontWeight="bold">{day}</Text>
    </Flex>
  </GridItem>
));

const TimeCell = React.memo(
  ({ timeIndex, time }: { timeIndex: number; time: string }) => (
    <GridItem
      borderTop="1px solid"
      borderColor="gray.300"
      bg={timeIndex > 17 ? "gray.200" : "gray.100"}
    >
      <Flex
        justifyContent="center"
        alignItems="center"
        h="full"
      >
        <Text fontSize="xs">
          {fill2(timeIndex + 1)} ({time})
        </Text>
      </Flex>
    </GridItem>
  ),
);

const EmptyCell = React.memo(
  ({
    day,
    timeIndex,
    onScheduleTimeClick,
  }: {
    day: string;
    timeIndex: number;
    onScheduleTimeClick?: (info: { day: string; time: number }) => void;
  }) => (
    <GridItem
      borderWidth="1px 0 0 1px"
      borderColor="gray.300"
      bg={timeIndex > 17 ? "gray.100" : "white"}
      cursor="pointer"
      _hover={{ bg: "yellow.100" }}
      onClick={() => onScheduleTimeClick?.({ day, time: timeIndex + 1 })}
    />
  ),
);

const TableOutline = React.memo(
  ({ tableId, children }: { tableId: string; children: React.ReactNode }) => {
    const dndContext = useDndContext();

    const isCurrentTableActive = useMemo(() => {
      const activeId = dndContext.active?.id;
      if (!activeId) return false;
      return String(activeId).startsWith(`${tableId}:`);
    }, [dndContext.active?.id, tableId]);

    return (
      <Box
        position="relative"
        outline={isCurrentTableActive ? "5px dashed" : undefined}
        outlineColor="blue.300"
      >
        {children}
      </Box>
    );
  },
);

const StaticGrid = React.memo(
  ({
    onScheduleTimeClick,
  }: {
    onScheduleTimeClick?: (info: { day: string; time: number }) => void;
  }) => (
    <Grid
      templateColumns={GRID_TEMPLATE_COLUMNS}
      templateRows={GRID_TEMPLATE_ROWS}
      bg="white"
      fontSize="sm"
      textAlign="center"
      outline="1px solid"
      outlineColor="gray.300"
    >
      <HeaderCell>교시</HeaderCell>
      {DAY_LABELS.map((day) => (
        <DayHeaderCell
          key={day}
          day={day}
        />
      ))}
      {TIMES.map((time, timeIndex) => (
        <Fragment key={`시간-${timeIndex + 1}`}>
          <TimeCell
            timeIndex={timeIndex}
            time={time}
          />
          {DAY_LABELS.map((day) => (
            <EmptyCell
              key={`${day}-${timeIndex + 2}`}
              day={day}
              timeIndex={timeIndex}
              onScheduleTimeClick={onScheduleTimeClick}
            />
          ))}
        </Fragment>
      ))}
    </Grid>
  ),
);

const ScheduleContent = React.memo(
  ({ title, room }: { title: string; room: string }) => (
    <>
      <Text
        fontSize="sm"
        fontWeight="bold"
      >
        {title}
      </Text>
      <Text fontSize="xs">{room}</Text>
    </>
  ),
);

const ScheduleTable = React.memo(
  ({ tableId, schedules, onScheduleTimeClick }: Props) => {
    const lectureColors = useMemo(() => {
      const lectures = [...new Set(schedules.map(({ lecture }) => lecture.id))];
      const colors = ["#fdd", "#ffd", "#dff", "#ddf", "#fdf", "#dfd"];
      const colorMap = new Map();

      lectures.forEach((lectureId, index) => {
        colorMap.set(lectureId, colors[index % colors.length]);
      });

      return colorMap;
    }, [schedules]);

    const getColor = useCallback(
      (lectureId: string) => {
        return lectureColors.get(lectureId) || "#fff";
      },
      [lectureColors],
    );

    const scheduleKeys = useMemo(
      () =>
        schedules.map(
          (schedule, index) =>
            `${tableId}-${schedule.lecture?.id || "unknown"}-${index}`,
        ),
      [schedules, tableId],
    );

    return (
      <TableOutline tableId={tableId}>
        <StaticGrid onScheduleTimeClick={onScheduleTimeClick} />
        {schedules.map((schedule, index) => (
          <DraggableSchedule
            key={scheduleKeys[index]}
            id={`${tableId}:${index}`}
            data={schedule}
            bg={getColor(schedule.lecture.id || "")}
            tableId={tableId}
          />
        ))}
      </TableOutline>
    );
  },
);

const DraggableSchedule = React.memo(
  ({
    id,
    data,
    bg,
    tableId,
  }: {
    id: string;
    data: Schedule;
    bg: string;
    tableId: string;
  }) => {
    const { day, range, room, lecture } = data;
    const { attributes, setNodeRef, listeners, transform, isDragging } =
      useDraggable({
        id,
      });
    const { showDeleteDialog } = useDialog();

    const positionStyles = useMemo(() => {
      const leftIndex = DAY_LABELS.indexOf(day as (typeof DAY_LABELS)[number]);
      const topIndex = range[0] - 1;
      const size = range.length;

      return {
        left: `${120 + CellSize.WIDTH * leftIndex + 1}px`,
        top: `${40 + (topIndex * CellSize.HEIGHT + 1)}px`,
        width: `${CellSize.WIDTH - 1}px`,
        height: `${CellSize.HEIGHT * size - 1}px`,
      };
    }, [day, range[0], range.length]);

    const handleClick = useCallback(
      (event: React.MouseEvent) => {
        event.stopPropagation();
        showDeleteDialog({
          tableId,
          day: data.day,
          time: data.range[0],
        });
      },
      [showDeleteDialog, tableId, data.day, data.range],
    );

    return (
      <Box
        position="absolute"
        {...positionStyles}
        bg={bg}
        p={1}
        boxSizing="border-box"
        cursor="pointer"
        ref={setNodeRef}
        transform={CSS.Translate.toString(transform)}
        onClick={handleClick}
        opacity={isDragging ? 0.5 : 1}
        {...listeners}
        {...attributes}
      >
        <ScheduleContent
          title={lecture.title}
          room={room || ""}
        />
      </Box>
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.id === nextProps.id &&
      prevProps.bg === nextProps.bg &&
      prevProps.tableId === nextProps.tableId &&
      prevProps.data.day === nextProps.data.day &&
      prevProps.data.range.length === nextProps.data.range.length &&
      prevProps.data.range[0] === nextProps.data.range[0] &&
      prevProps.data.lecture.id === nextProps.data.lecture.id &&
      prevProps.data.lecture.title === nextProps.data.lecture.title &&
      prevProps.data.room === nextProps.data.room
    );
  },
);

export default ScheduleTable;
