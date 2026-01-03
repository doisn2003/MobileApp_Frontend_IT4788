// import React, { useState, useEffect } from 'react';
// import { View, Modal, StyleSheet, Alert, TouchableOpacity, ScrollView } from 'react-native';
// import { Text, TextInput, Button, IconButton, RadioButton } from 'react-native-paper';
// import dayjs from 'dayjs';
// import client from '../api/client';

// // --- MODAL TẠO DANH SÁCH MỚI ---
// export const CreateListModal = ({ visible, onClose, onSuccess }) => {
//     const [name, setName] = useState('');
//     const [note, setNote] = useState('');
//     const [assignee, setAssignee] = useState('');
//     const [date, setDate] = useState(dayjs().format('YYYY-MM-DD'));
    
//     // State cho danh sách thành viên nhóm
//     const [members, setMembers] = useState([]);

//     // Lấy danh sách thành viên để gán việc
//     useEffect(() => {
//         if (visible) {
//             fetchMembers();
//         }
//     }, [visible]);

//     const fetchMembers = async () => {
//         try {
//             [cite_start]// API Get group members [cite: 68]
//             const response = await client.get('/user/group/');
//             if (response.data && response.data.data) {
//                 // Giả định data trả về là mảng member
//                 setMembers(response.data.data);
//             }
//         } catch (e) {
//             console.log('Error fetching group members');
//         }
//     };

//     const handleCreate = async () => {
//         if (!name) return Alert.alert('Lỗi', 'Vui lòng nhập tên danh sách');

//         try {
//             [cite_start]// POST shopping/ [cite: 70]
//             const payload = {
//                 name,
//                 note,
//                 date,
//                 assignToUsername: assignee // Tên username được chọn
//             };
            
//             await client.post('/shopping/', payload, {
//                 headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
//             });

//             Alert.alert('Thành công', 'Đã tạo danh sách mua sắm');
//             onSuccess();
//             onClose();
//             setName(''); setNote(''); setAssignee('');
//         } catch (e) {
//             Alert.alert('Thất bại', e.response?.data?.message || 'Lỗi server');
//         }
//     };

//     return (
//         <Modal visible={visible} animationType="slide" transparent>
//             <View style={styles.overlay}>
//                 <View style={styles.container}>
//                     <Text style={styles.title}>Tạo Danh Sách Mới</Text>
                    
//                     <TextInput label="Tên danh sách (vd: Đồ tiệc)" value={name} onChangeText={setName} style={styles.input} mode="outlined"/>
//                     <TextInput label="Ngày (YYYY-MM-DD)" value={date} onChangeText={setDate} style={styles.input} mode="outlined"/>
//                     <TextInput label="Ghi chú" value={note} onChangeText={setNote} style={styles.input} mode="outlined"/>

//                     <Text style={styles.label}>Gán cho ai:</Text>
//                     <ScrollView style={{maxHeight: 100, marginBottom: 10}}>
//                         <RadioButton.Group onValueChange={setAssignee} value={assignee}>
//                             {members.length > 0 ? members.map(m => (
//                                 <RadioButton.Item key={m.username} label={m.username} value={m.username} />
//                             )) : <Text style={{fontStyle:'italic', color:'gray'}}>Bạn chưa có nhóm</Text>}
//                         </RadioButton.Group>
//                     </ScrollView>

//                     <View style={styles.row}>
//                         <Button onPress={onClose} style={{flex:1}}>Hủy</Button>
//                         <Button mode="contained" onPress={handleCreate} style={{flex:1}}>Tạo</Button>
//                     </View>
//                 </View>
//             </View>
//         </Modal>
//     );
// };

// // --- MODAL THÊM TASK ---
// export const AddTaskModal = ({ visible, onClose, listId, onSuccess }) => {
//     const [foodName, setFoodName] = useState('');
//     const [quantity, setQuantity] = useState('1');

//     const handleAddTask = async () => {
//         if (!foodName) return;

//         try {
//             [cite_start]// API Create tasks [cite: 70]
//             // QUAN TRỌNG: API này yêu cầu Content-Type: application/json
//             // Body: { listId: number, tasks: [{ foodName, quantity }] }
            
//             const payload = {
//                 listId: Number(listId) || listId, // Đảm bảo đúng format số nếu cần
//                 tasks: [
//                     { foodName, quantity }
//                 ]
//             };

//             await client.post('/shopping/task/', payload, {
//                 headers: { 'Content-Type': 'application/json' }
//             });

//             onSuccess();
//             setFoodName(''); setQuantity('1');
//             // Không đóng modal ngay để người dùng nhập tiếp
//             Alert.alert('Đã thêm', 'Bạn có muốn thêm món khác không?', [
//                 { text: 'Xong', onPress: onClose },
//                 { text: 'Thêm tiếp' }
//             ]);

//         } catch (e) {
//             console.log(e.response?.data);
//             Alert.alert('Lỗi', e.response?.data?.message || 'Không thể thêm món');
//         }
//     };

//     return (
//         <Modal visible={visible} animationType="fade" transparent>
//             <View style={styles.overlay}>
//                 <View style={styles.container}>
//                     <Text style={styles.title}>Thêm đồ cần mua</Text>
                    
//                     <TextInput label="Tên món (vd: Thịt bò)" value={foodName} onChangeText={setFoodName} style={styles.input} mode="outlined"/>
//                     <TextInput label="Số lượng (vd: 500g)" value={quantity} onChangeText={setQuantity} style={styles.input} mode="outlined"/>

//                     <View style={styles.row}>
//                         <Button onPress={onClose} style={{flex:1}}>Đóng</Button>
//                         <Button mode="contained" onPress={handleAddTask} style={{flex:1}}>Thêm</Button>
//                     </View>
//                 </View>
//             </View>
//         </Modal>
//     );
// };

// const styles = StyleSheet.create({
//     overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
//     container: { backgroundColor: 'white', padding: 20, borderRadius: 16 },
//     title: { fontSize: 20, fontWeight: 'bold', marginBottom: 16, textAlign: 'center' },
//     input: { marginBottom: 12, backgroundColor: 'white' },
//     row: { flexDirection: 'row', gap: 10, marginTop: 10 },
//     label: { fontWeight: 'bold', marginTop: 10, marginBottom: 5 }
// });
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
    
    // State cho danh sách thành viên nhóm
    const [members, setMembers] = useState([]);

    // Lấy danh sách thành viên để gán việc
    useEffect(() => {
        if (visible) {
            fetchMembers();
        }
    }, [visible]);

    const fetchMembers = async () => {
        try {
            // API Get group members: GET user/group/
            const response = await client.get('/user/group/');
            if (response.data && response.data.data) {
                setMembers(response.data.data);
            }
        } catch (e) {
            // XỬ LÝ LỖI Ở ĐÂY:
            // Nếu lỗi là 00096 (Chưa vào nhóm), ta chỉ set members rỗng và không log lỗi.
            if (e.response && e.response.data && e.response.data.code === '00096') {
                setMembers([]); 
                // Có thể log nhẹ nhàng để debug nếu cần: console.log('User chưa có nhóm');
            } else {
                // Các lỗi khác (mất mạng, server sập...) thì mới log ra
                console.log('Error fetching group members:', e);
            }
        }
    };

    const handleCreate = async () => {
        if (!name) return Alert.alert('Lỗi', 'Vui lòng nhập tên danh sách');

        try {
            // POST shopping/
            const payload = {
                name,
                note,
                date,
                assignToUsername: assignee // Tên username được chọn
            };
            
            await client.post('/shopping/', payload, {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            });

            Alert.alert('Thành công', 'Đã tạo danh sách mua sắm');
            onSuccess();
            onClose();
            // Reset form
            setName(''); setNote(''); setAssignee(''); setDate(dayjs().format('YYYY-MM-DD'));
        } catch (e) {
            console.log(e.response?.data);
            Alert.alert('Thất bại', e.response?.data?.message || 'Lỗi server');
        }
    };

    return (
        <Modal visible={visible} animationType="slide" transparent>
            <View style={styles.overlay}>
                <View style={styles.container}>
                    <Text style={styles.title}>Tạo Danh Sách Mới</Text>
                    
                    <TextInput label="Tên danh sách (vd: Đồ tiệc)" value={name} onChangeText={setName} style={styles.input} mode="outlined"/>
                    <TextInput label="Ngày (YYYY-MM-DD)" value={date} onChangeText={setDate} style={styles.input} mode="outlined"/>
                    <TextInput label="Ghi chú" value={note} onChangeText={setNote} style={styles.input} mode="outlined"/>

                    <Text style={styles.label}>Gán cho ai:</Text>
                    <ScrollView style={{maxHeight: 100, marginBottom: 10}}>
                        <RadioButton.Group onValueChange={setAssignee} value={assignee}>
                            {members.length > 0 ? members.map(m => (
                                <RadioButton.Item key={m.username} label={m.name || m.username} value={m.username} />
                            )) : <Text style={{fontStyle:'italic', color:'gray', marginTop: 5}}>Bạn chưa có nhóm (Hãy tạo ở tab Nhóm)</Text>}
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

// --- MODAL THÊM TASK ---
export const AddTaskModal = ({ visible, onClose, listId, onSuccess }) => {
    const [foodName, setFoodName] = useState('');
    const [quantity, setQuantity] = useState('1');

    const handleAddTask = async () => {
        if (!foodName) return;

        try {
            // API Create tasks: POST shopping/task/
            // Yêu cầu JSON Body
            const payload = {
                listId: Number(listId) || listId,
                tasks: [
                    { foodName, quantity }
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
                    <Text style={styles.title}>Thêm đồ cần mua</Text>
                    
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
    label: { fontWeight: 'bold', marginTop: 10, marginBottom: 5 }
});