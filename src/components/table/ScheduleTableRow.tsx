import { memo, Fragment } from "react";
import TimeLabelCell from "./TimeLabelCell";
import ScheduleCell from "./ScheduleCell";

interface ScheduleTableRowProps {
  timeIndex: number;
  time: string;
  days: readonly string[];
  onScheduleTimeClick?: (timeInfo: { day: string; time: number }) => void;
}

const ScheduleTableRow = memo(
  ({ timeIndex, time, days, onScheduleTimeClick }: ScheduleTableRowProps) => {
    return (
      <Fragment key={`시간-${timeIndex + 1}`}>
        <TimeLabelCell timeIndex={timeIndex} time={time} />
        {days.map((day) => (
          <ScheduleCell
            key={`${day}-${timeIndex + 2}`}
            day={day}
            timeIndex={timeIndex}
            onScheduleTimeClick={onScheduleTimeClick}
          />
        ))}
      </Fragment>
    );
  }
);

ScheduleTableRow.displayName = "ScheduleTableRow";

export default ScheduleTableRow;
