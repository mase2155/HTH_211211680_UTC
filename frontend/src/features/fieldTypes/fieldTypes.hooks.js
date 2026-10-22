import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../../constants/queryKeys';
import { fetchFieldTypesApi } from './fieldTypes.api';

export function useFieldTypes() {
  return useQuery({
    queryKey: queryKeys.fieldTypes,
    queryFn: () => fetchFieldTypesApi(),
  });
}
