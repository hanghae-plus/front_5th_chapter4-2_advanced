import { useState, useMemo } from "react";
import { Flex } from "@chakra-ui/react";
import { useDndContext } from "@dnd-kit/core";

import Schedule from "./schedule.tsx";
import SearchDialog from "./SearchDialog.tsx";
import { useScheduleStoreSelector } from "./schedule/hooks/use-schedule-store-selector.ts";

export const ScheduleTables = () => {
  const dndContext = useDndContext();
  const schedulesMap = useScheduleStoreSelector();

  const getActiveTableId = () => {
    const activeId = dndContext.active?.id;
    if (activeId) {
      return String(activeId).split(":")[0];
    }
    return null;
  };

  const activeTableId = getActiveTableId();

  const [searchInfo, setSearchInfo] = useState<{
    tableId: string;
    day?: string;
    time?: number;
  } | null>(null);

  const disabledRemoveButton = Object.keys(schedulesMap).length === 1;

  const schedules = useMemo(() => Object.entries(schedulesMap), [schedulesMap]);

  return (
    <>
      <Flex w="full" gap={6} p={6} flexWrap="wrap">
        {schedules.map(([tableId], index) => (
          <Schedule
            key={tableId}
            index={index}
            tableId={tableId}
            setSearchInfo={setSearchInfo}
            disabledRemoveButton={disabledRemoveButton}
            isActive={activeTableId === tableId}
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
