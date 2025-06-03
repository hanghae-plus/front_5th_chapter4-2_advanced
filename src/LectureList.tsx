import { memo } from 'react';
import { Tr, Td, Button } from '@chakra-ui/react';
import { Lecture } from './types';

interface LectureListProps {
  lectures: Lecture[];
  onAdd: (lecture: Lecture) => void;
}

const LectureList = memo(({ lectures, onAdd }: LectureListProps) => (
  <>
    {lectures.map((lecture, index) => (
      <Tr key={`${lecture.id}-${index}`}>
        <Td width="100px">{lecture.id}</Td>
        <Td width="50px">{lecture.grade}</Td>
        <Td width="200px">{lecture.title}</Td>
        <Td width="50px">{lecture.credits}</Td>
        <Td width="150px" dangerouslySetInnerHTML={{ __html: lecture.major }} />
        <Td width="150px" dangerouslySetInnerHTML={{ __html: lecture.schedule }} />
        <Td width="80px">
          <Button size="sm" colorScheme="green" onClick={() => onAdd(lecture)}>
            추가
          </Button>
        </Td>
      </Tr>
    ))}
  </>
));

export default LectureList;
