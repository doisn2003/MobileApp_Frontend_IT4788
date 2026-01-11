import React, { createContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import client from '../api/client';
import { initializeNotifications, cleanupNotifications } from '../services/notifications'; // Mở comment nếu đã cài đặt push notification

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [userToken, setUserToken] = useState(null);
    const [userInfo, setUserInfo] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const login = async (email, password) => {
        setIsLoading(true);
        try {
            const response = await client.post('/user/login', { email, password });
            const { token, user } = response.data.data;

            setUserInfo(user);
            setUserToken(token);
            await SecureStore.setItemAsync('userToken', token);
            await SecureStore.setItemAsync('userInfo', JSON.stringify(user));

            console.log('🔐 Login successful, initializing notifications...');
            await initializeNotifications(); // Mở comment nếu đã cài đặt push notification
        } catch (e) {
            console.log(`Login error: ${e}`);
            throw e;
        } finally {
            setIsLoading(false);
        }
    };

    const register = async (userData) => {
        setIsLoading(true);
        try {
            await client.post('/user/', userData);
        } catch (e) {
            console.log(`Register error: ${e}`);
            throw e;
        } finally {
            setIsLoading(false);
        }
    };

    const logout = async () => {
        setIsLoading(true);
        try {
            console.log('🔐 Logging out...');
            await cleanupNotifications(); // Mở comment nếu đã cài đặt
        } catch (e) {
            console.error(e);
        }
        setUserToken(null);
        setUserInfo(null);
        await SecureStore.deleteItemAsync('userToken');
        await SecureStore.deleteItemAsync('userInfo');
        setIsLoading(false);
    };

    // Hàm cập nhật state cục bộ (cần được export)
    const updateUser = async (newUserConfig) => {
        const updatedUser = { ...userInfo, ...newUserConfig };
        setUserInfo(updatedUser);
        await SecureStore.setItemAsync('userInfo', JSON.stringify(updatedUser));
    };

    const isLoggedIn = async () => {
        try {
            setIsLoading(true);
            let userToken = await SecureStore.getItemAsync('userToken');
            let userInfo = await SecureStore.getItemAsync('userInfo');

            if (userToken) {
                setUserToken(userToken);
                setUserInfo(JSON.parse(userInfo));
                await initializeNotifications(); // Mở comment nếu cần
            }
        } catch (e) {
            console.log(`isLoggedIn error: ${e}`);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        isLoggedIn();
    }, []);

    return (
        <AuthContext.Provider value={{ 
            login, 
            logout, 
            register, 
            userToken, 
            userInfo, 
            isLoading, 
            updateUser // <--- [QUAN TRỌNG] Phải thêm vào đây mới dùng được
        }}>
            {children}
        </AuthContext.Provider>
    );
};