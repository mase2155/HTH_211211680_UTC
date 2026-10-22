import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../../constants/queryKeys';
import { changePasswordApi, updateProfileApi } from './users.api';

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateProfileApi,
    onSuccess: (user) => {
      queryClient.setQueryData(queryKeys.authMe, user);
    },
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: ({ confirmPassword: _c, ...payload }) => changePasswordApi(payload),
  });
}
