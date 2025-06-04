import { Flex } from "@chakra-ui/react";
import { useScheduleContext } from "./ScheduleContext.tsx";
import SearchDialog from "./SearchDialog.tsx";
import { useMemo } from "react";
import IndividualScheduleTable from "./components/IndividualScheduleTable.tsx";
import ScheduleDndProvider from "./ScheduleDndProvider.tsx";

export const ScheduleTables = () => {
  const { schedulesMap, setSchedulesMap } = useScheduleContext();

  const scheduleList = useMemo(
    () => Object.entries(schedulesMap),
    [schedulesMap]
  );

  return (
    <>
      <Flex w="full" gap={6} p={6} flexWrap="wrap">
        {scheduleList.map(([tableId, schedules], index) => (
          <ScheduleDndProvider>
            <IndividualScheduleTable
              key={tableId}
              tableId={tableId}
              schedules={schedules}
              index={index}
              setSchedulesMap={setSchedulesMap}
            />
          </ScheduleDndProvider>
        ))}
      </Flex>
      <SearchDialog setSchedulesMap={setSchedulesMap} />
    </>
  );
};
