import { Box, Flex, Grid, GridItem, Text } from "@chakra-ui/react";
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

const ScheduleTable = React.memo(
  ({ tableId, schedules, onScheduleTimeClick }: Props) => {
    const dndContext = useDndContext();

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

    const activeTableId = useMemo(() => {
      const activeId = dndContext.active?.id;
      if (!activeId) return null;

      const activeIdStr = String(activeId);
      const colonIndex = activeIdStr.indexOf(":");
      return colonIndex !== -1 ? activeIdStr.substring(0, colonIndex) : null;
    }, [dndContext.active?.id]);

    const scheduleKeys = useMemo(
      () =>
        schedules.map(
          (schedule, index) => `${tableId}-${index}-${schedule.lecture.id}`,
        ),
      [schedules, tableId],
    );

    return (
      <Box
        position="relative"
        outline={activeTableId === tableId ? "5px dashed" : undefined}
        outlineColor="blue.300"
      >
        <Grid
          templateColumns={GRID_TEMPLATE_COLUMNS}
          templateRows={GRID_TEMPLATE_ROWS}
          bg="white"
          fontSize="sm"
          textAlign="center"
          outline="1px solid"
          outlineColor="gray.300"
        >
          <GridItem
            key="교시"
            borderColor="gray.300"
            bg="gray.100"
          >
            <Flex
              justifyContent="center"
              alignItems="center"
              h="full"
              w="full"
            >
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
              <Flex
                justifyContent="center"
                alignItems="center"
                h="full"
              >
                <Text fontWeight="bold">{day}</Text>
              </Flex>
            </GridItem>
          ))}
          {TIMES.map((time, timeIndex) => (
            <Fragment key={`시간-${timeIndex + 1}`}>
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
              {DAY_LABELS.map((day) => (
                <GridItem
                  key={`${day}-${timeIndex + 2}`}
                  borderWidth="1px 0 0 1px"
                  borderColor="gray.300"
                  bg={timeIndex > 17 ? "gray.100" : "white"}
                  cursor="pointer"
                  _hover={{ bg: "yellow.100" }}
                  onClick={() =>
                    onScheduleTimeClick?.({ day, time: timeIndex + 1 })
                  }
                />
              ))}
            </Fragment>
          ))}
        </Grid>

        {schedules.map((schedule, index) => (
          <DraggableSchedule
            key={scheduleKeys[index]}
            id={`${tableId}:${index}`}
            data={schedule}
            bg={getColor(schedule.lecture.id)}
            tableId={tableId}
          />
        ))}
      </Box>
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
    }, [day, range]);

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

    const textContent = useMemo(
      () => ({
        title: lecture.title,
        room: room,
      }),
      [lecture.title, room],
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
        <>
          <Text
            fontSize="sm"
            fontWeight="bold"
          >
            {textContent.title}
          </Text>
          <Text fontSize="xs">{textContent.room}</Text>
        </>
      </Box>
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.id === nextProps.id &&
      prevProps.bg === nextProps.bg &&
      prevProps.data.day === nextProps.data.day &&
      prevProps.data.range.length === nextProps.data.range.length &&
      prevProps.data.range[0] === nextProps.data.range[0] &&
      prevProps.data.lecture.id === nextProps.data.lecture.id &&
      prevProps.data.room === nextProps.data.room
    );
  },
);

export default ScheduleTable;
