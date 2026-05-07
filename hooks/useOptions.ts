import { useEffect } from 'react';
import useOptionStore from '@/stores/common/OptionStore';

// Hook for using options by type
export function useOptions(type: string) {
    const { 
        getOptions, 
        loading, 
        error, 
        fetchAllOptions,
    } = useOptionStore();

    const options = getOptions(type);

    useEffect(() => {
        // Fetch if:
        // 1. Cache invalidated (reload)
        // 2. No options exist
        if (( options.length === 0) && !loading) {
         
        }
    }, [type, options.length, loading, fetchAllOptions]);

    return {
        data: options,
        loading,
        error,
        isEmpty: options.length === 0,
    };
}

// Hook for single option
export function useOption(type: string, id: number) {
    const { getOptionById } = useOptionStore();
    const optionsState = useOptions(type);
    
    return {
        option: getOptionById(type, id),
        loading: optionsState.loading
    };
}

// Hook for store status
export function useOptionsStatus() {
    const { loading, error, options } = useOptionStore();
    
    const totalCount = Object.values(options).reduce(
        (total, arr) => total + (arr?.length || 0), 
        0
    );
    
    return {
        loading,
        error,
        typesLoaded: Object.keys(options).length,
        totalCount,
        isReady: !loading && !error && totalCount > 0
    };
}