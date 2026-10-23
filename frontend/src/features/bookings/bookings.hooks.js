import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../../constants/queryKeys';
import {
  cancelBookingApi,
  createBookingApi,
  fetchBookingByIdApi,
  fetchMyBookingsApi,
  payBookingApi,
} from './bookings.api';

export function useMyBookings(filters = {}, options = {}) {
  return useQuery({
    queryKey: queryKeys.bookingsMe(filters),
    queryFn: () => fetchMyBookingsApi(filters),
    enabled: options.enabled !== false,
  });
}

export function useBookingDetail(id) {
  return useQuery({
    queryKey: queryKeys.bookingDetail(id),
    queryFn: () => fetchBookingByIdApi(id),
    enabled: Boolean(id),
  });
}

export function useCreateBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createBookingApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings', 'me'] });
      queryClient.invalidateQueries({ queryKey: ['schedule'] });
    },
  });
}

export function usePayBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: payBookingApi,
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bookingDetail(id) });
      queryClient.invalidateQueries({ queryKey: ['bookings', 'me'] });
      queryClient.invalidateQueries({ queryKey: ['schedule'] });
    },
  });
}

export function useCancelBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }) => cancelBookingApi(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings', 'me'] });
      queryClient.invalidateQueries({ queryKey: ['schedule'] });
    },
  });
}
