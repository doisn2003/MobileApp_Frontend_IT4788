import React, { createContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import client from '../api/client';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [userToken, setUserToken] = useState(null);
    const [userInfo, setUserInfo] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const login = async (email, password) => {
        setIsLoading(true);
        try {
            const response = await client.post('/user/login', { email, password });

            // Based on API Doc: response.data.data = { token: "...", user: { ... } }
            const { token, user } = response.data.data;

            setUserInfo(user);
            setUserToken(token);
            await SecureStore.setItemAsync('userToken', token);
            await SecureStore.setItemAsync('userInfo', JSON.stringify(user));
        } catch (e) {
            console.log(`Login error: ${e}`);
            throw e; // Helper components can catch this to show alerts
        } finally {
            setIsLoading(false);
        }
    };

    const register = async (userData) => {
        setIsLoading(true);
        try {
            await client.post('/user/', userData);
            // Auto login or ask user to login? API returns 201 Created.
            // Usually we redirect to login, but let's see. 
            // For now just return success.
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
            // Optional: Call logout API if exists
            // await client.post('/user/logout'); 
        } catch (e) {
            console.error(e);
        }
        setUserToken(null);
        setUserInfo(null);
        await SecureStore.deleteItemAsync('userToken');
        await SecureStore.deleteItemAsync('userInfo');
        setIsLoading(false);
    };


    // Hàm MỚI: Cập nhật thông tin user cục bộ sau khi gọi API Edit
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
        <AuthContext.Provider value={{ login, logout, register, userToken, userInfo, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
};
