import React, { createContext, useState, useEffect, useRef, useContext } from 'react';
import io from 'socket.io-client';
import * as SecureStore from 'expo-secure-store';
import { SOCKET_URL } from '../../constants';
import onlineClient from '../api/client.online';

export const MessageContext = createContext();

export const MessageProvider = ({ children }) => {
    const [hasUnreadMessage, setHasUnreadMessage] = useState(false);
    const socketRef = useRef(null);
    const isGroupScreenActiveRef = useRef(false);

    const initGlobalSocket = async () => {
        try {
            if (socketRef.current) return;

            const userInfoJson = await SecureStore.getItemAsync('userInfo');
            if (!userInfoJson) return;

            const userObj = JSON.parse(userInfoJson);
            if (!userObj?.id) return;

            const response = await onlineClient.get('/user/group/info');
            if (!response.data.data) return;

            const group = response.data.data;

            socketRef.current = io(SOCKET_URL, {
                transports: ['websocket'],
                jsonp: false
            });

            socketRef.current.on('connect', () => {
                console.log('🔔 Global Socket connected for notifications');
                socketRef.current.emit('join_group', group._id);
            });

            socketRef.current.on('new_message', (msg) => {
                // Chỉ set badge nếu user KHÔNG đang ở GroupScreen
                if (!isGroupScreenActiveRef.current) {
                    console.log('🔴 New message while away, setting badge');
                    setHasUnreadMessage(true);
                }
            });

        } catch (e) {
            console.log('Global socket init skipped:', e.message);
        }
    };

    const markAsRead = () => setHasUnreadMessage(false);

    const setGroupScreenActive = (active) => {
        isGroupScreenActiveRef.current = active;
        if (active) markAsRead();
    };

    const disconnectSocket = () => {
        if (socketRef.current) {
            socketRef.current.disconnect();
            socketRef.current = null;
        }
        setHasUnreadMessage(false);
    };

    return (
        <MessageContext.Provider value={{
            hasUnreadMessage,
            markAsRead,
            setGroupScreenActive,
            initGlobalSocket,
            disconnectSocket
        }}>
            {children}
        </MessageContext.Provider>
    );
};

export const useMessage = () => useContext(MessageContext);