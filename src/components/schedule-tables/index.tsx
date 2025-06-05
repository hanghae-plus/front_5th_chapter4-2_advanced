import { LocalScheduleProvider } from "@/components/providers/local-schedule-provider";
import ScheduleTable from "@/components/schedule-table";
import SearchDialog from "@/components/search-dialog";
import { useScheduleContext } from "@/hooks/use-schedule-context";
import { DayTime, SearchInfo } from "@/types";
import { Flex, Stack } from "@chakra-ui/react";
import { useDndContext } from "@dnd-kit/core";
import { useMemo, useState } from "react";
import { ScheduleTableHeader } from "../schedule-table-header";

const ScheduleTables = () => {
  const [searchInfo, setSearchInfo] = useState<SearchInfo>(null);
  const { schedulesMap, setSchedulesMap } = useScheduleContext();

  const disabledRemoveButton = useMemo(() => Object.keys(schedulesMap).length === 1, [schedulesMap]);

  // activeTableId는 tables 중 table 선택임으로 상위로 이동
  const dndContext = useDndContext();

  const activeTableId = useMemo(() => {
    const activeId = dndContext.active?.id;
    return activeId ? String(activeId).split(":")[0] : null;
  }, [dndContext.active?.id]);

  // string Key 배열로 확인
  const tableKeys = useMemo(() => Object.keys(schedulesMap).map((tableId) => tableId), [schedulesMap]);

  // 각각의 table 별 handler를 미리 선언해 다른 테이블에 영향이 없도록 수정
  const handlers = useMemo(() => {
    console.log("갱신?");
    return tableKeys.map(
      (tableId) =>
        [
          (timeInfo: DayTime) => setSearchInfo({ tableId, ...timeInfo }),
          ({ day, time }: DayTime) => {
            console.log(day, time, tableId);
            setSchedulesMap((prev) => ({
              ...prev,
              [tableId]: prev[tableId].filter((schedule) => schedule.day !== day || !schedule.range.includes(time)),
            }));
          },
        ] as const
    );
  }, [setSchedulesMap, tableKeys]);

  return (
    <>
      <Flex w="full" gap={6} p={6} flexWrap="wrap">
        {tableKeys.map((tableId, index) => {
          const schedules = schedulesMap[tableId];
          return (
            <Stack key={tableId} width="600px">
              <ScheduleTableHeader
                tableId={tableId}
                index={index}
                isDisabled={disabledRemoveButton}
                setSearchInfo={setSearchInfo}
              />
              <LocalScheduleProvider // table 별 Local Context API 로 재할당
                key={tableId}
                tableId={tableId}
                schedules={schedules}
                handleScheduleTimeClick={handlers[index][0]}
                handleDeleteButtonClick={handlers[index][1]}
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
