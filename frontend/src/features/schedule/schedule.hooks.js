import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../../constants/queryKeys';
import { fetchFieldScheduleApi, fetchScheduleBoardApi } from './schedule.api';

export function useScheduleBoard(fieldTypeId, date) {
  return useQuery({
    queryKey: queryKeys.scheduleBoard(fieldTypeId, date),
    queryFn: () => fetchScheduleBoardApi({ fieldTypeId, date }),
    enabled: Boolean(fieldTypeId && date),
  });
}

export function useFieldSchedule(fieldId, date) {
  return useQuery({
    queryKey: queryKeys.fieldSchedule(fieldId, date),
    queryFn: () => fetchFieldScheduleApi({ fieldId, date }),
    enabled: Boolean(fieldId && date),
  });
}
