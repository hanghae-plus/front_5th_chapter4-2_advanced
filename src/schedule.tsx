import { memo } from "react";
import { Stack } from "@chakra-ui/react";

import ScheduleTable from "./ScheduleTable.tsx";
import ScheduleHeader from "./schedule-header.tsx";

interface ScheduleProps {
  index: number;
  tableId: string;
  setSearchInfo: React.Dispatch<
    React.SetStateAction<{
      tableId: string;
      day?: string;
      time?: number;
    } | null>
  >;
  disabledRemoveButton: boolean;
  isActive: boolean;
}

const Schedule = ({
  index,
  tableId,
  setSearchInfo,
  disabledRemoveButton,
  isActive,
}: ScheduleProps) => {
  return (
    <Stack key={tableId} width="600px">
      <ScheduleHeader
        index={index}
        tableId={tableId}
        setSearchInfo={setSearchInfo}
        disabledRemoveButton={disabledRemoveButton}
      />
      <ScheduleTable
        key={`schedule-table-${index}`}
        tableId={tableId}
        isActive={isActive}
        setSearchInfo={setSearchInfo}
      />
    </Stack>
  );
};

export default memo(Schedule);
