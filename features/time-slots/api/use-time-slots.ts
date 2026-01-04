/**
 * Time Slots Feature - API Hooks
 * React Query hooks for time slot management
 */

'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import { ITimeSlot, CreateTimeSlotDTO } from '@/lib/types';
import { useNotifications } from '@/lib/stores/notifications';

const TIME_SLOTS_QUERY_KEYS = {
  all: ['time-slots'] as const,
  byCourse: (courseId: number) => ['time-slots', 'course', courseId] as const,
  available: (courseId: number) => ['time-slots', 'available', courseId] as const,
  detail: (id: number) => ['time-slots', id] as const,
};

/**
 * Hook to get all time slots for a course (instructor)
 */
export function useTimeSlots(courseId: number) {
  return useQuery({
    queryKey: TIME_SLOTS_QUERY_KEYS.byCourse(courseId),
    queryFn: async () => {
      const response = await apiClient.get<ITimeSlot[]>(
        `/api/instructor/courses/${courseId}/slots`
      );
      return response;
    },
  });
}

/**
 * Hook to get available time slots for a course (public)
 */
export function useAvailableSlots(courseId: number) {
  return useQuery({
    queryKey: TIME_SLOTS_QUERY_KEYS.available(courseId),
    queryFn: async () => {
      const response = await apiClient.get<ITimeSlot[]>(
        `/api/courses/${courseId}/slots/available`
      );
      return response;
    },
  });
}

/**
 * Hook to create new time slots
 */
export function useCreateTimeSlot(courseId: number) {
  const queryClient = useQueryClient();
  const { addNotification } = useNotifications();

  return useMutation({
    mutationFn: async (data: CreateTimeSlotDTO) => {
      return await apiClient.post<ITimeSlot>(
        `/api/instructor/courses/${courseId}/slots`,
        data
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: TIME_SLOTS_QUERY_KEYS.byCourse(courseId),
      });
      addNotification({
        type: 'success',
        title: 'Time Slot Created',
        message: 'New time slot has been added',
      });
    },
    onError: (error) => {
      addNotification({
        type: 'error',
        title: 'Creation Failed',
        message: error instanceof Error ? error.message : 'Unable to create time slot',
      });
    },
  });
}

/**
 * Hook to update a time slot
 */
export function useUpdateTimeSlot(slotId: number) {
  const queryClient = useQueryClient();
  const { addNotification } = useNotifications();

  return useMutation({
    mutationFn: async (data: Partial<CreateTimeSlotDTO>) => {
      return await apiClient.put<ITimeSlot>(`/api/instructor/slots/${slotId}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TIME_SLOTS_QUERY_KEYS.all });
      addNotification({
        type: 'success',
        title: 'Time Slot Updated',
        message: 'Time slot has been updated',
      });
    },
    onError: (error) => {
      addNotification({
        type: 'error',
        title: 'Update Failed',
        message: error instanceof Error ? error.message : 'Unable to update time slot',
      });
    },
  });
}

/**
 * Hook to delete a time slot
 */
export function useDeleteTimeSlot(slotId: number) {
  const queryClient = useQueryClient();
  const { addNotification } = useNotifications();

  return useMutation({
    mutationFn: async () => {
      return await apiClient.delete(`/api/instructor/slots/${slotId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TIME_SLOTS_QUERY_KEYS.all });
      addNotification({
        type: 'success',
        title: 'Time Slot Deleted',
        message: 'Time slot has been removed',
      });
    },
    onError: (error) => {
      addNotification({
        type: 'error',
        title: 'Deletion Failed',
        message: error instanceof Error ? error.message : 'Unable to delete time slot',
      });
    },
  });
}
