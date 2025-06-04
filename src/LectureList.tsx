import React, { useMemo } from "react";
import { FixedSizeList as List } from "react-window";
import { Lecture } from "./types";
import { LectureRow } from "./LectureRow";

interface LectureListProps {
  lectures: Lecture[];
  onAddSchedule: (lecture: Lecture) => void;
  height: number;
}

export const LectureList = React.memo(
  ({ lectures, onAddSchedule, height }: LectureListProps) => {
    const Row = useMemo(
      () =>
        ({ index, style }: { index: number; style: React.CSSProperties }) => {
          const lecture = lectures[index];
          return (
            <div style={style}>
              <LectureRow
                lecture={lecture}
                index={index}
                onAddSchedule={onAddSchedule}
              />
            </div>
          );
        },
      [lectures, onAddSchedule]
    );

    return (
      <List
        height={height}
        itemCount={lectures.length}
        itemSize={50}
        width="100%"
      >
        {Row}
      </List>
    );
  }
);
