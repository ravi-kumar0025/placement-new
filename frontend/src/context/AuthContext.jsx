/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(localStorage.getItem('jwtToken') || null);
    const [loading, setLoading] = useState(true);

    // Rehydrate full user object from localStorage (stored at login time)
    const [user, setUser] = useState(() => {
        try {
            const stored = localStorage.getItem('userData');
            return stored ? JSON.parse(stored) : null;
        } catch {
            return null;
        }
    });

    useEffect(() => {
        queueMicrotask(() => {
            if (!token) {
                setUser(null);
                localStorage.removeItem('userData');
            }
            setLoading(false);
        });
    }, [token]);

    const login = (newToken, userData) => {
        localStorage.setItem('jwtToken', newToken);
        // Persist the full user profile so department/program/graduationYear survive page reloads
        if (userData) {
            localStorage.setItem('userData', JSON.stringify(userData));
        }
        setToken(newToken);
        setUser(userData);
    };

    const logout = () => {
        localStorage.removeItem('jwtToken');
        localStorage.removeItem('userData');
        setToken(null);
        setUser(null);
    };

    const updateUser = (newUserData) => {
        setUser((prev) => {
            const updated = { ...prev, ...newUserData };
            localStorage.setItem('userData', JSON.stringify(updated));
            return updated;
        });
    };

    return (
        <AuthContext.Provider value={{ user, token, loading, login, logout, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
};
