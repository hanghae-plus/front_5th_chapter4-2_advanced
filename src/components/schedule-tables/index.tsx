import SearchDialog from "@/components/search-dialog";
import { useScheduleContext } from "@/hooks/use-schedule-context";
import { DayTime, SearchInfo } from "@/types";
import { Flex } from "@chakra-ui/react";
import { useMemo, useState } from "react";
import { TableWrapper } from "./table-wrapper";

const ScheduleTables = () => {
  const [searchInfo, setSearchInfo] = useState<SearchInfo>(null);
  const { schedulesMap, setSchedulesMap } = useScheduleContext();

  const disabledRemoveButton = useMemo(() => Object.keys(schedulesMap).length === 1, [schedulesMap]);

  // string Key 배열로 확인
  const tableKeys = useMemo(() => Object.keys(schedulesMap).map((tableId) => tableId), [schedulesMap]);

  // 각각의 table 별 handler를 미리 선언해 다른 테이블에 영향이 없도록 수정
  const handlers = useMemo(() => {
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
            <TableWrapper
              key={tableId}
              tableId={tableId}
              index={index}
              isDeletable={disabledRemoveButton}
              setSearchInfo={setSearchInfo}
              schedules={schedules}
              handleScheduleTimeClick={handlers[index][0]}
              handleDeleteButtonClick={handlers[index][1]}
            />
          );
        })}
      </Flex>
      <SearchDialog searchInfo={searchInfo} onClose={() => setSearchInfo(null)} />
    </>
  );
};

export default ScheduleTables;
