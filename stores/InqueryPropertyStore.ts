import {
  getAllInqueryProperty,
  createInqueryProperty,
  getInqueryPropertyByID,
  updateInqueryProperty,
  deleteInqueryProperty,
} from '@/apis/InqueryProperty.api';
import { getApiErrorMessage } from '@/apis/error';
import type { QueryParamsRecord } from '@/apis/queryParams';
import { Inquiry, Inquiries } from '@/types/inquery';
import { create } from 'zustand';

interface PropertyInqueryState {
  PropertyInquiries: Inquiries[];
  PropertyInquiry: Inquiry | null;
  total: number;
  per_page: number;
  current_page: number;
  last_page: number;
  isLoading: boolean;
  error: string | null;
  getAllPropertyInquiry: (
    page: number,
    searchParams?: QueryParamsRecord
  ) => Promise<Inquiries[]>;
  createPropertyInquiry: (formData: FormData) => Promise<Inquiry>;
  getPropertyInquiry: (id: number) => Promise<Inquiry>;
  updatePropertyInquiry: (id: number, formData: FormData) => Promise<Inquiry>;
  deletePropertyInquiry: (id: number) => Promise<void>;
  clearPropertyInquiry: () => void;
  resetPagination: () => void;
}

export const usePropertyInqueryStore = create<PropertyInqueryState>((set, get) => ({
  PropertyInquiries: [],
  PropertyInquiry: null,
  total: 0,
  per_page: 10,
  current_page: 1,
  last_page: 1,
  isLoading: false,
  error: null,

  getAllPropertyInquiry: async (page, searchParams = {}) => {
    set({ isLoading: true, error: null });

    try {
      const response = await getAllInqueryProperty(page, searchParams);
      const list = response?.data || [];

      set({
        PropertyInquiries: list,
        total: response?.pagination?.total || list.length,
        last_page: response?.pagination?.last_page || 1,
        current_page: response?.pagination?.current_page || page,
        per_page: response?.pagination?.per_page || list.length,
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

  createPropertyInquiry: async (formData) => {
    set({ isLoading: true, error: null });

    try {
      const newItem = await createInqueryProperty(formData);
      const { current_page } = get();

      if (current_page === 1) {
        set((state) => ({
          PropertyInquiries: [newItem, ...state.PropertyInquiries],
          total: state.total + 1,
          last_page: Math.ceil((state.total + 1) / state.per_page),
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

  getPropertyInquiry: async (id) => {
    set({ isLoading: true, error: null });

    try {
      const existing = get().PropertyInquiries.find((item) => item.id === id);

      if (existing) {
        set({ PropertyInquiry: existing, isLoading: false });
        return existing;
      }

      const response = await getInqueryPropertyByID(id);

      set({ PropertyInquiry: response, isLoading: false });
      return response;
    } catch (error: unknown) {
      set({
        error: getApiErrorMessage(error),
        isLoading: false,
      });
      throw error;
    }
  },

  updatePropertyInquiry: async (id, formData) => {
    set({ isLoading: true, error: null });

    try {
      const updated = await updateInqueryProperty(id, formData);

      set((state) => ({
        PropertyInquiries: state.PropertyInquiries.map((item) =>
          item.id === id ? { ...item, ...updated } : item
        ),
        PropertyInquiry:
          state.PropertyInquiry?.id === id
            ? { ...state.PropertyInquiry, ...updated }
            : state.PropertyInquiry,
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

  deletePropertyInquiry: async (id) => {
    set({ isLoading: true, error: null });

    try {
      await deleteInqueryProperty(id);

      set((state) => ({
        PropertyInquiries: state.PropertyInquiries.filter((item) => item.id !== id),
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

  clearPropertyInquiry: () => {
    set({ PropertyInquiry: null });
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

export default usePropertyInqueryStore;
