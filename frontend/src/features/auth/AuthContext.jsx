import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { httpClient } from '../../api/httpClient';
import { clearAccessToken, setAccessToken } from '../../api/tokenStore';
import { queryKeys } from '../../constants/queryKeys';
import { fetchMeApi, loginApi, logoutApi, registerApi } from './auth.api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const queryClient = useQueryClient();
  const [bootstrapped, setBootstrapped] = useState(false);

  const meQuery = useQuery({
    queryKey: queryKeys.authMe,
    queryFn: fetchMeApi,
    retry: false,
    enabled: bootstrapped,
  });

  const loginMutation = useMutation({
    mutationFn: loginApi,
    onSuccess: (data) => {
      setAccessToken(data.accessToken);
      queryClient.setQueryData(queryKeys.authMe, data.user);
    },
  });

  const registerMutation = useMutation({
    mutationFn: registerApi,
    onSuccess: (data) => {
      setAccessToken(data.accessToken);
      queryClient.setQueryData(queryKeys.authMe, data.user);
    },
  });

  const logoutMutation = useMutation({
    mutationFn: logoutApi,
    onSettled: () => {
      clearAccessToken();
      queryClient.setQueryData(queryKeys.authMe, null);
    },
  });

  const bootstrap = useCallback(async () => {
    try {
      const { data } = await httpClient.post('/auth/refresh');
      setAccessToken(data.data.accessToken);
      const user = await fetchMeApi();
      queryClient.setQueryData(queryKeys.authMe, user);
    } catch {
      clearAccessToken();
      queryClient.setQueryData(queryKeys.authMe, null);
    } finally {
      setBootstrapped(true);
    }
  }, [queryClient]);

  useEffect(() => {
    bootstrap();
  }, [bootstrap]);

  const value = useMemo(
    () => ({
      user: meQuery.data ?? null,
      isLoading: !bootstrapped || meQuery.isLoading,
      isAuthenticated: Boolean(meQuery.data),
      login: loginMutation.mutateAsync,
      register: registerMutation.mutateAsync,
      logout: logoutMutation.mutateAsync,
      loginState: loginMutation,
      registerState: registerMutation,
    }),
    [bootstrapped, loginMutation, logoutMutation, meQuery.data, meQuery.isLoading, registerMutation],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth phải dùng trong AuthProvider');
  return ctx;
}
