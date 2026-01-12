import { useRef, useEffect, useCallback, useState } from 'react';
import io from 'socket.io-client';
import { useNetwork } from '../contexts/NetworkContext';
import { 
    addPendingMessage, 
    getPendingMessages, 
    markMessageSent,
    clearSentMessages 
} from '../services/offline';
import { SOCKET_URL } from '../../constants';

/**
 * Hook quản lý Socket với offline support
 */
export function useOfflineSocket(groupId, userId, onNewMessage) {
    const socketRef = useRef(null);
    const onNewMessageRef = useRef(onNewMessage);
    const isSyncingRef = useRef(false); // Prevent duplicate sync
    const { isConnected } = useNetwork();
    const [isSocketConnected, setIsSocketConnected] = useState(false);
    
    // Cập nhật ref khi callback thay đổi
    useEffect(() => {
        onNewMessageRef.current = onNewMessage;
    }, [onNewMessage]);
    
    // Đồng bộ tin nhắn pending - với lock để tránh gọi 2 lần
    const syncPendingMessages = useCallback(async () => {
        // Prevent duplicate calls
        if (isSyncingRef.current) {
            console.log('⏳ Already syncing, skipping...');
            return;
        }
        
        if (!socketRef.current?.connected || !groupId) return;
        
        const pendingMessages = await getPendingMessages(groupId);
        
        if (pendingMessages.length === 0) {
            console.log('📭 No pending messages to sync');
            return;
        }
        
        isSyncingRef.current = true;
        console.log(`🚀 Syncing ${pendingMessages.length} pending messages...`);
        
        for (const msg of pendingMessages) {
            try {
                socketRef.current.emit('send_message', {
                    groupId: msg.group_id,
                    senderId: msg.sender_id,
                    content: msg.content,
                    tempId: msg.temp_id,
                });
                
                // Đánh dấu đã gửi NGAY LẬP TỨC để tránh gửi lại
                await markMessageSent(msg.temp_id);
                console.log(`📤 Sent & marked: ${msg.temp_id}`);
            } catch (error) {
                console.error('Error syncing message:', error);
            }
        }
        
        // Xóa các tin đã gửi
        setTimeout(async () => {
            await clearSentMessages();
            isSyncingRef.current = false;
        }, 2000);
    }, [groupId]);
    
    // Khởi tạo socket - KHÔNG phụ thuộc vào onNewMessage
    const initSocket = useCallback(() => {
        if (!groupId || !userId) return;
        
        // Nếu đã có socket connected, không tạo mới
        if (socketRef.current?.connected) {
            console.log('🔌 Socket already connected, skipping init');
            return;
        }
        
        // Nếu đang có socket instance, disconnect trước
        if (socketRef.current) {
            console.log('🔌 Disconnecting old socket...');
            socketRef.current.disconnect();
            socketRef.current = null;
        }
        
        console.log('🔌 Initializing new socket...');
        
        socketRef.current = io(SOCKET_URL, {
            transports: ['websocket'],
            jsonp: false,
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 2000,
        });
        
        socketRef.current.on('connect', () => {
            console.log('✅ Socket connected');
            setIsSocketConnected(true);
            socketRef.current.emit('join_group', groupId);
            
            // Sync pending messages khi connect
            syncPendingMessages();
        });
        
        socketRef.current.on('disconnect', (reason) => {
            console.log('❌ Socket disconnected:', reason);
            setIsSocketConnected(false);
            isSyncingRef.current = false; // Reset sync lock
        });
        
        socketRef.current.on('new_message', (msg) => {
            console.log('📩 New message received:', msg);
            // Dùng ref để luôn có callback mới nhất
            onNewMessageRef.current?.(msg);
        });
        
        socketRef.current.on('message_sent', async (data) => {
            console.log('✅ Message confirmed by server:', data.tempId);
            if (data.tempId) {
                await markMessageSent(data.tempId);
            }
        });
        
        socketRef.current.on('connect_error', (error) => {
            console.log('❌ Socket connection error:', error.message);
            setIsSocketConnected(false);
        });
    }, [groupId, userId, syncPendingMessages]); // KHÔNG có onNewMessage
    
    // Gửi tin nhắn (online hoặc offline)
    const sendMessage = useCallback(async (content) => {
        if (!groupId || !userId || !content.trim()) return null;
        
        const tempId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const timestamp = Date.now();
        
        const localMessage = {
            _id: tempId,
            tempId: tempId,
            groupId: groupId,
            senderId: userId,
            content: content.trim(),
            createdAt: new Date(timestamp).toISOString(),
            pending: true,
        };
        
        if (isConnected && socketRef.current?.connected) {
            console.log('📤 Sending message online with tempId:', tempId);
            socketRef.current.emit('send_message', {
                groupId,
                senderId: userId,
                content: content.trim(),
                tempId,
            });
            // KHÔNG lưu vào SQLite khi online
        } else {
            console.log('📝 Queueing message offline:', tempId);
            await addPendingMessage(tempId, groupId, userId, content.trim());
        }
        
        return localMessage;
    }, [groupId, userId, isConnected]);
    
    // Kết nối socket khi có mạng
    useEffect(() => {
        if (isConnected && groupId && userId) {
            initSocket();
        }
    }, [isConnected, initSocket, groupId, userId]);
    
    // Cleanup khi unmount
    useEffect(() => {
        return () => {
            if (socketRef.current) {
                console.log('🔌 Cleanup: Disconnecting socket...');
                socketRef.current.disconnect();
                socketRef.current = null;
            }
        };
    }, []);
    
    // XÓA useEffect sync khi isConnected && isSocketConnected thay đổi
    // Vì đã sync trong event 'connect' rồi
    
    return {
        isSocketConnected,
        sendMessage,
        syncPendingMessages,
    };
}