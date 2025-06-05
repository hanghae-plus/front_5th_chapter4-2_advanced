import { useDndContext } from "@dnd-kit/core";
import { useMemo } from "react";

export const useTableDndState = (tableId: string) => {
  const dndContext = useDndContext();

  const isActive = useMemo(() => {
    const activeId = dndContext.active?.id;
    if (!activeId) return false;
    return String(activeId).startsWith(`${tableId}:`);
  }, [dndContext.active?.id, tableId]);

  return isActive;
};
