import { createContext, useContext, useState, useEffect } from 'react';
import api from '@/lib/axios';

const AuthContext = createContext({
    user: null,
    login: async () => {},
    logout: async () => {},
    refetchUser: async () => {},
    isLoading: true,
});

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchUser = async () => {
        try {
            const { data } = await api.get('/user');
            setUser(data);
        } catch (error) {
            // If 401, token might be invalid
            if (error.response?.status === 401) {
                localStorage.removeItem('token');
            }
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            fetchUser();
        } else {
            setIsLoading(false);
        }
    }, []);

    const login = async ({ email, password }) => {
        // No need for cookie CSRF with token auth
        const { data } = await api.post('/login', { email, password });
        localStorage.setItem('token', data.access_token);
        await fetchUser();
    };

    const logout = async () => {
        try {
            await api.post('/logout');
        } catch (e) {
            // Ignore logout errors (e.g. if token already expired)
        }
        localStorage.removeItem('token');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, refetchUser: fetchUser, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
