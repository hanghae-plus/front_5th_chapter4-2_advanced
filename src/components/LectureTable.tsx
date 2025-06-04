import { Table, Tbody } from '@chakra-ui/react';
import LectureRow from './LectureRow';
import { Lecture } from '../types';
import { memo } from 'react';

type LectureTableProps = {
  visibleLectures: Lecture[];
  onAdd: (lecture: Lecture) => void;
};

const LectureTable = memo(({ visibleLectures, onAdd }: LectureTableProps) => {
  return (
    <Table size="sm" variant="striped">
      <Tbody>
        {visibleLectures.map((lecture, index) => (
          <LectureRow key={`${lecture.id}-${index}`} lecture={lecture} onAdd={onAdd} />
        ))}
      </Tbody>
    </Table>
  );
});

export default LectureTable;
