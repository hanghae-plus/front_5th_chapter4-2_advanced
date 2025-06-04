// LectureRow.tsx
import { Tr, Td, Button } from '@chakra-ui/react';
import { Lecture } from './types';
import { memo } from 'react';

interface Props {
  lecture: Lecture;
  onAdd: (lecture: Lecture) => void;
}

const LectureRow = memo(({ lecture, onAdd }: Props) => {
  return (
    <Tr>
      <Td width="100px">{lecture.id}</Td>
      <Td width="60px" textAlign="center">
        {lecture.grade}
      </Td>
      <Td width="200px">{lecture.title}</Td>
      <Td width="60px" textAlign="center">
        {lecture.credits}
      </Td>
      <Td width="150px" dangerouslySetInnerHTML={{ __html: lecture.major }} />
      <Td width="150px" dangerouslySetInnerHTML={{ __html: lecture.schedule }} />
      <Td width="80px">
        <Button size="sm" colorScheme="green" onClick={() => onAdd(lecture)}>
          추가
        </Button>
      </Td>
    </Tr>
  );
});

export default LectureRow;
