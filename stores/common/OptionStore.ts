import { create } from 'zustand';
import { OptionsAll, BaseOption } from '@/types/setting/optionsManager/OptionsManager';
import { getAllOptionsManagers } from '@/apis/common/alloption.api';

interface OptionStore {
    options: Partial<OptionsAll>;
    loading: boolean;
    error: string | null;
    fetchAllOptions: () => Promise<Partial<OptionsAll>>;
    getOptions: (type: string) => BaseOption[];
    getOptionById: (type: string, id: number) => BaseOption | null;
    getOptionLabel: (type: string, id: number) => string;
    isLoaded: () => boolean;
    clearOptions: () => void;
    refreshOptions: () => Promise<Partial<OptionsAll>>;
}

let optionsRequestPromise: Promise<Partial<OptionsAll>> | null = null;

const isRecord = (value: unknown): value is Record<string, unknown> =>
    typeof value === 'object' && value !== null && !Array.isArray(value);

const normalizeOptionCollection = (value: unknown): BaseOption[] => {
    if (Array.isArray(value)) {
        return value as BaseOption[];
    }

    if (!isRecord(value)) {
        return [];
    }

    const candidateKeys = ['data', 'items', 'rows', 'result', 'options'];
    for (const key of candidateKeys) {
        if (Array.isArray(value[key])) {
            return value[key] as BaseOption[];
        }
    }

    for (const nestedValue of Object.values(value)) {
        if (Array.isArray(nestedValue)) {
            return nestedValue as BaseOption[];
        }
    }

    return [];
};

const useOptionStore = create<OptionStore>((set, get) => ({
    options: {},
    loading: false,
    error: null,

    fetchAllOptions: async () => {
        if (optionsRequestPromise) {
            return optionsRequestPromise;
        }

        set({ loading: true, error: null });

        optionsRequestPromise = getAllOptionsManagers()
            .then((data) => {
                const nextOptions = data || {};

                set({
                    options: nextOptions,
                    loading: false,
                    error: null,
                });

                return nextOptions;
            })
            .catch((error) => {
                const errorMessage =
                    error instanceof Error
                        ? error.message
                        : 'Failed to fetch options';

                set({
                    loading: false,
                    error: errorMessage,
                });

                return {};
            })
            .finally(() => {
                optionsRequestPromise = null;
            });

        return optionsRequestPromise;
    },

    getOptions: (type) => {
        const { options } = get();
        const typeOptions = options[type as keyof OptionsAll];
        return normalizeOptionCollection(typeOptions);
    },

    getOptionById: (type, id) => {
        const options = get().getOptions(type);
        return options.find((opt) => opt.id === id) || null;
    },

    getOptionLabel: (type, id) => {
        const option = get().getOptionById(type, id);
        return option?.label || option?.name || String(id);
    },

    isLoaded: () => {
        return Object.keys(get().options).length > 0;
    },

    clearOptions: () => {
        optionsRequestPromise = null;
        set({
            options: {},
            error: null,
            loading: false,
        });
    },

    refreshOptions: async () => {
        return get().fetchAllOptions();
    },
}));

if (typeof window !== 'undefined') {
    const initializeStore = async () => {
        const state = useOptionStore.getState();

        if (!state.loading && !state.isLoaded()) {
            await state.fetchAllOptions();
        }
    };

    setTimeout(initializeStore, 100);
}

export default useOptionStore;
