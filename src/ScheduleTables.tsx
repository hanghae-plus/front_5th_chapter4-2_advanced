import { Flex } from "@chakra-ui/react";
import { useScheduleContext, useTableIds } from "./ScheduleContext.tsx";
import SearchDialog from "./SearchDialog.tsx";
import { useCallback, useState } from "react";
import { ScheduleTableItem } from "./ScheduleTableItem.tsx";

// 🔥 타입 정의를 별도 파일로 분리하거나 여기서 한 번만 정의
export interface SearchInfo {
  tableId: string;
  day?: string;
  time?: number;
}

export type SearchClickEvent = string | SearchInfo;

export const ScheduleTables = () => {
  const tableIds = useTableIds();
  const { duplicateTable, removeTable } = useScheduleContext();

  const [searchInfo, setSearchInfo] = useState<SearchInfo | null>(null);

  const disabledRemoveButton = tableIds.length === 1;

  const handleSearchClick = useCallback((searchData: SearchClickEvent) => {
    if (typeof searchData === "string") {
      // 단순 tableId만 전달된 경우
      setSearchInfo({ tableId: searchData });
    } else {
      // 시간 정보가 포함된 객체가 전달된 경우
      setSearchInfo(searchData);
    }
  }, []);

  const handleDuplicate = useCallback(
    (targetId: string) => {
      duplicateTable(targetId);
    },
    [duplicateTable]
  );

  const handleRemove = useCallback(
    (targetId: string) => {
      removeTable(targetId);
    },
    [removeTable]
  );

  const handleCloseSearch = useCallback(() => {
    setSearchInfo(null);
  }, []);

  return (
    <>
      <Flex w="full" gap={6} p={6} flexWrap="wrap">
        {tableIds.map((tableId, index) => (
          <ScheduleTableItem
            key={tableId}
            tableId={tableId}
            index={index}
            onSearchClick={handleSearchClick}
            onDuplicate={handleDuplicate}
            onRemove={handleRemove}
            disabledRemoveButton={disabledRemoveButton}
          />
        ))}
      </Flex>
      <SearchDialog searchInfo={searchInfo} onClose={handleCloseSearch} />
    </>
  );
};
