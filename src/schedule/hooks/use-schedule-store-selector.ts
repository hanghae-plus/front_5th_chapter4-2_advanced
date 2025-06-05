import { useContext, useSyncExternalStore } from "react";
import { ScheduleStoreContext } from "../provider/schedule-store-provider.tsx";
import { Schedule, ScheduleMap } from "../../types.ts";

export function useScheduleStoreSelector(): ScheduleMap;
export function useScheduleStoreSelector(tableId: string): Schedule[];
export function useScheduleStoreSelector(tableId?: string) {
  const scheduleStore = useContext(ScheduleStoreContext);

  return useSyncExternalStore(scheduleStore.subscribe, () =>
    tableId
      ? scheduleStore.getScheduleMap()[tableId]
      : scheduleStore.getScheduleMap()
  );
}
