import {
    getAllOptionsManagers,
    createOptionsManagers,
    getOptionsManagersByID,
    updateOptionsManagers,
    deleteOptionsManagers,
    updateStatusOptionsManagers,
    getOptionsMenu,
} from '@/apis/setting/optionManager/optionManager.api';
import { OptionsManagers, OptionsManagerResponse } from '@/types/setting/optionsManager/OptionsManager';
import { create } from 'zustand';
import type { QueryParamsRecord } from '@/apis/queryParams';

interface OptionsManagerState {
    optionsManagers: OptionsManagers[]; // Array of individual items
    optionsManager: OptionsManagers | null; // Single item, not the response wrapper
    optionsMenu: OptionsManagers[];
    optionsMenuLoaded: boolean;
    optionsMenuLoading: boolean;
    total: number;
    per_page: number;
    current_page: number;
    last_page: number;
    getAllOptionsManagers: (page: number, search: FormData | QueryParamsRecord) => Promise<OptionsManagerResponse | null>;
    createOptionsManager: (formData: FormData) => Promise<void>;
    getOptionsManager: (id: number, payload: FormData | QueryParamsRecord) => Promise<OptionsManagers | null>;
    getParentOptionsManager: () => Promise<OptionsManagers | null>;
    updateOptionsManager: (id: number, formData: FormData) => Promise<void>;
    updateStatusOptionsManager: (id: number, formData: FormData) => Promise<void>;
    deleteOptionsManager: (id: number, params: string) => Promise<void>;
    getOptionsMenu: () => Promise<OptionsManagers[]>;
}

export const useOptionsManagerStore = create<OptionsManagerState>((set, get) => ({
    optionsManagers: [],
    optionsManager: null,
    optionsMenu: [],
    optionsMenuLoaded: false,
    optionsMenuLoading: false,
    total: 0,
    per_page: 10,
    current_page: 1,
    last_page: 0,

    getAllOptionsManagers: async (page: number, formData: FormData | QueryParamsRecord) => {
        try {
            const response = await getAllOptionsManagers(page, formData);
            
            if (response) {
                set({
                    optionsManagers: response.data, // response.data should be OptionsManagers[]
                    total: response.pagination.total,
                    last_page: response.pagination.last_page,
                    current_page: response.pagination.current_page,
                });
            }
            return response;
        } catch (error) {
            console.error('Failed to fetch options managers:', error);
            throw error;
        }
    },

    createOptionsManager: async (formData: FormData) => {
        try {
            const newOptionsManager = await createOptionsManagers(formData);
            set((state) => ({
                optionsManagers: [...state.optionsManagers, newOptionsManager],
            }));
        } catch (error) {
            console.error('Failed to create options manager:', error);
            throw error;
        }
    },

    getOptionsManager: async (id: number, payload: FormData | QueryParamsRecord) => {
        try {
            const optionsManager = await getOptionsManagersByID(id, payload);
            set({ optionsManager });
            return optionsManager;
        } catch (error) {
            console.error('Failed to fetch options manager:', error);
            throw error;
        }
    },

    getParentOptionsManager: async () => {
        try {
            // Implement your parent fetching logic here
            return null;
        } catch (error) {
            console.error('Failed to fetch parent options manager:', error);
            throw error;
        }
    },

    updateOptionsManager: async (id: number, formData: FormData) => {
        try {
            const updatedManager = await updateOptionsManagers(id, formData);
            set((state) => ({
                optionsManagers: state.optionsManagers.map(manager =>
                    manager.id === id ? updatedManager : manager
                ),
                optionsManager: state.optionsManager?.id === id ? updatedManager : state.optionsManager
            }));
        } catch (error) {
            console.error('Failed to update options manager:', error);
            throw error;
        }
    },

    updateStatusOptionsManager: async (id: number, formData: FormData) => {
        try {
            const updatedManager = await updateStatusOptionsManagers(id, formData);
            console.log(updatedManager.id);
            
            set((state) => ({
                optionsManagers: state.optionsManagers.map((manager) =>
                    manager.id === id ? updatedManager : manager
                ),
                optionsManager: state.optionsManager?.id === id ? updatedManager : state.optionsManager
            }));
        } catch (error) {
            console.error('Failed to update options manager status:', error);
            throw error;
        }
    },

    deleteOptionsManager: async (id: number, params: string) => {
        try {
            await deleteOptionsManagers(id, params);
            set((state) => ({
                optionsManagers: state.optionsManagers.filter(manager => manager.id !== id),
                optionsManager: state.optionsManager?.id === id ? null : state.optionsManager
            }));
        } catch (error) {
            console.error('Failed to delete options manager:', error);
            throw error;
        }
    },
    getOptionsMenu: async () => {
        const { optionsMenu, optionsMenuLoaded } = get();

        if (optionsMenuLoaded) {
            return optionsMenu;
        }

        set({ optionsMenuLoading: true });

        try {
            const optionsMenu = await getOptionsMenu();
            set({ optionsMenu, optionsMenuLoaded: true });
            return optionsMenu;
        } catch (error) {
            console.error('Failed to fetch options managers:', error);
            throw error;
        } finally {
            set({ optionsMenuLoading: false });
        }
    },
}));

export default useOptionsManagerStore;
