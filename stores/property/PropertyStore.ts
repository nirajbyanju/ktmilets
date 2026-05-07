import {
  getAllProperties,
  getPropertyByID,
  createProperty,
  updateProperty,
  updateStatusProperty,
  deleteProperty,
} from '@/apis/property/property.api';
import type { QueryParamsRecord } from '@/apis/queryParams';
import { Property, Properties } from '@/types/property/property';
import _ from 'lodash';
import { create } from 'zustand';

interface PropertyState {
  Properties: Properties[] | null;
  Property: Properties | null;
  total: number;
  per_page: number;
  current_page: number;
  last_page: number;
  getAllProperties: (page: number, search: FormData | QueryParamsRecord) => Promise<Property | null>;
  createProperty: (property: FormData) => Promise<void>;
  getProperty: (id: number) => Promise<Properties | null>;
  updateProperty: (id: number, property: FormData) => Promise<void>;
  updateStatusProperty: (id: number, property: FormData) => Promise<void>;
  deleteProperty: (id: number) => Promise<void>;
}

export const usePropertyStore = create<PropertyState>((set, get) => ({
  Properties: null,
  Property: null,
  total: 0,
  per_page: 10,
  current_page: 1,
  last_page: 0,

  getAllProperties: async (page: number, formData: FormData | QueryParamsRecord = {}) => {
    try {
      const response = await getAllProperties(page, formData);

      if (response && response.data) {
        if (response.data.pagination) {
          set({
            Properties: response.data.data || [],
            total: response.data.pagination.total || 0,
            last_page: response.data.pagination.last_page || 0,
            current_page: response.data.pagination.current_page || page,
          });
        } else {
          const list = Array.isArray(response.data) ? response.data : [];
          set({
            Properties: list,
            total: list.length,
            last_page: 1,
            current_page: 1,
          });
        }
      }

      return response?.data || null;
    } catch (error) {
      console.error('Failed to fetch company profiles:', error);
      throw error;
    }
  },

  createProperty: async (formData: FormData) => {
    try {
      const newProfile = await createProperty(formData);
      set((state) => ({
        Properties: [...(state.Properties ?? []), newProfile],
      }));
    } catch (error) {
      console.error('Failed to create company profile:', error);
      throw error;
    }
  },

  getProperty: async (id: number) => {
    try {
      if (_.isEmpty(get().Properties)) {
        const response = await getPropertyByID(id);
        set({ Property: response });
        return response;
      }

      const profile = get().Properties?.find((item) => item.id === id);
      return profile ?? null;
    } catch (error) {
      console.error(`Failed to fetch company profile with id ${id}:`, error);
      throw error;
    }
  },

  updateProperty: async (id: number, formData: FormData) => {
    try {
      const updatedProfile = await updateProperty(id, formData);
      set((state) => ({
        Properties: state.Properties?.map((profile) =>
          profile.id === updatedProfile.id ? updatedProfile : profile
        ),
      }));
    } catch (error) {
      console.error('Failed to update company profile:', error);
      throw error;
    }
  },

  updateStatusProperty: async (id: number, formData: FormData) => {
    try {
      const updatedProfile = await updateStatusProperty(id, formData);
      set((state) => ({
        Properties: state.Properties?.map((profile) =>
          profile.id === updatedProfile.id ? updatedProfile : profile
        ),
      }));
    } catch (error) {
      console.error('Failed to update company profile status:', error);
      throw error;
    }
  },

  deleteProperty: async (id: number) => {
    try {
      await deleteProperty(id);
      const currentProfiles = get().Properties;

      if (Array.isArray(currentProfiles)) {
        set({
          Properties: currentProfiles.filter((profile) => profile.id !== id),
        });
      } else {
        console.error('Error: companyProfiles is not an array.');
      }
    } catch (error) {
      console.error(`Failed to delete company profile with id ${id}:`, error);
      throw error;
    }
  },
}));

export default usePropertyStore;
