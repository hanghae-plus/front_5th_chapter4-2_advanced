import { Lecture } from "@/types";
import { Button, Table, Tbody, Td, Tr } from "@chakra-ui/react";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
import { FixedSizeList as LectureList, ListOnScrollProps } from "react-window";

function ScheduleMemoizedLecture({
  visibleLectures,
  addSchedule,
  lastPage,
  setPage,
}: {
  visibleLectures: Lecture[];
  addSchedule: (lecture: Lecture) => void;
  lastPage: number;
  setPage: React.Dispatch<React.SetStateAction<number>>;
}) {
  const handleScroll = ({ scrollOffset }: ListOnScrollProps) => {
    const totalHeight = visibleLectures.length * 70;
    const remainingDistance = totalHeight - scrollOffset;

    if (remainingDistance < 410) {
      setPage((prevPage) => Math.min(lastPage, prevPage + 1));
    }
  };

  return (
    <LectureList
      height={405}
      width={"100%"}
      itemCount={visibleLectures.length}
      itemSize={70}
      onScroll={handleScroll}
    >
      {({ index, style }: { index: number; style: React.CSSProperties }) => {
        const lecture = visibleLectures[index];
        return (
          <Table style={style} size="sm" variant="striped">
            <Tbody>
              <Tr key={`${lecture.id}-${index}`}>
                <Td width="100px">{lecture.id}</Td>
                <Td width="50px">{lecture.grade}</Td>
                <Td width="200px">{lecture.title}</Td>
                <Td width="50px">{lecture.credits}</Td>
                <Td
                  width="150px"
                  dangerouslySetInnerHTML={{ __html: lecture.major }}
                />
                <Td
                  width="150px"
                  dangerouslySetInnerHTML={{ __html: lecture.schedule }}
                />
                <Td width="80px">
                  <Button
                    size="sm"
                    colorScheme="green"
                    onClick={() => addSchedule(lecture)}
                  >
                    추가
                  </Button>
                </Td>
              </Tr>
            </Tbody>
          </Table>
        );
      }}
    </LectureList>
  );
}

export default ScheduleMemoizedLecture;
