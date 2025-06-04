import { Flex } from "@chakra-ui/react";
import { useScheduleContext } from "./ScheduleContext.tsx";
import SearchDialog from "./SearchDialog.tsx";
import { useMemo } from "react";
import IndividualScheduleTable from "./components/IndividualScheduleTable.tsx";
import { useDndContext } from "@dnd-kit/core";

export const ScheduleTables = () => {
  const { schedulesMap, setSchedulesMap } = useScheduleContext();
  const dndContext = useDndContext();

  const scheduleList = useMemo(
    () => Object.entries(schedulesMap),
    [schedulesMap]
  );

  return (
    <>
      <Flex w="full" gap={6} p={6} flexWrap="wrap">
        {scheduleList.map(([tableId, schedules], index) => (
          <IndividualScheduleTable
            key={tableId}
            tableId={tableId}
            schedules={schedules}
            index={index}
            setSchedulesMap={setSchedulesMap}
            dndContext={dndContext}
          />
        ))}
      </Flex>
      <SearchDialog setSchedulesMap={setSchedulesMap} />
    </>
  );
};
