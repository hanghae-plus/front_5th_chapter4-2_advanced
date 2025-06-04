import { Flex } from "@chakra-ui/react";
import { useScheduleContext } from "./ScheduleContext.tsx";
import SearchDialog from "./SearchDialog.tsx";
import { useCallback, useState } from "react";
import MemoizedScheduleTable from "./MemoizedScheduleTable.tsx";

export const ScheduleTables = () => {
  const { schedulesMap, setSchedulesMap } = useScheduleContext();
  const [searchInfo, setSearchInfo] = useState<{
    tableId: string;
    day?: string;
    time?: number;
  } | null>(null);

  const disabledRemoveButton = Object.keys(schedulesMap).length === 1;

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
        delete prev[targetId];
        return { ...prev };
      });
    },
    [setSchedulesMap]
  );

  return (
    <>
      <Flex w="full" gap={6} p={6} flexWrap="wrap">
        {Object.entries(schedulesMap).map(([tableId, schedules], index) => (
          <MemoizedScheduleTable
            key={tableId}
            tableId={tableId}
            schedules={schedules}
            index={index}
            onAdd={() => setSearchInfo({ tableId })}
            onDuplicate={() => duplicate(tableId)}
            onRemove={() => remove(tableId)}
            isRemoveDisabled={disabledRemoveButton}
            onScheduleTimeClick={(timeInfo) =>
              setSearchInfo({ tableId, ...timeInfo })
            }
            onDeleteButtonClick={({ day, time }) => {
              setSchedulesMap((prev) => ({
                ...prev,
                [tableId]: prev[tableId].filter(
                  (s) => s.day !== day || !s.range.includes(time)
                ),
              }));
            }}
          />
        ))}
      </Flex>
      <SearchDialog
        searchInfo={searchInfo}
        onClose={() => setSearchInfo(null)}
      />
    </>
  );
};
