import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../../constants/queryKeys';
import { fetchTimeSlotsApi } from './timeSlots.api';

export function useTimeSlots(fieldTypeId) {
  return useQuery({
    queryKey: queryKeys.timeSlots(fieldTypeId),
    queryFn: () => fetchTimeSlotsApi({ fieldTypeId }),
    enabled: Boolean(fieldTypeId),
  });
}
