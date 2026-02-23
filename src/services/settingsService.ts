import api from './api';

export const settingsService = {
    // Get all settings
    getAll: async (category?: string) => {
        const params = category ? `?category=${category}` : '';
        const response = await api.get(`/settings${params}`);
        return response.data;
    },

    // Get settings by category
    getByCategory: async (category: string) => {
        const response = await api.get(`/settings/category/${category}`);
        return response.data;
    },

    // Get single setting by key
    getByKey: async (key: string) => {
        const response = await api.get(`/settings/key/${key}`);
        return response.data;
    },

    // Create or update single setting
    save: async (setting: {
        setting_key: string;
        setting_value: string;
        setting_category: string;
        description?: string;
    }) => {
        const response = await api.post('/settings', setting);
        return response.data;
    },

    // Bulk update settings
    bulkUpdate: async (settings: Array<{
        setting_key: string;
        setting_value: string;
        setting_category: string;
        description?: string;
    }>) => {
        const response = await api.put('/settings/bulk', { settings });
        return response.data;
    },

    // Delete setting
    delete: async (id: number) => {
        const response = await api.delete(`/settings/${id}`);
        return response.data;
    },
};
