import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';
import { toast } from 'sonner';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const response = await api.get('/auth/me');
                    setUser(response.data.user);
                } catch (error) {
                    console.error('Auth check failed', error);
                    localStorage.removeItem('token');
                }
            }
            setLoading(false);
        };
        checkAuth();
    }, []);

    const login = async (email, password) => {
        try {
            const response = await api.post('/auth/login', { email, password });
            localStorage.setItem('token', response.data.token);
            setUser(response.data.user);
            toast.success('Connexion réussie');
            return response.data.user;
        } catch (error) {
            toast.error(error.response?.data?.message || 'Erreur de connexion');
            return null;
        }
    };

    const logout = async () => {
        try {
            await api.post('/auth/logout');
        } catch (error) {
            // Even if API call fails, clear local state
        } finally {
            localStorage.removeItem('token');
            setUser(null);
            toast.info('Vous êtes déconnecté');
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, setUser }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
