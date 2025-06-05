import { Button, Tr, Td } from '@chakra-ui/react';
import { Lecture } from './types';
import { memo, useCallback } from 'react';

interface LectureRowProps {
  lecture: Lecture;
  addSchedule: (lecture: Lecture) => void;
}

/**
 * 강의 행 컴포넌트
 * memo로 감싸서 props가 변경되지 않으면 리렌더링 방지
 */
const LectureRow = memo(({ lecture, addSchedule }: LectureRowProps) => {
  /**
   * 스케줄 추가 핸들러
   * useCallback으로 감싸서 lecture나 addSchedule이 변경될 때만 재생성
   */
  const handleAddSchedule = useCallback(() => {
    addSchedule(lecture);
  }, [lecture, addSchedule]);

  return (
    <Tr>
      <Td width="100px">{lecture.id}</Td>
      <Td width="50px">{lecture.grade}</Td>
      <Td width="200px">{lecture.title}</Td>
      <Td width="50px">{lecture.credits}</Td>
      <Td width="150px" dangerouslySetInnerHTML={{ __html: lecture.major }}/>
      <Td width="150px" dangerouslySetInnerHTML={{ __html: lecture.schedule }}/>
      <Td width="80px">
        <Button size="sm" colorScheme="green" onClick={handleAddSchedule}>추가</Button>
      </Td>
    </Tr>
  );
});

export default LectureRow;