import { FieldVisit, FieldVisits } from "@/types/fieldVisit";
import {
  getAllInFieldVisit,
  createInFieldVisit,
  getInFieldVisit,
  updateInFieldVisit,
  deleteInFieldVisit,
  updateStatusInFieldVisit,
} from '@/apis/fieldvisit.api';
import { create } from 'zustand';
import { getApiErrorMessage } from '@/apis/error';
import type { QueryParamsRecord } from '@/apis/queryParams';

interface FieldVisitState {
  FieldVisits: FieldVisits[];
  FieldVisit: FieldVisit | null;
  total: number;
  per_page: number;
  current_page: number;
  last_page: number;
  isLoading: boolean;
  error: string | null;
  getAllFieldVisits: (
    propertyId: number | string,
    page: number,
    searchParams?: QueryParamsRecord
  ) => Promise<FieldVisits[]>;
  createFieldVisit: (formData: FormData) => Promise<FieldVisits>;
  getFieldVisit: (
    propertyId: number | string,
    id: number | string
  ) => Promise<FieldVisits>;
  updateFieldVisit: (
    propertyId: number | string,
    id: number | string,
    formData: FormData
  ) => Promise<FieldVisit>;
  updateStatusFieldVisit: (
    propertyId: number | string,
    id: number | string,
    formData: FormData
  ) => Promise<FieldVisit>;
  deleteFieldVisit: (
    propertyId: number | string,
    id: number | string
  ) => Promise<void>;
  clearFieldVisit: () => void;
  resetPagination: () => void;
}

export const useFieldVisitStore = create<FieldVisitState>((set, get) => ({
  FieldVisits: [],
  FieldVisit: null,
  total: 0,
  per_page: 10,
  current_page: 1,
  last_page: 1,
  isLoading: false,
  error: null,

  getAllFieldVisits: async (propertyId, page, searchParams = {}) => {
    set({ isLoading: true, error: null });

    try {
      const normalizedPropertyId =
        typeof propertyId === 'string' ? parseInt(propertyId, 10) : propertyId;
      const response = await getAllInFieldVisit(normalizedPropertyId, page, searchParams);
      const list = response?.data || [];

      set({
        FieldVisits: list,
        total: response?.pagination?.total || list.length,
        last_page: response?.pagination?.last_page || 1,
        current_page: response?.pagination?.current_page || page,
        per_page: response?.pagination?.per_page || 10,
        isLoading: false,
      });

      return list;
    } catch (error: unknown) {
      set({
        error: getApiErrorMessage(error),
        isLoading: false,
      });
      throw error;
    }
  },

  createFieldVisit: async (formData) => {
    set({ isLoading: true, error: null });

    try {
      const newItem = await createInFieldVisit(formData);
      const { current_page, per_page } = get();

      if (current_page === 1) {
        set((state) => ({
          FieldVisits: [newItem, ...state.FieldVisits],
          total: state.total + 1,
          last_page: Math.ceil((state.total + 1) / per_page),
          isLoading: false,
        }));
      } else {
        set({ isLoading: false });
      }

      return newItem;
    } catch (error: unknown) {
      set({
        error: getApiErrorMessage(error),
        isLoading: false,
      });
      throw error;
    }
  },

  getFieldVisit: async (propertyId, id) => {
    set({ isLoading: true, error: null });

    try {
      const fieldVisitId = typeof id === 'string' ? parseInt(id, 10) : id;
      const existing = get().FieldVisits.find((item) => item.id === fieldVisitId);

      if (existing) {
        set({ FieldVisit: existing, isLoading: false });
        return existing;
      }

      const response = await getInFieldVisit(propertyId, fieldVisitId);
      set({ FieldVisit: response, isLoading: false });
      return response;
    } catch (error: unknown) {
      set({
        error: getApiErrorMessage(error),
        isLoading: false,
      });
      throw error;
    }
  },

  updateFieldVisit: async (propertyId, id, formData) => {
    set({ isLoading: true, error: null });

    try {
      const fieldVisitId = typeof id === 'string' ? parseInt(id, 10) : id;
      const updated = await updateInFieldVisit(propertyId, fieldVisitId, formData);

      set((state) => ({
        FieldVisits: state.FieldVisits.map((item) =>
          item.id === fieldVisitId ? { ...item, ...updated } : item
        ),
        FieldVisit:
          state.FieldVisit?.id === fieldVisitId
            ? { ...state.FieldVisit, ...updated }
            : state.FieldVisit,
        isLoading: false,
      }));

      return updated;
    } catch (error: unknown) {
      set({
        error: getApiErrorMessage(error),
        isLoading: false,
      });
      throw error;
    }
  },

  updateStatusFieldVisit: async (propertyId, id, formData) => {
    set({ isLoading: true, error: null });

    try {
      const fieldVisitId = typeof id === 'string' ? parseInt(id, 10) : id;
      const updated = await updateStatusInFieldVisit(propertyId, fieldVisitId, formData);

      set((state) => ({
        FieldVisits: state.FieldVisits.map((item) =>
          item.id === fieldVisitId ? { ...item, ...updated } : item
        ),
        FieldVisit:
          state.FieldVisit?.id === fieldVisitId
            ? { ...state.FieldVisit, ...updated }
            : state.FieldVisit,
        isLoading: false,
      }));

      return updated;
    } catch (error: unknown) {
      set({
        error: getApiErrorMessage(error),
        isLoading: false,
      });
      throw error;
    }
  },

  deleteFieldVisit: async (propertyId, id) => {
    set({ isLoading: true, error: null });

    try {
      const deleteId = typeof id === 'string' ? parseInt(id, 10) : id;
      await deleteInFieldVisit(propertyId, deleteId);

      set((state) => ({
        FieldVisits: state.FieldVisits.filter((item) => item.id !== deleteId),
        total: state.total - 1,
        last_page: Math.ceil((state.total - 1) / state.per_page),
        isLoading: false,
      }));
    } catch (error: unknown) {
      set({
        error: getApiErrorMessage(error),
        isLoading: false,
      });
      throw error;
    }
  },

  clearFieldVisit: () => {
    set({ FieldVisit: null });
  },

  resetPagination: () => {
    set({
      current_page: 1,
      per_page: 10,
      total: 0,
      last_page: 1,
    });
  },
}));

export default useFieldVisitStore;
