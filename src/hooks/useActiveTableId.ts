import { useState } from "react";
import { useDndMonitor } from "@dnd-kit/core";

export const useActiveTableId = () => {
  const [activeTableId, setActiveTableId] = useState<string | null>(null);

  useDndMonitor({
    onDragStart({ active }) {
      const id = active?.id?.toString().split(":")[0] ?? null;
      setActiveTableId(id);
    },
    onDragEnd() {
      setActiveTableId(null);
    },
    onDragCancel() {
      setActiveTableId(null);
    },
  });

  return activeTableId;
};
