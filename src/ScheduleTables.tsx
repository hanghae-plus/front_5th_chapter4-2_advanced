import { Button, ButtonGroup, Flex, Heading, Stack } from "@chakra-ui/react";
import ScheduleTable from "./ScheduleTable.tsx";
import { useScheduleContext } from "./ScheduleContext.tsx";
import SearchDialog from "./SearchDialog.tsx";
import { useCallback, useMemo, useState } from "react";
import { Schedule } from "./types.ts";

/**
 * 시간표 목록 컴포넌트
 * 여러 개의 시간표를 관리하고 표시
 */
export const ScheduleTables = () => {
  const { schedulesMap, setSchedulesMap } = useScheduleContext();
  const [searchInfo, setSearchInfo] = useState<{
    tableId: string;
    day?: string;
    time?: number;
  } | null>(null);

  /**
   * 시간표 복제 핸들러
   * useCallback으로 감싸서 schedulesMap이 변경될 때만 재생성
   */
  const handleDuplicate = useCallback((targetId: string) => {
    setSchedulesMap((prev: Record<string, Schedule[]>) => ({
      ...prev,
      [`schedule-${Date.now()}`]: [...prev[targetId]]
    }));
  }, [setSchedulesMap]);

  /**
   * 시간표 삭제 핸들러
   * useCallback으로 감싸서 schedulesMap이 변경될 때만 재생성
   */
  const handleRemove = useCallback((targetId: string) => {
    setSchedulesMap((prev: Record<string, Schedule[]>) => {
      const newMap = { ...prev };
      delete newMap[targetId];
      return newMap;
    });
  }, [setSchedulesMap]);

  /**
   * 시간표 추가 다이얼로그 열기 핸들러
   * useCallback으로 감싸서 setSearchInfo가 변경될 때만 재생성
   */
  const handleOpenSearchDialog = useCallback((tableId: string) => {
    setSearchInfo({ tableId });
  }, []);

  /**
   * 시간표 시간 클릭 핸들러
   * useCallback으로 감싸서 setSearchInfo가 변경될 때만 재생성
   */
  const handleScheduleTimeClick = useCallback((tableId: string, timeInfo: { day: string; time: number }) => {
    setSearchInfo({ tableId, ...timeInfo });
  }, []);

  /**
   * 검색 다이얼로그 닫기 핸들러
   * useCallback으로 감싸서 setSearchInfo가 변경될 때만 재생성
   */
  const handleCloseSearchDialog = useCallback(() => {
    setSearchInfo(null);
  }, []);

  /**
   * 삭제 버튼 비활성화 여부
   * useMemo로 감싸서 schedulesMap이 변경될 때만 재계산
   */
  const isRemoveButtonDisabled = useMemo(() => 
    Object.keys(schedulesMap).length === 1
  , [schedulesMap]);

  /**
   * 시간표 목록
   * useMemo로 감싸서 schedulesMap이 변경될 때만 재계산
   */
  const scheduleTables = useMemo(() => 
    Object.entries(schedulesMap).map(([tableId, schedules], index) => (
      <Stack key={tableId} width="600px">
        <Flex justifyContent="space-between" alignItems="center">
          <Heading as="h3" fontSize="lg">시간표 {index + 1}</Heading>
          <ButtonGroup size="sm" isAttached>
            <Button 
              colorScheme="green" 
              onClick={() => handleOpenSearchDialog(tableId)}
            >
              시간표 추가
            </Button>
            <Button 
              colorScheme="green" 
              mx="1px" 
              onClick={() => handleDuplicate(tableId)}
            >
              복제
            </Button>
            <Button 
              colorScheme="green" 
              isDisabled={isRemoveButtonDisabled}
              onClick={() => handleRemove(tableId)}
            >
              삭제
            </Button>
          </ButtonGroup>
        </Flex>
        <ScheduleTable
          key={`schedule-table-${index}`}
          schedules={schedules}
          tableId={tableId}
          onScheduleTimeClick={(timeInfo) => handleScheduleTimeClick(tableId, timeInfo)}
        />
      </Stack>
    ))
  , [schedulesMap, isRemoveButtonDisabled, handleOpenSearchDialog, handleDuplicate, handleRemove, handleScheduleTimeClick]);

  return (
    <>
      <Flex w="full" gap={6} p={6} flexWrap="wrap">
        {scheduleTables}
      </Flex>
      <SearchDialog 
        searchInfo={searchInfo} 
        onClose={handleCloseSearchDialog}
      />
    </>
  );
};
