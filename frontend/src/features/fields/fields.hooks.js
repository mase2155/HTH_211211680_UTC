import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../../constants/queryKeys';
import { fetchFieldByIdApi, fetchFieldsApi } from './fields.api';

export function useFields(filters = {}) {
  return useQuery({
    queryKey: queryKeys.fields(filters),
    queryFn: () => fetchFieldsApi(filters),
  });
}

export function useFieldDetail(id) {
  return useQuery({
    queryKey: queryKeys.fieldDetail(id),
    queryFn: () => fetchFieldByIdApi(id),
    enabled: Boolean(id),
  });
}
