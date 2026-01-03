
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, Alert } from 'react-native';
import { Text, IconButton, Checkbox, Appbar, FAB } from 'react-native-paper';
import client from '../../api/client';
import { AddTaskModal } from '../../components/ShoppingModals';

const ShoppingDetailScreen = ({ route, navigation }) => {
    const { list } = route.params; // Nhận object list từ màn hình trước
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(false);
    const [addVisible, setAddVisible] = useState(false);

    // API DOC STT 8: Get list of task
    // GET shopping/task/
    // Lưu ý: Tài liệu không ghi rõ params, nhưng logic cần filter theo listId.
    // Nếu API trả về ALL task, ta phải filter client-side.
    // Giả định API hỗ trợ query param ?listId=... hoặc trả về list tasks của shopping list hiện tại
    const fetchTasks = async () => {
        setLoading(true);
        try {
            // Thử gọi với param listId
            const response = await client.get(`/shopping/task/?listId=${list._id || list.id}`);
            if (response.data && Array.isArray(response.data.data)) {
                 // Filter client-side để chắc chắn nếu server trả về all
                 const currentListTasks = response.data.data.filter(t => t.listId === (list._id || list.id));
                 setTasks(currentListTasks);
            } else {
                // Fallback nếu cấu trúc khác
                setTasks(response.data || []);
            }
        } catch (e) {
            console.log('Fetch Tasks Error:', e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTasks();
    }, []);

    const handleDeleteTask = (taskId) => {
        Alert.alert('Đã mua xong?', 'Bạn muốn xóa món này khỏi danh sách?', [
            { text: 'Chưa', style: 'cancel' },
            { 
                text: 'Rồi', 
                onPress: async () => {
                    try {
                        // DELETE shopping/task/ - Body: { taskId }
                        await client.delete('/shopping/task/', { data: { taskId } });
                        fetchTasks();
                    } catch (e) {
                        Alert.alert('Lỗi', 'Không thể cập nhật trạng thái');
                    }
                } 
            }
        ]);
    };

    const renderTask = ({ item }) => (
        <View style={styles.taskItem}>
            <View style={styles.taskInfo}>
                <Text style={styles.foodName}>{item.foodName}</Text>
                <Text style={styles.quantity}>Số lượng: {item.quantity}</Text>
            </View>
            <IconButton 
                icon="check-circle-outline" 
                iconColor="#059669"
                size={24} 
                onPress={() => handleDeleteTask(item._id || item.taskId)} 
            />
        </View>
    );

    return (
        <View style={styles.container}>
            <Appbar.Header style={{backgroundColor: 'white'}}>
                <Appbar.BackAction onPress={() => navigation.goBack()} />
                <Appbar.Content title={list.name} subtitle={list.assignToUsername ? `Phụ trách: ${list.assignToUsername}` : ''} />
                <Appbar.Action icon="reload" onPress={fetchTasks} />
            </Appbar.Header>

            <View style={styles.summary}>
                <Text style={{color: '#6B7280'}}>Ghi chú: {list.note || 'Không có'}</Text>
            </View>

            <FlatList
                data={tasks}
                renderItem={renderTask}
                keyExtractor={item => item._id || item.taskId || Math.random().toString()}
                contentContainerStyle={styles.list}
                ListEmptyComponent={
                    <View style={styles.empty}>
                        <Text style={{ color: '#9CA3AF' }}>Danh sách trống. Hãy thêm món cần mua!</Text>
                    </View>
                }
            />

            <FAB
                style={styles.fab}
                icon="cart-plus"
                label="Thêm món"
                onPress={() => setAddVisible(true)}
            />

            <AddTaskModal 
                visible={addVisible} 
                listId={list._id || list.id}
                onClose={() => setAddVisible(false)}
                onSuccess={fetchTasks}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F9FAFB' },
    summary: { padding: 16, backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
    list: { padding: 16 },
    taskItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', padding: 16, borderRadius: 12, marginBottom: 8, elevation: 1 },
    taskInfo: { flex: 1 },
    foodName: { fontSize: 16, fontWeight: '600', color: '#1F2937' },
    quantity: { fontSize: 13, color: '#6B7280', marginTop: 2 },
    fab: { position: 'absolute', margin: 16, right: 0, bottom: 0, backgroundColor: '#059669' },
    empty: { alignItems: 'center', marginTop: 50 }
});

export default ShoppingDetailScreen;