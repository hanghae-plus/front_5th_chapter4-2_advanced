import { LocalScheduleProvider } from "@/components/providers/local-schedule-provider";
import ScheduleTable from "@/components/schedule-table";
import SearchDialog from "@/components/search-dialog";
import { useScheduleContext } from "@/hooks/use-schedule-context";
import { DayTime, TableHandlers } from "@/types";
import { Button, ButtonGroup, Flex, Heading, Stack } from "@chakra-ui/react";
import { useDndContext } from "@dnd-kit/core";
import { useMemo, useState } from "react";

const ScheduleTables = () => {
  const [searchInfo, setSearchInfo] = useState<{
    tableId: string;
    day?: string;
    time?: number;
  } | null>(null);
  const { schedulesMap, setSchedulesMap } = useScheduleContext();

  const scheduleTableList = useMemo(() => Object.entries(schedulesMap), [schedulesMap]);

  const disabledRemoveButton = useMemo(() => Object.keys(schedulesMap).length === 1, [schedulesMap]);

  // activeTableId는 tables 중 table 선택임으로 상위로 이동
  const dndContext = useDndContext();

  const activeTableId = useMemo(() => {
    const activeId = dndContext.active?.id;
    if (activeId) {
      return String(activeId).split(":")[0];
    }
    return null;
  }, [dndContext.active?.id]);

  const duplicate = (targetId: string) => {
    setSchedulesMap((prev) => ({
      ...prev,
      [`schedule-${Date.now()}`]: [...prev[targetId]],
    }));
  };

  const remove = (targetId: string) => {
    setSchedulesMap((prev) => {
      delete prev[targetId];
      return { ...prev };
    });
  };

  // 각각의 table 별 handler를 미리 선언해 다른 테이블에 영향이 없도록 수정
  const handlers: TableHandlers[] = useMemo(() => {
    console.log("갱신");
    return scheduleTableList.map(
      ([tableId]) =>
        ({
          handleScheduleTimeClick: (timeInfo: DayTime) => setSearchInfo({ tableId, ...timeInfo }),
          handleDeleteButtonClick: ({ day, time }: DayTime) =>
            setSchedulesMap((prev) => ({
              ...prev,
              [tableId]: prev[tableId].filter((schedule) => schedule.day !== day || !schedule.range.includes(time)),
            })),
        } as const)
    );
  }, [setSchedulesMap, scheduleTableList]);

  return (
    <>
      <Flex w="full" gap={6} p={6} flexWrap="wrap">
        {scheduleTableList.map(([tableId, schedules], index) => {
          const handler = handlers[index];
          return (
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
                key={tableId}
                tableId={tableId}
                schedules={schedules}
                handleScheduleTimeClick={handler.handleScheduleTimeClick}
                handleDeleteButtonClick={handler.handleDeleteButtonClick}
              >
                <ScheduleTable key={`schedule-table-${index}`} isActive={tableId === activeTableId} />
              </LocalScheduleProvider>
            </Stack>
          );
        })}
      </Flex>
      <SearchDialog searchInfo={searchInfo} onClose={() => setSearchInfo(null)} />
    </>
  );
};

export default ScheduleTables;
