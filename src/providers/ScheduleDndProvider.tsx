import { DndContext } from "@dnd-kit/core";
import { PropsWithChildren } from "react";
import { useDndContextValue } from "../hooks/useDndContextValue";

export default function ScheduleDndProvider({ children }: PropsWithChildren) {
  const { sensors, handleDragEnd, modifiers } = useDndContextValue();

  return (
    <DndContext
      sensors={sensors}
      onDragEnd={handleDragEnd}
      modifiers={modifiers}
    >
      {children}
    </DndContext>
  );
}
