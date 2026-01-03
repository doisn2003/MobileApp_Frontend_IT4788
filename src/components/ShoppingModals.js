import React, { useState, useEffect } from 'react';
import { View, Modal, StyleSheet, Alert, ScrollView } from 'react-native';
import { Text, TextInput, Button, RadioButton } from 'react-native-paper';
import dayjs from 'dayjs';
import client from '../api/client';

// --- MODAL TẠO DANH SÁCH MỚI ---
export const CreateListModal = ({ visible, onClose, onSuccess }) => {
    const [name, setName] = useState('');
    const [note, setNote] = useState('');
    const [assignee, setAssignee] = useState('');
    const [date, setDate] = useState(dayjs().format('YYYY-MM-DD'));
    
    // State danh sách thành viên
    const [members, setMembers] = useState([]);

    useEffect(() => {
        if (visible) {
            fetchMembers();
        }
    }, [visible]);

    const fetchMembers = async () => {
        try {
            const response = await client.get('/user/group/');
            if (response.data && response.data.data) {
                setMembers(response.data.data);
            }
        } catch (e) {
            // Mã 00096: Chưa có nhóm -> Không log lỗi, chỉ để mảng rỗng
            if (e.response?.data?.code !== '00096') {
                console.log('Error fetching group:', e);
            }
        }
    };

    const handleCreate = async () => {
        if (!name) return Alert.alert('Lỗi', 'Vui lòng nhập tên danh sách');

        try {
            // [FIX LOGIC]: API yêu cầu x-www-form-urlencoded
            // Body: name, date, assignToUsername, note 
            const payload = {
                name: name,
                date: date,
                assignToUsername: assignee, // Đảm bảo trường này có giá trị
                note: note
            };
            
            // Gửi request với Header ép buộc là Form Data
            await client.post('/shopping/', payload, {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            });

            Alert.alert('Thành công', 'Đã tạo danh sách mua sắm');
            onSuccess();
            onClose();
            
            // Reset form
            setName(''); 
            setNote(''); 
            setAssignee(''); 
            setDate(dayjs().format('YYYY-MM-DD'));
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
                    <TextInput label="Ngày (YYYY-MM-DD)" value={date} onChangeText={setDate} style={styles.input} mode="outlined"/>
                    <TextInput label="Ghi chú" value={note} onChangeText={setNote} style={styles.input} mode="outlined"/>

                    <Text style={styles.label}>Gán cho:</Text>
                    <ScrollView style={{maxHeight: 120, marginBottom: 10, borderColor: '#E5E7EB', borderWidth: 1, borderRadius: 8}}>
                        <RadioButton.Group onValueChange={setAssignee} value={assignee}>
                            {members.length > 0 ? members.map(m => (
                                <RadioButton.Item 
                                    key={m.username} 
                                    label={m.name || m.username} 
                                    value={m.username} // Giá trị này sẽ vào assignToUsername
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

// ... (Giữ nguyên phần AddTaskModal không đổi)
export const AddTaskModal = ({ visible, onClose, listId, onSuccess }) => {
    const [foodName, setFoodName] = useState('');
    const [quantity, setQuantity] = useState('1');

    const handleAddTask = async () => {
        if (!foodName) return;

        try {
            // API Create tasks: POST shopping/task/
            // Document  ghi rõ: application/json
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
            console.log(e.response?.data);
            Alert.alert('Lỗi', e.response?.data?.message || 'Không thể thêm món');
        }
    };

    return (
        <Modal visible={visible} animationType="fade" transparent>
            <View style={styles.overlay}>
                <View style={styles.container}>
                    <Text style={styles.title}>Thêm món cần mua</Text>
                    
                    <TextInput label="Tên món (vd: Thịt bò)" value={foodName} onChangeText={setFoodName} style={styles.input} mode="outlined"/>
                    <TextInput label="Số lượng (vd: 500g)" value={quantity} onChangeText={setQuantity} style={styles.input} mode="outlined"/>

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
    hint: { padding: 10, fontStyle: 'italic', color: 'gray' }
});