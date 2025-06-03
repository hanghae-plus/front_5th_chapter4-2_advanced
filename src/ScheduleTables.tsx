import { Button, ButtonGroup, Flex, Heading, Stack } from "@chakra-ui/react";
import { useDndContext } from "@dnd-kit/core";
import { useCallback, useMemo, useState } from "react";
import { LocalScheduleProvider, useScheduleContext } from "./ScheduleContext.tsx";
import ScheduleTable from "./ScheduleTable.tsx";
import SearchDialog from "./SearchDialog.tsx";

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

  const handleScheduleTimeClick = useCallback((tableId: string, timeInfo: { day: string; time: number }) => setSearchInfo({ tableId, ...timeInfo }), []);
  const handleDeleteButtonClick = useCallback(
    (tableId: string, { day, time }: { day: string; time: number }) =>
      setSchedulesMap((prev) => ({
        ...prev,
        [tableId]: prev[tableId].filter((schedule) => schedule.day !== day || !schedule.range.includes(time)),
      })),
    [setSchedulesMap]
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
            <LocalScheduleProvider
              tableId={tableId}
              schedules={schedules}
              onScheduleTimeClick={(timeInfo) => handleScheduleTimeClick(tableId, timeInfo)}
              onDeleteButtonClick={(timeInfo) => handleDeleteButtonClick(tableId, timeInfo)}
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
