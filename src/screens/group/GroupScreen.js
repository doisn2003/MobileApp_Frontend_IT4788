import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, FlatList, KeyboardAvoidingView, Platform, TextInput as NativeInput, Alert, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Avatar, IconButton, Surface, ActivityIndicator, Button } from 'react-native-paper';
import client from '../../api/client';
import GroupSettings from '../../components/GroupSettings';
import io from 'socket.io-client';
import * as SecureStore from 'expo-secure-store';
import dayjs from 'dayjs';

// TODO: Nên đưa vào biến môi trường hoặc config chung
const SOCKET_URL = 'http://192.168.0.103:3000';

const GroupScreen = () => {
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState('');
    const [hasGroup, setHasGroup] = useState(false);
    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState(null);
    const [groupInfo, setGroupInfo] = useState(null);

    const flatListRef = useRef(null);
    const socketRef = useRef(null);

    useEffect(() => {
        const initScreen = async () => {
            await checkGroupStatus();
        };
        initScreen();

        return () => {
            if (socketRef.current) socketRef.current.disconnect();
        };
    }, []);

    const checkGroupStatus = async () => {
        try {
            setLoading(true);

            // 1. Lấy thông tin User từ SecureStore (Đã được lưu lúc Login)
            const userInfoJson = await SecureStore.getItemAsync('userInfo');
            let userObj = null;
            if (userInfoJson) {
                userObj = JSON.parse(userInfoJson);
                if (userObj.id) userObj._id = userObj.id;
                setCurrentUser(userObj);
            } else {
                console.log('⚠️ Không tìm thấy userInfo trong SecureStore');
            }

            // 2. Get Group Info
            const response = await client.get('/user/group/info');
            if (response.data.data) {
                const group = response.data.data;
                setHasGroup(true);
                setGroupInfo(group);

                // 3. Connect Socket nếu đã có user
                if (userObj && userObj.id) {
                    initSocket(group._id, userObj.id);
                } else {
                    console.log('⚠️ Chưa có User ID để connect socket');
                }

                // 4. Fetch History
                fetchMessages();
            }
        } catch (e) {
            // Code 00096: Không có nhóm
            if (e.response?.data?.code === '00096') {
                setHasGroup(false);
            } else {
                console.log('Error checking group status:', e);
            }
        } finally {
            setLoading(false);
        }
    };

    const initSocket = (groupId, userId) => {
        if (socketRef.current) return;

        socketRef.current = io(SOCKET_URL, {
            transports: ['websocket'],
            jsonp: false
        });

        socketRef.current.on('connect', () => {
            console.log('✅ Socket connected');
            socketRef.current.emit('join_group', groupId);
        });

        socketRef.current.on('new_message', (msg) => {
            console.log('📩 New message received:', msg);
            setMessages(prev => [...prev, msg]);
            // Scroll to bottom
            setTimeout(() => flatListRef.current?.scrollToEnd(), 100);
        });
    };

    const fetchMessages = async () => {
        try {
            const res = await client.get('/user/group/messages');
            if (res.data.data) {
                setMessages(res.data.data);
            }
        } catch (e) {
            console.log('Error fetching messages:', e);
        }
    };

    const handleCreateGroup = async () => {
        try {
            await client.post('/user/group/');
            setHasGroup(true);
            checkGroupStatus(); // Reload info
        } catch (e) {
            console.log(e);
        }
    };

    const sendMessage = () => {
        if (!inputText.trim()) return;
        if (!groupInfo) return;

        if (!currentUser || !currentUser.id) {
            Alert.alert("Lỗi", "Không tìm thấy User ID. Hãy đăng xuất và đăng nhập lại.");
            // Thử lấy lại từ store lần nữa cho chắc
            SecureStore.getItemAsync('userInfo').then(u => {
                if (u) {
                    const parsed = JSON.parse(u);
                    setCurrentUser({ ...parsed, _id: parsed.id });
                    Alert.alert("Thông báo", "Đã tìm thấy lại User ID. Hãy thử gửi lại.");
                }
            });
            return;
        }

        const msgData = {
            groupId: groupInfo._id,
            senderId: currentUser.id, // Dùng currentUser.id (từ login response)
            content: inputText.trim()
        };

        socketRef.current.emit('send_message', msgData);
        setInputText('');
    };

    const renderMessage = ({ item }) => {
        // item.senderId có thể là object (populated) hoặc string.
        const senderId = typeof item.senderId === 'object' ? item.senderId._id : item.senderId;
        const senderName = typeof item.senderId === 'object' ? item.senderId.name : 'Unknown';
        // const senderAvatar = typeof item.senderId === 'object' ? item.senderId.avatar : '';

        // currentUser có thể có id hoặc _id do ta normalize
        const currentUserId = currentUser?.id || currentUser?._id;
        const isMe = currentUserId && senderId === currentUserId;
        const time = dayjs(item.createdAt).format('HH:mm');

        return (
            <View style={[styles.msgRow, isMe ? styles.msgRowRight : styles.msgRowLeft]}>
                {!isMe && (
                    <Avatar.Text size={30} label={senderName ? senderName[0] : '?'} style={{ marginRight: 8, backgroundColor: '#E5E7EB' }} />
                )}
                <View style={[styles.msgBubble, isMe ? styles.msgBubbleRight : styles.msgBubbleLeft]}>
                    {!isMe && <Text style={styles.senderName}>{senderName}</Text>}
                    <Text style={[styles.msgText, isMe ? { color: 'white' } : { color: '#1F2937' }]}>
                        {item.content}
                    </Text>
                    <Text style={[styles.timeText, isMe ? { color: '#E9D5FF' } : { color: 'gray' }]}>
                        {time}
                    </Text>
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
                    <Text style={styles.headerStatus}>{groupInfo?.members?.length || 0} thành viên • Online</Text>
                </View>

                {/* BUTTON QUẢN LÝ NHÓM */}
                <View style={styles.headerBtn}>
                    <GroupSettings />
                </View>
            </View>

            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
            >
                {/* --- CHAT AREA --- */}
                <FlatList
                    ref={flatListRef}
                    style={{ flex: 1 }}
                    data={messages}
                    renderItem={renderMessage}
                    keyExtractor={item => item._id || Math.random().toString()}
                    contentContainerStyle={styles.chatContainer}
                    keyboardShouldPersistTaps="handled"
                    onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
                    onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
                />

                {/* --- INPUT AREA --- */}
                <Surface style={styles.inputBar} elevation={4}>
                    <IconButton icon="image-outline" iconColor="#7C3AED" />
                    <View style={styles.inputWrapper}>
                        <NativeInput
                            value={inputText}
                            onChangeText={setInputText}
                            placeholder="Nhập tin nhắn..."
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
                        onPress={sendMessage}
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
    headerStatus: { fontSize: 12, color: '#10B981' },
    headerBtn: { backgroundColor: '#7C3AED', borderRadius: 20, width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },

    // Chat List
    chatContainer: { padding: 16, paddingBottom: 20 },
    msgRow: { flexDirection: 'row', marginBottom: 12, maxWidth: '80%' },
    msgRowLeft: { alignSelf: 'flex-start' },
    msgRowRight: { alignSelf: 'flex-end', justifyContent: 'flex-end' },

    msgBubble: { padding: 12, borderRadius: 16, minWidth: 100 },
    msgBubbleLeft: { backgroundColor: 'white', borderBottomLeftRadius: 4 },
    msgBubbleRight: { backgroundColor: '#7C3AED', borderBottomRightRadius: 4 },

    senderName: { fontSize: 10, color: 'gray', marginBottom: 2 },
    msgText: { fontSize: 15 },
    timeText: { fontSize: 10, alignSelf: 'flex-end', marginTop: 4 },

    // Input Bar
    inputBar: { flexDirection: 'row', alignItems: 'center', padding: 8, backgroundColor: 'white' },
    inputWrapper: { flex: 1, backgroundColor: '#F3F4F6', borderRadius: 20, paddingHorizontal: 16, marginHorizontal: 8, paddingVertical: 8, maxHeight: 100 },
    textInput: { fontSize: 16, color: '#1F2937', padding: 0 }
});

export default GroupScreen;