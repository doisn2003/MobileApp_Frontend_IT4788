import React, { useState, useEffect } from 'react';
import { View, Modal, StyleSheet, Alert, ScrollView, TouchableOpacity } from 'react-native';
import { Text, TextInput, Button, RadioButton } from 'react-native-paper';
import dayjs from 'dayjs';
import client from '../api/client';
import DatePicker from './DatePicker'; // <--- IMPORT MỚI

// --- MODAL TẠO DANH SÁCH MỚI ---
export const CreateListModal = ({ visible, onClose, onSuccess, selectedDate }) => {
    const [name, setName] = useState('');
    const [note, setNote] = useState('');
    const [assignee, setAssignee] = useState('');
    
    // State ngày dạng chuỗi để gửi API - sử dụng selectedDate từ parent hoặc hôm nay
    const [dateStr, setDateStr] = useState(dayjs().format('YYYY-MM-DD')); 
    
    const [members, setMembers] = useState([]);

    useEffect(() => {
        if (visible) {
            fetchMembers();
            // CẬP NHẬT ngày từ selectedDate khi modal mở
            if (selectedDate) {
                setDateStr(dayjs(selectedDate).format('YYYY-MM-DD'));
            } else {
                setDateStr(dayjs().format('YYYY-MM-DD'));
            }
        }
    }, [visible, selectedDate]);

    const fetchMembers = async () => {
        try {
            const response = await client.get('/user/group/');
            if (response.data && response.data.data) {
                setMembers(response.data.data);
            }
        } catch (e) {
            if (e.response?.data?.code !== '00096') {
                console.log('Error fetching group:', e);
            }
        }
    };

    const handleCreate = async () => {
        if (!name) return Alert.alert('Lỗi', 'Vui lòng nhập tên danh sách');

        try {
            const params = new URLSearchParams();
            params.append('name', name);
            params.append('date', dateStr); // Gửi chuỗi ngày đã chọn
            params.append('assignToUsername', assignee);
            params.append('note', note);
            
            await client.post('/shopping/', params.toString(), {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            });

            Alert.alert('Thành công', 'Đã tạo danh sách mua sắm');
            onSuccess();
            onClose();
            
            setName(''); setNote(''); setAssignee(''); 
            setDateStr(dayjs().format('YYYY-MM-DD'));
        } catch (e) {
            console.log("Create List Error:", e.response?.data);
            Alert.alert('Thất bại', e.response?.data?.message || 'Lỗi server');
        }
    };

    return (
        <Modal visible={visible} animationType="slide" transparent>
            <View style={styles.overlay}>
                <View style={styles.container}>
                    <Text style={styles.title}>Tạo Danh Sách Mới</Text>
                    
                    <TextInput label="Tên (vd: Tiệc cuối tuần)" value={name} onChangeText={setName} style={styles.input} mode="outlined"/>
                    
                    {/* THAY THẾ TEXTINPUT BẰNG DATEPICKER */}
                    <View style={styles.dateRow}>
                        <Text style={styles.label}>Ngày đi chợ:</Text>
                        <DatePicker 
                            date={dayjs(dateStr)} // Chuyển chuỗi sang dayjs object cho component
                            onDateChange={(d) => setDateStr(d.format('YYYY-MM-DD'))} // Chuyển dayjs về chuỗi
                        />
                    </View>

                    <TextInput label="Ghi chú" value={note} onChangeText={setNote} style={styles.input} mode="outlined"/>

                    <Text style={styles.label}>Gán cho:</Text>
                    <ScrollView style={styles.memberList}>
                        <RadioButton.Group onValueChange={setAssignee} value={assignee}>
                            {members.length > 0 ? members.map(m => (
                                <RadioButton.Item 
                                    key={m.username} 
                                    label={m.name || m.username} 
                                    value={m.username} 
                                />
                            )) : <Text style={styles.hint}>Bạn chưa có nhóm (Tạo ở tab Nhóm)</Text>}
                        </RadioButton.Group>
                    </ScrollView>

                    <View style={styles.row}>
                        <Button onPress={onClose} style={{flex:1}}>Hủy</Button>
                        <Button mode="contained" onPress={handleCreate} style={{flex:1}}>Tạo</Button>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

// ... (AddTaskModal giữ nguyên)
export const AddTaskModal = ({ visible, onClose, listId, onSuccess }) => {
    const [foodName, setFoodName] = useState('');
    const [quantity, setQuantity] = useState('1');

    const handleAddTask = async () => {
        if (!foodName) return;

        try {
            const payload = {
                listId: listId,
                tasks: [
                    { foodName, quantity: quantity.toString() }
                ]
            };

            await client.post('/shopping/task/', payload, {
                headers: { 'Content-Type': 'application/json' }
            });

            onSuccess();
            setFoodName(''); setQuantity('1');
            
            Alert.alert('Đã thêm', 'Bạn có muốn thêm món khác không?', [
                { text: 'Xong', onPress: onClose },
                { text: 'Thêm tiếp' }
            ]);

        } catch (e) {
            Alert.alert('Lỗi', e.response?.data?.message || 'Không thể thêm món');
        }
    };

    return (
        <Modal visible={visible} animationType="fade" transparent>
            <View style={styles.overlay}>
                <View style={styles.container}>
                    <Text style={styles.title}>Thêm món cần mua</Text>
                    <TextInput label="Tên món" value={foodName} onChangeText={setFoodName} style={styles.input} mode="outlined"/>
                    <TextInput label="Số lượng" value={quantity} onChangeText={setQuantity} style={styles.input} mode="outlined"/>
                    <View style={styles.row}>
                        <Button onPress={onClose} style={{flex:1}}>Đóng</Button>
                        <Button mode="contained" onPress={handleAddTask} style={{flex:1}}>Thêm</Button>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
    container: { backgroundColor: 'white', padding: 20, borderRadius: 16 },
    title: { fontSize: 20, fontWeight: 'bold', marginBottom: 16, textAlign: 'center' },
    input: { marginBottom: 12, backgroundColor: 'white' },
    row: { flexDirection: 'row', gap: 10, marginTop: 10 },
    label: { fontWeight: 'bold', marginTop: 10, marginBottom: 5 },
    hint: { padding: 10, fontStyle: 'italic', color: 'gray' },
    memberList: { maxHeight: 120, marginBottom: 10, borderColor: '#E5E7EB', borderWidth: 1, borderRadius: 8 },
    // Style mới cho hàng chứa DatePicker
    dateRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, paddingRight: 10 }
});