import { LocalScheduleProvider } from "@/components/providers/local-schedule-provider";
import { ScheduleDndProvider } from "@/components/providers/schedule-dnd-provider";
import ScheduleTable from "@/components/schedule-table";
import { ScheduleTableHeader } from "@/components/schedule-table-header";
import { DayTime, Schedule, SearchInfo } from "@/types";
import { Stack } from "@chakra-ui/react";
import { memo } from "react";

type TableWrapperProps = {
  tableId: string;
  index: number;
  isDeletable: boolean;
  schedules: Schedule[];
  setSearchInfo: React.Dispatch<React.SetStateAction<SearchInfo>>;
  handleScheduleTimeClick: (timeInfo: DayTime) => void;
  handleDeleteButtonClick: (timeInfo: DayTime) => void;
};
export const TableWrapper = memo(
  ({
    tableId,
    index,
    isDeletable,
    schedules,
    setSearchInfo,
    handleScheduleTimeClick,
    handleDeleteButtonClick,
  }: TableWrapperProps) => {
    return (
      <ScheduleDndProvider>
        <Stack key={tableId} width="600px">
          <ScheduleTableHeader //
            tableId={tableId}
            index={index}
            isDisabled={isDeletable}
            setSearchInfo={setSearchInfo}
          />
          <LocalScheduleProvider // table 별 Local Context API 로 재할당
            key={tableId}
            tableId={tableId}
            schedules={schedules}
            handleScheduleTimeClick={handleScheduleTimeClick}
            handleDeleteButtonClick={handleDeleteButtonClick}
          >
            <ScheduleTable key={`schedule-table-${index}`} />
          </LocalScheduleProvider>
        </Stack>
      </ScheduleDndProvider>
    );
  }
);
