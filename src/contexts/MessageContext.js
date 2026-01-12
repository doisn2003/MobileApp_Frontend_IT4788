import React, { createContext, useState, useEffect, useRef, useContext } from 'react';
import io from 'socket.io-client';
import * as SecureStore from 'expo-secure-store';
import { SOCKET_URL } from '../../constants';
import client from '../api/client';

export const MessageContext = createContext();

/**
 * MessageProvider quản lý:
 * - Kết nối socket toàn cục để lắng nghe tin nhắn mới
 * - Trạng thái hasUnreadMessage để hiển thị red dot trên tab "Nhóm"
 */
export const MessageProvider = ({ children }) => {
    const [hasUnreadMessage, setHasUnreadMessage] = useState(false);
    const socketRef = useRef(null);
    const groupIdRef = useRef(null);
    // Dùng ref để tránh stale closure trong socket callback
    const isGroupScreenActiveRef = useRef(false);

    // Khởi tạo socket khi app bắt đầu (sau khi user đăng nhập)
    const initGlobalSocket = async () => {
        try {
            // Nếu đã có socket thì không khởi tạo lại
            if (socketRef.current) return;

            // Lấy thông tin user và group
            const userInfoJson = await SecureStore.getItemAsync('userInfo');
            if (!userInfoJson) return;

            const userObj = JSON.parse(userInfoJson);
            if (!userObj?.id) return;

            // Kiểm tra xem user có group không
            const response = await client.get('/user/group/info');
            if (!response.data.data) return;

            const group = response.data.data;
            groupIdRef.current = group._id;

            socketRef.current = io(SOCKET_URL, {
                transports: ['websocket'],
                jsonp: false
            });

            socketRef.current.on('connect', () => {
                console.log('🔔 Global Socket connected for notifications');
                socketRef.current.emit('join_group', group._id);
            });

            socketRef.current.on('new_message', (msg) => {
                console.log('🔔 New message received (global):', msg.content?.substring(0, 20));

                // Nếu user KHÔNG đang ở màn hình Group -> set unread
                // Dùng ref.current để luôn lấy giá trị mới nhất
                if (!isGroupScreenActiveRef.current) {
                    console.log('🔴 Setting unread badge...');
                    setHasUnreadMessage(true);
                } else {
                    console.log('✅ User đang ở GroupScreen, không set badge');
                }
            });

            socketRef.current.on('disconnect', () => {
                console.log('🔔 Global Socket disconnected');
            });

        } catch (e) {
            // Có thể user chưa có group, bỏ qua lỗi
            console.log('Global socket init skipped:', e.message);
        }
    };

    // Đánh dấu đã đọc khi user vào GroupScreen
    const markAsRead = () => {
        setHasUnreadMessage(false);
    };

    // Gọi khi user vào/rời GroupScreen
    const setGroupScreenActive = (active) => {
        isGroupScreenActiveRef.current = active;
        if (active) {
            // Khi vào GroupScreen, đánh dấu đã đọc
            markAsRead();
        }
    };

    // Cleanup socket khi logout
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
            setHasUnreadMessage,
            markAsRead,
            setGroupScreenActive,
            initGlobalSocket,
            disconnectSocket
        }}>
            {children}
        </MessageContext.Provider>
    );
};

// Custom hook để sử dụng context dễ dàng hơn
export const useMessage = () => useContext(MessageContext);
