import { Box, Flex, Grid, GridItem, Text } from "@chakra-ui/react";
import { CellSize, DAY_LABELS, 분 } from "../../data/constants";
import { fill2, parseHnM } from "../../lib/utils";
import { Fragment, memo, useCallback, useMemo } from "react";
import { useTableSchedules } from "../../stores/scheduleStore";
import { DraggableSchedule } from "..//dnd";

interface Props {
  tableId: string;
  onScheduleTimeClick?: (timeInfo: { day: string; time: number }) => void;
  onDeleteButtonClick?: (timeInfo: { day: string; time: number }) => void;
}

const TIMES = [
  ...Array(18)
    .fill(0)
    .map((v, k) => v + k * 30 * 분)
    .map(v => `${parseHnM(v)}~${parseHnM(v + 30 * 분)}`),

  ...Array(6)
    .fill(18 * 30 * 분)
    .map((v, k) => v + k * 55 * 분)
    .map(v => `${parseHnM(v)}~${parseHnM(v + 50 * 분)}`),
] as const;

const ScheduleTable = memo(
  ({ tableId, onScheduleTimeClick, onDeleteButtonClick }: Props) => {
    // 특정 테이블의 스케줄만 구독 - 성능 최적화
    const schedules = useTableSchedules(tableId);

    // 색상 매핑 - 메모이제이션으로 안정적인 참조 보장
    const colorMap = useMemo(() => {
      const lectures = [...new Set(schedules.map(({ lecture }) => lecture.id))];
      const colors = ["#fdd", "#ffd", "#dff", "#ddf", "#fdf", "#dfd"];
      const map = new Map<string, string>();
      lectures.forEach((lectureId, index) => {
        map.set(lectureId, colors[index % colors.length]);
      });
      return map;
    }, [schedules]);

    const getColor = useCallback((lectureId: string) => colorMap.get(lectureId) || "#fdd", [colorMap]);

    return (
      <Box position="relative">
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
          {DAY_LABELS.map(day => (
            <GridItem key={day} borderLeft="1px" borderColor="gray.300" bg="gray.100">
              <Flex justifyContent="center" alignItems="center" h="full">
                <Text fontWeight="bold">{day}</Text>
              </Flex>
            </GridItem>
          ))}
          {TIMES.map((time, timeIndex) => (
            <Fragment key={`시간-${timeIndex + 1}`}>
              <GridItem borderTop="1px solid" borderColor="gray.300" bg={timeIndex > 17 ? "gray.200" : "gray.100"}>
                <Flex justifyContent="center" alignItems="center" h="full">
                  <Text fontSize="xs">
                    {fill2(timeIndex + 1)} ({time})
                  </Text>
                </Flex>
              </GridItem>
              {DAY_LABELS.map(day => (
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

        {schedules.map((schedule, index) => {
          // 안정적인 key 생성 (schedule의 고유 정보 사용)
          const stableKey = `${schedule.lecture.id}-${schedule.day}-${schedule.range.join(",")}`;

          return (
            <DraggableSchedule
              key={stableKey}
              id={`${tableId}:${index}`}
              data={schedule}
              bg={getColor(schedule.lecture.id)}
              onDeleteButtonClick={onDeleteButtonClick}
              scheduleDay={schedule.day}
              scheduleTime={schedule.range[0]}
            />
          );
        })}
      </Box>
    );
  },
  (prevProps, nextProps) => {
    // props가 실제로 변경되었는지 확인 (성능 최적화)
    return (
      prevProps.tableId === nextProps.tableId &&
      prevProps.onScheduleTimeClick === nextProps.onScheduleTimeClick &&
      prevProps.onDeleteButtonClick === nextProps.onDeleteButtonClick
    );
  }
);

ScheduleTable.displayName = "ScheduleTable";

export default ScheduleTable;
