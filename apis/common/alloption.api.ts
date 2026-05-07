import { Response, api } from '@/apis/https.api';
import { OptionsAll } from "@/types/setting/optionsManager/OptionsManager";

export const getAllOptionsManagers = async (): Promise<OptionsAll> => {
    try {
        const response = await api.get<Response<OptionsAll>>('/public/options/all');

        if (response.data?.success && response.data?.data) {
            return response.data.data;
        }

        if (response.data?.data) {
            return response.data.data;
        }

        return response.data as unknown as OptionsAll;
    } catch (error) {
        console.error('Error fetching all options:', error);
        throw error;
    }
};
