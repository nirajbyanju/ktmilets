import { InquiryFollowup } from "@/types/inqueryFollow";
import {
  getAllInquestFollow,
  createInquestFollow,
  getInquestFollow,
  updateInquestFollow,
  deleteInquestFollow,
} from '@/apis/InqueryFollow.api';
import { getApiErrorMessage } from '@/apis/error';
import { create } from 'zustand';

type FollowupSearchParams = Record<string, string | number | boolean | null | undefined>;

interface InquestFollowupState {
  InquestFollowups: InquiryFollowup[];
  InquestFollowup: InquiryFollowup | null;
  total: number;
  per_page: number;
  current_page: number;
  last_page: number;
  isLoading: boolean;
  error: string | null;
  getAllInquestFollow: (
    inquiryId: number | string,
    page: number,
    searchParams?: FollowupSearchParams
  ) => Promise<InquiryFollowup[]>;
  createInquestFollow: (
    inquiryId: number | string,
    formData: FormData
  ) => Promise<InquiryFollowup>;
  getInquestFollow: (
    inquiryId: number | string,
    id: number | string
  ) => Promise<InquiryFollowup>;
  updateInquestFollow: (
    inquiryId: number | string,
    id: number | string,
    formData: FormData
  ) => Promise<InquiryFollowup>;
  deleteInquestFollow: (
    inquiryId: number | string,
    id: number | string
  ) => Promise<void>;
  clearInquestFollow: () => void;
  resetPagination: () => void;
}

export const useInquestFollowupStore = create<InquestFollowupState>((set, get) => ({
  InquestFollowups: [],
  InquestFollowup: null,
  total: 0,
  per_page: 10,
  current_page: 1,
  last_page: 1,
  isLoading: false,
  error: null,

  getAllInquestFollow: async (inquiryId, page, searchParams = {}) => {
    set({ isLoading: true, error: null });

    try {
      const response = await getAllInquestFollow(inquiryId, page, searchParams);
      const list = response.data || [];

      set({
        InquestFollowups: list,
        total: response.pagination?.total || list.length,
        last_page: response.pagination?.last_page || 1,
        current_page: response.pagination?.current_page || page,
        per_page: response.pagination?.per_page || list.length,
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

  createInquestFollow: async (inquiryId, formData) => {
    set({ isLoading: true, error: null });

    try {
      const newItem = await createInquestFollow(inquiryId, formData);
      const { current_page } = get();

      if (current_page === 1) {
        set((state) => ({
          InquestFollowups: [newItem, ...state.InquestFollowups],
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

  getInquestFollow: async (inquiryId, id) => {
    set({ isLoading: true, error: null });

    try {
      const followupId = typeof id === 'string' ? parseInt(id, 10) : id;
      const existing = get().InquestFollowups.find((item) => item.id === followupId);

      if (existing) {
        set({ InquestFollowup: existing, isLoading: false });
        return existing;
      }

      const response = await getInquestFollow(inquiryId, followupId);
      set({ InquestFollowup: response, isLoading: false });
      return response;
    } catch (error: unknown) {
      set({
        error: getApiErrorMessage(error),
        isLoading: false,
      });
      throw error;
    }
  },

  updateInquestFollow: async (inquiryId, id, formData) => {
    set({ isLoading: true, error: null });

    try {
      const followupId = typeof id === 'string' ? parseInt(id, 10) : id;
      const updated = await updateInquestFollow(inquiryId, followupId, formData);

      set((state) => ({
        InquestFollowups: state.InquestFollowups.map((item) =>
          item.id === followupId ? { ...item, ...updated } : item
        ),
        InquestFollowup:
          state.InquestFollowup?.id === followupId
            ? { ...state.InquestFollowup, ...updated }
            : state.InquestFollowup,
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

  deleteInquestFollow: async (inquiryId, id) => {
    set({ isLoading: true, error: null });

    try {
      const deleteId = typeof id === 'string' ? parseInt(id, 10) : id;
      await deleteInquestFollow(inquiryId, deleteId);

      set((state) => ({
        InquestFollowups: state.InquestFollowups.filter((item) => item.id !== deleteId),
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

  clearInquestFollow: () => {
    set({ InquestFollowup: null });
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

export default useInquestFollowupStore;
