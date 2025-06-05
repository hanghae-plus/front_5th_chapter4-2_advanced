import { Text } from "@chakra-ui/react";
import React from "react";

interface ScheduleContentProps {
  title: string;
  room?: string;
}

export const ScheduleContent = React.memo(
  ({ title, room }: ScheduleContentProps) => {
    return (
      <>
        <Text fontSize="sm" fontWeight="bold">
          {title}
        </Text>
        <Text fontSize="xs">{room}</Text>
      </>
    );
  }
);
