import { LocalScheduleProvider } from "@/components/providers/local-schedule-provider";
import ScheduleTable from "@/components/schedule-table";
import SearchDialog from "@/components/search-dialog";
import { useScheduleContext } from "@/hooks/use-schedule-context";
import { DayTime, TableHandlers } from "@/types";
import { Flex } from "@chakra-ui/react";
import { useDndContext } from "@dnd-kit/core";
import { useMemo, useState } from "react";
import { TableWrapper } from "./table-wrapper";

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

  const getActiveTableId = () => {
    const activeId = dndContext.active?.id;
    if (activeId) {
      return String(activeId).split(":")[0];
    }
    return null;
  };

  const activeTableId = getActiveTableId();

  // 각각의 table 별 handler를 미리 선언해 다른 테이블에 영향이 없도록 수정
  const handlers: TableHandlers[] = useMemo(() => {
    console.log("갱신");
    return scheduleTableList.map(
      ([tableId]) =>
        ({
          handleAddClick: () => setSearchInfo({ tableId }),
          handleDuplicateClick: () =>
            setSchedulesMap((prev) => ({
              ...prev,
              [`schedule-${Date.now()}`]: [...prev[tableId]],
            })),
          handleDeleteClick: () =>
            setSchedulesMap((prev) => {
              const newMap = { ...prev };
              delete newMap[tableId];
              return newMap;
            }),
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
            <LocalScheduleProvider // table 별 Local Context API 로 재할당
              key={tableId}
              tableId={tableId}
              schedules={schedules}
              handleAddClick={handler.handleAddClick}
              handleDuplicateClick={handler.handleDuplicateClick}
              handleDeleteClick={handler.handleDeleteClick}
              handleScheduleTimeClick={handler.handleScheduleTimeClick}
              handleDeleteButtonClick={handler.handleDeleteButtonClick}
            >
              <TableWrapper key={tableId} index={index} isDeletable={disabledRemoveButton}>
                <ScheduleTable key={`schedule-table-${index}`} isActive={tableId === activeTableId} />
              </TableWrapper>
            </LocalScheduleProvider>
          );
        })}
      </Flex>
      <SearchDialog searchInfo={searchInfo} onClose={() => setSearchInfo(null)} />
    </>
  );
};

export default ScheduleTables;
