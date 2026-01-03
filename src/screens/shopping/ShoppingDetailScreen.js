import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, FlatList, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, IconButton, Appbar, FAB, Checkbox } from 'react-native-paper';
import client from '../../api/client';
import { AddTaskModal } from '../../components/ShoppingModals';

const ShoppingDetailScreen = ({ route, navigation }) => {
    const { list } = route.params;
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(false);
    const [addVisible, setAddVisible] = useState(false);

    const fetchTasks = useCallback(async () => {
        setLoading(true);
        try {
            const listId = list._id || list.id || list.listId;
            const response = await client.get(`/shopping/task?listId=${listId}`);
            
            // Debug: Xem server trả về key gì (foodName hay name?)
            // console.log('Tasks Data:', response.data);

            if (response.data && Array.isArray(response.data.data)) {
                 setTasks(response.data.data);
            } else if (Array.isArray(response.data)) {
                 setTasks(response.data);
            } else {
                 setTasks([]);
            }
        } catch (e) {
            console.log('Fetch Tasks Error:', e);
        } finally {
            setLoading(false);
        }
    }, [list]);

    useEffect(() => {
        fetchTasks();
    }, [fetchTasks]);

    const handleCheckTask = (taskId, foodName) => {
        Alert.alert('Xác nhận mua', `Bạn đã mua "${foodName}"? (Món này sẽ bị xóa khỏi danh sách)`, [
            { text: 'Chưa', style: 'cancel' },
            { 
                text: 'Đã mua', 
                onPress: async () => {
                    try {
                        // DELETE /shopping/task - Body: { taskId }
                        await client.delete('/shopping/task', { data: { taskId } });
                        fetchTasks();
                    } catch (e) {
                        console.log(e);
                        Alert.alert('Lỗi', 'Không thể cập nhật trạng thái');
                    }
                } 
            }
        ]);
    };

    const renderTask = ({ item }) => {
        // [FIX QUAN TRỌNG]: Kiểm tra các trường hợp tên biến khác nhau
        // Server có thể trả về 'foodName', 'name' hoặc đôi khi là 'content'
        const displayFoodName = item.foodName || item.name || "Món không tên";
        const displayQuantity = item.quantity || 1;
        const displayId = item._id || item.taskId || item.id;

        return (
            <View style={styles.taskItem}>
                <View style={styles.taskInfo}>
                    <Text style={styles.foodName}>{displayFoodName}</Text>
                    <Text style={styles.quantity}>Số lượng: {displayQuantity}</Text>
                </View>
                <IconButton 
                    icon="check-circle-outline" 
                    iconColor="#D1D5DB"
                    size={28} 
                    onPress={() => handleCheckTask(displayId, displayFoodName)} 
                />
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
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
                keyExtractor={item => item._id || item.taskId || item.id || Math.random().toString()}
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
                listId={list._id || list.id || list.listId}
                onClose={() => setAddVisible(false)}
                onSuccess={fetchTasks}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F9FAFB' },
    summary: { padding: 16, backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
    list: { padding: 16 },
    taskItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', padding: 16, borderRadius: 12, marginBottom: 8, elevation: 1 },
    taskInfo: { flex: 1 },
    foodName: { fontSize: 16, fontWeight: '600', color: '#1F2937' },
    quantity: { fontSize: 14, color: '#6B7280', marginTop: 2 },
    fab: { position: 'absolute', margin: 16, right: 0, bottom: 0, backgroundColor: '#059669' },
    empty: { alignItems: 'center', marginTop: 50 }
});

export default ShoppingDetailScreen;