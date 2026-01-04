import React, { useState, useEffect, useCallback } from 'react';
import { View, Modal, StyleSheet, FlatList, Alert, TouchableOpacity } from 'react-native';
import { Text, IconButton, Card, Avatar, TextInput, Button, ActivityIndicator } from 'react-native-paper';
import client from '../api/client';

const GroupSettings = ({ onLeaveGroup }) => {
    const [visible, setVisible] = useState(false);
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [adding, setAdding] = useState(false); // Trạng thái đang hiện input thêm người
    const [newMemberId, setNewMemberId] = useState('');

    const fetchMembers = useCallback(async () => {
        setLoading(true);
        try {
            const response = await client.get('/user/group/');
            if (response.data && response.data.data) {
                setMembers(response.data.data);
            }
        } catch (e) {
            // Lỗi 00096: Chưa có nhóm -> Xử lý ở screen cha hoặc báo lỗi nhẹ
            if (e.response?.data?.code !== '00096') {
                console.log('Fetch members error:', e);
            }
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (visible) {
            fetchMembers();
        }
    }, [visible, fetchMembers]);

    const handleAddMember = async () => {
        if (!newMemberId) return;
        try {
            // POST /user/group/add - Body: { username }
            await client.post('/user/group/add/', 
                { username: newMemberId },
                { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
            );
            Alert.alert('Thành công', 'Đã thêm thành viên');
            setNewMemberId('');
            setAdding(false);
            fetchMembers();
        } catch (e) {
            Alert.alert('Thất bại', e.response?.data?.message || 'Không tìm thấy user');
        }
    };

    const handleRemoveMember = (username) => {
        Alert.alert('Xóa thành viên', `Mời ${username} ra khỏi nhóm?`, [
            { text: 'Hủy', style: 'cancel' },
            { 
                text: 'Đồng ý', 
                onPress: async () => {
                    try {
                        // DELETE /user/group/ - Body: { username }
                        await client.delete('/user/group/', { 
                            data: { username },
                            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
                        });
                        fetchMembers();
                    } catch (e) {
                        Alert.alert('Lỗi', e.response?.data?.message || 'Bạn không phải trưởng nhóm');
                    }
                }
            }
        ]);
    };

    const renderMember = ({ item }) => (
        <View style={styles.memberRow}>
            <View style={{flexDirection: 'row', alignItems: 'center', flex: 1}}>
                {item.image ? (
                    <Avatar.Image size={40} source={{ uri: item.image }} />
                ) : (
                    <Avatar.Text size={40} label={(item.name || item.username || 'U').substring(0,2).toUpperCase()} />
                )}
                <View style={{marginLeft: 12}}>
                    <Text style={styles.memberName}>{item.name || item.username}</Text>
                    <Text style={styles.memberEmail}>{item.email}</Text>
                </View>
            </View>
            <IconButton icon="close" iconColor="#EF4444" size={20} onPress={() => handleRemoveMember(item.username)} />
        </View>
    );

    return (
        <>
            {/* Nút bấm để mở Modal - Hiển thị ở góc màn hình cha */}
            <TouchableOpacity style={styles.triggerBtn} onPress={() => setVisible(true)}>
                <IconButton icon="account-group" iconColor="white" size={24} />
            </TouchableOpacity>

            <Modal visible={visible} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Thành viên nhóm ({members.length})</Text>
                            <IconButton icon="close" onPress={() => setVisible(false)} />
                        </View>

                        {loading ? (
                            <ActivityIndicator style={{margin: 20}} color="#7C3AED" />
                        ) : (
                            <FlatList 
                                data={members}
                                renderItem={renderMember}
                                keyExtractor={item => item.username || Math.random().toString()}
                                contentContainerStyle={{padding: 16}}
                                ListEmptyComponent={<Text style={styles.emptyText}>Nhóm chưa có thành viên.</Text>}
                            />
                        )}

                        <View style={styles.footer}>
                            {adding ? (
                                <View style={styles.addSection}>
                                    <TextInput 
                                        mode="outlined" 
                                        placeholder="Nhập username..." 
                                        value={newMemberId}
                                        onChangeText={setNewMemberId}
                                        style={{flex: 1, backgroundColor: 'white', height: 40}}
                                        dense
                                    />
                                    <IconButton icon="check" mode="contained" containerColor="#7C3AED" iconColor="white" size={20} onPress={handleAddMember} />
                                    <IconButton icon="close" size={20} onPress={() => setAdding(false)} />
                                </View>
                            ) : (
                                <Button mode="contained" icon="account-plus" onPress={() => setAdding(true)} style={styles.addBtn}>
                                    Thêm thành viên
                                </Button>
                            )}
                        </View>
                    </View>
                </View>
            </Modal>
        </>
    );
};

const styles = StyleSheet.create({
    triggerBtn: {
        // Nút này sẽ được style lại ở màn hình cha nếu cần
    },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
    modalContent: { backgroundColor: 'white', borderRadius: 16, height: '70%', overflow: 'hidden' },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 10, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
    modalTitle: { fontSize: 18, fontWeight: 'bold', marginLeft: 10 },
    memberRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
    memberName: { fontWeight: 'bold', fontSize: 14 },
    memberEmail: { fontSize: 12, color: 'gray' },
    emptyText: { textAlign: 'center', color: 'gray', marginTop: 20 },
    footer: { padding: 16, borderTopWidth: 1, borderTopColor: '#F3F4F6' },
    addBtn: { backgroundColor: '#7C3AED' },
    addSection: { flexDirection: 'row', alignItems: 'center', gap: 5 }
});

export default GroupSettings;