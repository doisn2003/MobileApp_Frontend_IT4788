import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, FlatList, KeyboardAvoidingView, Platform, TextInput as NativeInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Avatar, IconButton, Surface } from 'react-native-paper';
import client from '../../api/client';
import GroupSettings from '../../components/GroupSettings';

// Dữ liệu giả lập cho Chat
const MOCK_MESSAGES = [
    { id: '1', text: 'Chào cả nhà!', sender: 'nguyenvanA', isMe: false, time: '10:00' },
    { id: '2', text: 'Hôm nay ăn gì nhỉ?', sender: 'nguyenvanB', isMe: false, time: '10:05' },
    { id: '3', text: 'Để mình xem tủ lạnh còn gì đã', sender: 'Me', isMe: true, time: '10:06' },
];

const GroupScreen = () => {
    const [messages, setMessages] = useState(MOCK_MESSAGES);
    const [inputText, setInputText] = useState('');
    const [hasGroup, setHasGroup] = useState(false);
    const flatListRef = useRef(null);

    // Kiểm tra xem user có nhóm chưa để hiển thị giao diện phù hợp
    useEffect(() => {
        checkGroupStatus();
    }, []);

    const checkGroupStatus = async () => {
        try {
            const response = await client.get('/user/group/');
            if (response.data.data) setHasGroup(true);
        } catch (e) {
            if (e.response?.data?.code === '00096') setHasGroup(false);
        }
    };

    const handleCreateGroup = async () => {
        try {
            await client.post('/user/group/');
            setHasGroup(true);
        } catch (e) {
            console.log(e);
        }
    };

    const sendMessage = () => {
        if (!inputText.trim()) return;
        
        // Giả lập gửi tin nhắn (Cần tích hợp Socket.io tại đây)
        const newMsg = {
            id: Date.now().toString(),
            text: inputText,
            sender: 'Me',
            isMe: true,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        
        setMessages([...messages, newMsg]);
        setInputText('');
        
        // Scroll xuống dưới cùng
        setTimeout(() => flatListRef.current?.scrollToEnd(), 100);
    };

    // Render 1 dòng tin nhắn
    const renderMessage = ({ item }) => {
        return (
            <View style={[styles.msgRow, item.isMe ? styles.msgRowRight : styles.msgRowLeft]}>
                {!item.isMe && (
                    <Avatar.Text size={30} label={item.sender[0]} style={{marginRight: 8, backgroundColor: '#E5E7EB'}} />
                )}
                <View style={[styles.msgBubble, item.isMe ? styles.msgBubbleRight : styles.msgBubbleLeft]}>
                    {!item.isMe && <Text style={styles.senderName}>{item.sender}</Text>}
                    <Text style={[styles.msgText, item.isMe ? {color: 'white'} : {color: '#1F2937'}]}>
                        {item.text}
                    </Text>
                    <Text style={[styles.timeText, item.isMe ? {color: '#E9D5FF'} : {color: 'gray'}]}>
                        {item.time}
                    </Text>
                </View>
            </View>
        );
    };

    // Giao diện khi chưa có nhóm
    if (!hasGroup) {
        return (
            <SafeAreaView style={[styles.container, {justifyContent: 'center', alignItems: 'center'}]} edges={['top', 'left', 'right']}>
                <IconButton icon="account-group-outline" size={80} iconColor="#D1D5DB" />
                <Text style={{fontSize: 18, color: 'gray', marginBottom: 20}}>Bạn chưa tham gia nhóm nào</Text>
                <IconButton 
                    mode="contained" 
                    containerColor="#7C3AED" 
                    iconColor="white" 
                    icon="plus" 
                    size={30} 
                    onPress={handleCreateGroup} 
                />
                <Text style={{marginTop: 10, color: '#7C3AED', fontWeight: 'bold'}}>Tạo nhóm mới</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
            {/* --- HEADER --- */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.headerTitle}>Gia Đình Của Tôi</Text>
                    <Text style={styles.headerStatus}>3 thành viên • Online</Text>
                </View>
                
                {/* BUTTON QUẢN LÝ NHÓM (COMPONENT) */}
                <View style={styles.headerBtn}>
                    <GroupSettings />
                </View>
            </View>

            {/* --- CHAT AREA --- */}
            <FlatList
                ref={flatListRef}
                data={messages}
                renderItem={renderMessage}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.chatContainer}
                keyboardShouldPersistTaps="handled"
            />

            {/* --- INPUT AREA --- */}
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}>
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
    headerStatus: { fontSize: 12, color: '#10B981' }, // Màu xanh lá báo online
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