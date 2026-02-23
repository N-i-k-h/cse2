import api from './api';

export const authService = {
    // Login
    // For students: identifier = USN, password = USN (default)
    // For others: identifier = email, password = their password
    login: async (identifier: string, password: string, role?: string) => {
        const payload: Record<string, string> = { password };

        if (role === 'student') {
            payload.usn = identifier;
        } else if (role === 'staff' || role === 'hod') {
            // Faculty / HOD login: identifier = Faculty ID, password = Faculty ID
            payload.facultyId = identifier;
        } else {
            // Super Admin: email + password
            payload.email = identifier;
        }

        const response = await api.post('/auth/login', payload);

        if (response.data.token) {
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
        }

        return response.data;
    },

    // Logout
    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    },

    // Get current user
    getCurrentUser: () => {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    },

    // Check if user is authenticated
    isAuthenticated: () => {
        return !!localStorage.getItem('token');
    },

    // Change password
    changePassword: async (userId: string, newPassword: string) => {
        const response = await api.post('/auth/change-password', { userId, newPassword });
        return response.data;
    },
};
