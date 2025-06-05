import { Flex } from "@chakra-ui/react";
import { ScheduleTable } from "../ScheduleTable";
import { useScheduleContext } from "@/providers/ScheduleContext";
import { SearchDialog } from "@/components/SearchDialog";
import { useMemo, useState } from "react";
import { useDndContext } from "@dnd-kit/core";

const ScheduleTables = () => {
  const { schedulesMap } = useScheduleContext();
  const [searchInfo, setSearchInfo] = useState<{
    tableId: string;
    day?: string;
    time?: number;
  } | null>(null);
  const { active } = useDndContext();

  const activeTableId = useMemo(() => {
    const activeId = active?.id;
    if (activeId) {
      return String(activeId).split(":")[0];
    }
    return null;
  }, [active]);

  const disabledRemoveButton = useMemo(() => {
    return Object.keys(schedulesMap).length === 1;
  }, [schedulesMap]);

  return (
    <>
      <Flex
        w="full"
        gap={6}
        p={6}
        flexWrap="wrap">
        {Object.entries(schedulesMap).map(([tableId, schedules], index) => (
          <ScheduleTable
            key={tableId}
            tableId={tableId}
            schedules={schedules}
            index={index}
            isActive={activeTableId === tableId}
            disabledRemoveButton={disabledRemoveButton}
            setSearchInfo={setSearchInfo}
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

export default ScheduleTables;
