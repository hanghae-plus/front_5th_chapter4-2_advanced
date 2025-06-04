import { Button, ButtonGroup, Flex, Heading, Stack } from "@chakra-ui/react";
import { useDndContext } from "@dnd-kit/core";
import { useCallback, useMemo, useState } from "react";
import { LocalScheduleProvider, useScheduleContext } from "./ScheduleContext.tsx";
import ScheduleTable from "./ScheduleTable.tsx";
import SearchDialog from "./SearchDialog.tsx";
import { DayTime } from "./types.ts";

export const ScheduleTables = () => {
  const [searchInfo, setSearchInfo] = useState<{ tableId: string; day?: string; time?: number } | null>(null);
  const { schedulesMap, setSchedulesMap } = useScheduleContext();

  const scheduleTableList = useMemo(() => Object.entries(schedulesMap), [schedulesMap]);

  const disabledRemoveButton = Object.keys(schedulesMap).length === 1;

  // activeTableId는 tables 중 table 선택임으로 상위로 이동
  const dndContext = useDndContext();

  const getActiveTableId = () => {
    const activeId = dndContext.active?.id;
    if (activeId) {
      return String(activeId).split(":")[0];
    }
    return null;
  };

  const activeTableId = getActiveTableId();
  ///

  const duplicate = useCallback(
    (targetId: string) => {
      setSchedulesMap((prev) => ({
        ...prev,
        [`schedule-${Date.now()}`]: [...prev[targetId]],
      }));
    },
    [setSchedulesMap]
  );

  const remove = useCallback(
    (targetId: string) => {
      setSchedulesMap((prev) => {
        const newMap = { ...prev };
        delete newMap[targetId];
        return newMap;
      });
    },
    [setSchedulesMap]
  );

  // 각각의 table 별 handler를 미리 선언해 다른 테이블에 영향이 없도록 수정
  const handlers = useMemo(
    () =>
      scheduleTableList.map(([tableId]) => [
        (timeInfo: DayTime) => setSearchInfo({ tableId, ...timeInfo }),
        ({ day, time }: DayTime) =>
          setSchedulesMap((prev) => ({
            ...prev,
            [tableId]: prev[tableId].filter((schedule) => schedule.day !== day || !schedule.range.includes(time)),
          })),
      ]),
    [setSchedulesMap, scheduleTableList]
  );

  return (
    <>
      <Flex w="full" gap={6} p={6} flexWrap="wrap">
        {scheduleTableList.map(([tableId, schedules], index) => (
          <Stack key={tableId} width="600px">
            <Flex justifyContent="space-between" alignItems="center">
              <Heading as="h3" fontSize="lg">
                시간표 {index + 1}
              </Heading>
              <ButtonGroup size="sm" isAttached>
                <Button colorScheme="green" onClick={() => setSearchInfo({ tableId })}>
                  시간표 추가
                </Button>
                <Button colorScheme="green" mx="1px" onClick={() => duplicate(tableId)}>
                  복제
                </Button>
                <Button colorScheme="green" isDisabled={disabledRemoveButton} onClick={() => remove(tableId)}>
                  삭제
                </Button>
              </ButtonGroup>
            </Flex>
            <LocalScheduleProvider // table 별 Local Context API 로 재할당
              tableId={tableId}
              schedules={schedules}
              onScheduleTimeClick={handlers[index][0]}
              onDeleteButtonClick={handlers[index][1]}
            >
              <ScheduleTable key={`schedule-table-${index}`} isActive={tableId === activeTableId} />
            </LocalScheduleProvider>
          </Stack>
        ))}
      </Flex>
      <SearchDialog searchInfo={searchInfo} onClose={() => setSearchInfo(null)} />
    </>
  );
};
