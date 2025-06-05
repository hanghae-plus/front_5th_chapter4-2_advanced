import { useContext } from "react";
import { ScheduleStoreContext } from "../provider/schedule-store-provider.tsx";

export const useSetScheduleMap = () => {
  const scheduleStore = useContext(ScheduleStoreContext);

  return scheduleStore.setScheduleMap;
};
