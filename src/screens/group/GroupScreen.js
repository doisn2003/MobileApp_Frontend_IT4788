import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, StyleSheet, FlatList, KeyboardAvoidingView, Platform, TextInput as NativeInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Avatar, IconButton, Surface, ActivityIndicator } from 'react-native-paper';

import client from '../../api/client';
import GroupSettings from '../../components/GroupSettings';
import * as SecureStore from 'expo-secure-store';
import dayjs from 'dayjs';
import { useFocusEffect } from '@react-navigation/native';
import { useOfflineSocket } from '../../hooks/useOfflineSocket';
import { useNetwork } from '../../contexts/NetworkContext';
import { useMessage } from '../../contexts/MessageContext';
import { getPendingMessages } from '../../services/offline';

const GroupScreen = () => {
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState('');
    const [hasGroup, setHasGroup] = useState(false);
    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState(null);
    const [groupInfo, setGroupInfo] = useState(null);

    const flatListRef = useRef(null);
    const { isConnected } = useNetwork();
    const { setGroupScreenActive, initGlobalSocket, markAsRead } = useMessage();

    // Callback khi nhận tin nhắn mới
    const handleNewMessage = useCallback((msg) => {
        setMessages(prev => {
            // Lấy senderId từ message
            const msgSenderId = typeof msg.senderId === 'object' 
                ? msg.senderId._id 
                : msg.senderId;
            
            // Kiểm tra nếu tin nhắn từ chính mình và đã có trong list (pending)
            const currentUserId = currentUser?.id || currentUser?._id;
            const isFromMe = msgSenderId === currentUserId;
            
            // Tìm tin nhắn pending tương ứng (cùng content, cùng sender, trong khoảng 30s)
            const pendingIndex = prev.findIndex(m => {
                if (!m.pending) return false;
                if (!isFromMe) return false;
                
                // Match by tempId if exists
                if (msg.tempId && m.tempId === msg.tempId) return true;
                
                // Match by content + sender + time proximity
                const timeDiff = Math.abs(new Date(m.createdAt) - new Date(msg.createdAt));
                return m.content === msg.content && timeDiff < 30000; // 30 seconds
            });
            
            if (pendingIndex !== -1) {
                // Cập nhật tin nhắn pending thành confirmed
                const newMessages = [...prev];
                newMessages[pendingIndex] = { 
                    ...msg, 
                    pending: false,
                    _id: msg._id // Dùng ID thật từ server
                };
                return newMessages;
            }
            
            // Kiểm tra duplicate bằng _id
            const existsById = prev.some(m => m._id === msg._id);
            if (existsById) {
                return prev; // Đã tồn tại, không thêm
            }
            
            // Tin nhắn mới từ người khác
            return [...prev, { ...msg, pending: false }];
        });
        
        setTimeout(() => flatListRef.current?.scrollToEnd(), 100);
    }, [currentUser]);

    // Sử dụng hook offline socket
    const { isSocketConnected, sendMessage } = useOfflineSocket(
        groupInfo?._id,
        currentUser?.id,
        handleNewMessage
    );

    // Quản lý trạng thái active của Group Screen
    useFocusEffect(
        useCallback(() => {
            setGroupScreenActive(true);
            markAsRead();

            return () => {
                setGroupScreenActive(false);
            };
        }, [])
    );

    // Khởi tạo màn hình
    useEffect(() => {
        const initScreen = async () => {
            await checkGroupStatus();
            await initGlobalSocket();
        };
        initScreen();
    }, []);

    const checkGroupStatus = async () => {
        try {
            setLoading(true);

            // 1. Lấy thông tin User từ SecureStore
            const userInfoJson = await SecureStore.getItemAsync('userInfo');
            let userObj = null;
            if (userInfoJson) {
                userObj = JSON.parse(userInfoJson);
                if (userObj.id) userObj._id = userObj.id;
                setCurrentUser(userObj);
            }

            // 2. Get Group Info
            const response = await client.get('/user/group/info');
            if (response.data.data) {
                const group = response.data.data;
                setHasGroup(true);
                setGroupInfo(group);

                // 3. Fetch History
                await fetchMessages(group._id);
            }
        } catch (e) {
            if (e.response?.data?.code === '00096') {
                setHasGroup(false);
            } else {
                console.log('Error checking group status:', e);
            }
        } finally {
            setLoading(false);
        }
    };

    const fetchMessages = async (groupId) => {
        try {
            const res = await client.get('/user/group/messages');
            let serverMessages = res.data.data || [];
            
            // Merge với pending messages local
            const pendingMessages = await getPendingMessages(groupId);
            const pendingFormatted = pendingMessages.map(msg => ({
                _id: msg.temp_id,
                tempId: msg.temp_id,
                senderId: msg.sender_id,
                content: msg.content,
                createdAt: new Date(msg.created_at).toISOString(),
                pending: true,
            }));
            
            // Gộp và sắp xếp theo thời gian
            const allMessages = [...serverMessages, ...pendingFormatted].sort(
                (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
            );
            
            setMessages(allMessages);
        } catch (e) {
            console.log('Error fetching messages:', e);
            
            // Offline: Chỉ hiển thị pending messages
            if (groupId) {
                const pendingMessages = await getPendingMessages(groupId);
                const pendingFormatted = pendingMessages.map(msg => ({
                    _id: msg.temp_id,
                    tempId: msg.temp_id,
                    senderId: msg.sender_id,
                    content: msg.content,
                    createdAt: new Date(msg.created_at).toISOString(),
                    pending: true,
                }));
                setMessages(pendingFormatted);
            }
        }
    };

    const handleCreateGroup = async () => {
        try {
            await client.post('/user/group/');
            setHasGroup(true);
            checkGroupStatus();
        } catch (e) {
            console.log(e);
        }
    };

    const handleSendMessage = async () => {
        if (!inputText.trim()) return;
        
        const localMessage = await sendMessage(inputText.trim());
        
        if (localMessage) {
            // Thêm tin nhắn local vào list ngay lập tức
            setMessages(prev => [...prev, localMessage]);
            setInputText('');
            setTimeout(() => flatListRef.current?.scrollToEnd(), 100);
        }
    };

    const renderMessage = ({ item }) => {
        const senderId = typeof item.senderId === 'object' ? item.senderId._id : item.senderId;
        const senderName = typeof item.senderId === 'object' ? item.senderId.name : 'Unknown';
        const currentUserId = currentUser?.id || currentUser?._id;
        const isMe = currentUserId && senderId === currentUserId;
        const time = dayjs(item.createdAt).format('HH:mm');
        const isPending = item.pending;

        return (
            <View style={[styles.msgRow, isMe ? styles.msgRowRight : styles.msgRowLeft]}>
                {!isMe && (
                    <Avatar.Text 
                        size={30} 
                        label={senderName ? senderName[0] : '?'} 
                        style={{ marginRight: 8, backgroundColor: '#E5E7EB' }} 
                    />
                )}
                <View style={[
                    styles.msgBubble, 
                    isMe ? styles.msgBubbleRight : styles.msgBubbleLeft,
                    isPending && styles.msgBubblePending
                ]}>
                    {!isMe && <Text style={styles.senderName}>{senderName}</Text>}
                    <Text style={[styles.msgText, isMe ? { color: 'white' } : { color: '#1F2937' }]}>
                        {item.content}
                    </Text>
                    <View style={styles.msgFooter}>
                        <Text style={[styles.timeText, isMe ? { color: '#E9D5FF' } : { color: 'gray' }]}>
                            {time}
                        </Text>
                        {isPending && (
                            <Text style={styles.pendingText}>⏳</Text>
                        )}
                    </View>
                </View>
            </View>
        );
    };

    if (loading) {
        return (
            <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color="#7C3AED" />
            </SafeAreaView>
        );
    }

    if (!hasGroup) {
        return (
            <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]} edges={['top', 'left', 'right']}>
                <IconButton icon="account-group-outline" size={80} iconColor="#D1D5DB" />
                <Text style={{ fontSize: 18, color: 'gray', marginBottom: 20 }}>Bạn chưa tham gia nhóm nào</Text>
                <IconButton
                    mode="contained"
                    containerColor="#7C3AED"
                    iconColor="white"
                    icon="plus"
                    size={30}
                    onPress={handleCreateGroup}
                />
                <Text style={{ marginTop: 10, color: '#7C3AED', fontWeight: 'bold' }}>Tạo nhóm mới</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
            {/* --- HEADER --- */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.headerTitle}>{groupInfo ? groupInfo.name : 'Nhóm'}</Text>
                    <Text style={[
                        styles.headerStatus,
                        { color: isSocketConnected ? '#10B981' : '#F59E0B' }
                    ]}>
                        {groupInfo?.members?.length || 0} thành viên • {isSocketConnected ? 'Online' : 'Offline'}
                    </Text>
                </View>

                <View style={styles.headerBtn}>
                    <GroupSettings />
                </View>
            </View>

            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
            >
                <FlatList
                    ref={flatListRef}
                    style={{ flex: 1 }}
                    data={messages}
                    renderItem={renderMessage}
                    keyExtractor={item => item._id || item.tempId || Math.random().toString()}
                    contentContainerStyle={styles.chatContainer}
                    keyboardShouldPersistTaps="handled"
                    onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
                    onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
                />

                <Surface style={styles.inputBar} elevation={4}>
                    <IconButton icon="image-outline" iconColor="#7C3AED" />
                    <View style={styles.inputWrapper}>
                        <NativeInput
                            value={inputText}
                            onChangeText={setInputText}
                            placeholder={isConnected ? "Nhập tin nhắn..." : "Nhập tin nhắn (offline)..."}
                            placeholderTextColor="#9CA3AF"
                            style={styles.textInput}
                            multiline
                        />
                    </View>
                    <IconButton
                        icon="send"
                        mode="contained"
                        containerColor={inputText ? '#7C3AED' : '#E5E7EB'}
                        iconColor="white"
                        disabled={!inputText}
                        onPress={handleSendMessage}
                    />
                </Surface>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F9FAFB' },

    // Header
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 12, backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
    headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#111827' },
    headerStatus: { fontSize: 12 },
    headerBtn: { backgroundColor: '#7C3AED', borderRadius: 20, width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },

    // Chat List
    chatContainer: { padding: 16, paddingBottom: 20 },
    msgRow: { flexDirection: 'row', marginBottom: 12, maxWidth: '80%' },
    msgRowLeft: { alignSelf: 'flex-start' },
    msgRowRight: { alignSelf: 'flex-end', justifyContent: 'flex-end' },

    msgBubble: { padding: 12, borderRadius: 16, minWidth: 100 },
    msgBubbleLeft: { backgroundColor: 'white', borderBottomLeftRadius: 4 },
    msgBubbleRight: { backgroundColor: '#7C3AED', borderBottomRightRadius: 4 },
    msgBubblePending: { opacity: 0.7 },

    senderName: { fontSize: 10, color: 'gray', marginBottom: 2 },
    msgText: { fontSize: 15 },
    msgFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', marginTop: 4 },
    timeText: { fontSize: 10 },
    pendingText: { fontSize: 10, marginLeft: 4 },

    // Input Bar
    inputBar: { flexDirection: 'row', alignItems: 'center', padding: 8, backgroundColor: 'white' },
    inputWrapper: { flex: 1, backgroundColor: '#F3F4F6', borderRadius: 20, paddingHorizontal: 16, marginHorizontal: 8, paddingVertical: 8, maxHeight: 100 },
    textInput: { fontSize: 16, color: '#1F2937', padding: 0 }
});

export default GroupScreen;