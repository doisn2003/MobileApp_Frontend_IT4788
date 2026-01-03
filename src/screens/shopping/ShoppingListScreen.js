// import React, { useState, useEffect, useCallback } from 'react';
// import { View, StyleSheet, FlatList, Alert, RefreshControl } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context'; // <--- IMPORT MỚI
// import { Text, FAB, Card, IconButton, Avatar, Chip } from 'react-native-paper';
// import { useIsFocused, useNavigation } from '@react-navigation/native';
// import dayjs from 'dayjs';
// import client from '../../api/client';
// import { CreateListModal } from '../../components/ShoppingModals';

// const ShoppingListScreen = () => {
//     const [lists, setLists] = useState([]);
//     const [loading, setLoading] = useState(false);
//     const [createVisible, setCreateVisible] = useState(false);
    
//     const isFocused = useIsFocused();
//     const navigation = useNavigation();

//     const fetchLists = useCallback(async () => {
//         setLoading(true);
//         try {
//             const response = await client.get('/shopping/');
//             if (response.data && Array.isArray(response.data.data)) {
//                 setLists(response.data.data);
//             } else if (Array.isArray(response.data)) {
//                 setLists(response.data);
//             }
//         } catch (e) {
//             console.log('Fetch Shopping List Error:', e);
//         } finally {
//             setLoading(false);
//         }
//     }, []);

//     useEffect(() => {
//         if (isFocused) {
//             fetchLists();
//         }
//     }, [isFocused, fetchLists]);

//     const handleDelete = (listId) => {
//         Alert.alert('Xác nhận', 'Bạn có chắc muốn xóa danh sách này?', [
//             { text: 'Hủy', style: 'cancel' },
//             { 
//                 text: 'Xóa', 
//                 style: 'destructive',
//                 onPress: async () => {
//                     try {
//                         await client.delete('/shopping/', { data: { listId } });
//                         fetchLists();
//                     } catch (e) {
//                         Alert.alert('Lỗi', e.response?.data?.message || 'Không thể xóa danh sách');
//                     }
//                 }
//             }
//         ]);
//     };

//     const renderItem = ({ item }) => (
//         <Card style={styles.card} onPress={() => navigation.navigate('ShoppingDetail', { list: item })}>
//             <Card.Title
//                 title={item.name}
//                 subtitle={`Ngày: ${dayjs(item.date).format('DD/MM/YYYY')}`}
//                 left={(props) => <Avatar.Icon {...props} icon="cart-outline" style={{ backgroundColor: '#7C3AED' }} />}
//                 right={(props) => (
//                     <IconButton {...props} icon="delete-outline" onPress={() => handleDelete(item._id || item.id)} />
//                 )}
//             />
//             <Card.Content>
//                 {item.note ? <Text style={styles.note}>{item.note}</Text> : null}
//                 <View style={styles.footer}>
//                     <Chip icon="account" style={styles.chip} textStyle={{fontSize: 10}}>
//                         {item.assignToUsername || 'Chưa gán'}
//                     </Chip>
//                     <Text style={styles.status}>
//                         {item.isCompleted ? 'Đã xong' : 'Đang mua'}
//                     </Text>
//                 </View>
//             </Card.Content>
//         </Card>
//     );

//     return (
//         <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
//             <View style={styles.header}>
//                 <Text style={styles.headerTitle}>Kế Hoạch Mua Sắm</Text>
//             </View>

//             <FlatList
//                 data={lists}
//                 renderItem={renderItem}
//                 keyExtractor={(item) => item._id || item.id || Math.random().toString()}
//                 contentContainerStyle={styles.list}
//                 refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchLists} />}
//                 ListEmptyComponent={
//                     !loading && (
//                         <View style={styles.empty}>
//                             <Text style={{ color: '#9CA3AF' }}>Chưa có danh sách nào. Hãy tạo mới!</Text>
//                         </View>
//                     )
//                 }
//             />

//             <FAB
//                 style={styles.fab}
//                 icon="plus"
//                 color="white"
//                 label="Tạo danh sách"
//                 onPress={() => setCreateVisible(true)}
//             />

//             <CreateListModal 
//                 visible={createVisible} 
//                 onClose={() => setCreateVisible(false)} 
//                 onSuccess={fetchLists} 
//             />
//         </SafeAreaView>
//     );
// };

// const styles = StyleSheet.create({
//     container: { flex: 1, backgroundColor: '#F3F4F6' },
//     header: { padding: 20, backgroundColor: 'white', paddingBottom: 10 },
//     headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#111827' },
//     list: { padding: 16, paddingBottom: 80 },
//     card: { marginBottom: 12, borderRadius: 12, backgroundColor: 'white' },
//     note: { color: '#6B7280', fontStyle: 'italic', marginBottom: 8, fontSize: 12 },
//     footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
//     chip: { backgroundColor: '#F3F4F6', height: 28 },
//     status: { fontSize: 12, color: '#059669', fontWeight: '600' },
//     fab: { position: 'absolute', margin: 16, right: 0, bottom: 0, backgroundColor: '#7C3AED' },
//     empty: { alignItems: 'center', marginTop: 50 }
// });

// export default ShoppingListScreen;
import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, FlatList, Alert, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, FAB, Card, IconButton, Avatar, Chip } from 'react-native-paper';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import dayjs from 'dayjs';
import client from '../../api/client';
import { CreateListModal } from '../../components/ShoppingModals';

const ShoppingListScreen = () => {
    const [lists, setLists] = useState([]);
    const [loading, setLoading] = useState(false);
    const [createVisible, setCreateVisible] = useState(false);
    
    const isFocused = useIsFocused();
    const navigation = useNavigation();

    const fetchLists = useCallback(async () => {
        setLoading(true);
        try {
            const response = await client.get('/shopping/');
            if (response.data && Array.isArray(response.data.data)) {
                setLists(response.data.data);
            } else if (Array.isArray(response.data)) {
                setLists(response.data);
            } else {
                setLists([]);
            }
        } catch (e) {
            console.log('Fetch Shopping List Error:', e);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (isFocused) {
            fetchLists();
        }
    }, [isFocused, fetchLists]);

    const handleDelete = (listId) => {
        Alert.alert('Xác nhận', 'Bạn có chắc muốn xóa danh sách này?', [
            { text: 'Hủy', style: 'cancel' },
            { 
                text: 'Xóa', 
                style: 'destructive',
                onPress: async () => {
                    try {
                        await client.delete('/shopping/', { data: { listId } });
                        fetchLists();
                    } catch (e) {
                        Alert.alert('Lỗi', e.response?.data?.message || 'Không thể xóa danh sách');
                    }
                }
            }
        ]);
    };

    const renderItem = ({ item }) => (
        <Card style={styles.card} onPress={() => navigation.navigate('ShoppingDetail', { list: item })}>
            <Card.Title
                title={item.name}
                subtitle={`Ngày: ${dayjs(item.date).format('DD/MM/YYYY')}`}
                left={(props) => <Avatar.Icon {...props} icon="cart-outline" style={{ backgroundColor: '#7C3AED' }} />}
                right={(props) => (
                    <IconButton {...props} icon="delete-outline" onPress={() => handleDelete(item._id || item.id)} />
                )}
            />
            <Card.Content>
                {item.note ? <Text style={styles.note}>{item.note}</Text> : null}
                <View style={styles.footer}>
                    <Chip icon="account" style={styles.chip} textStyle={{fontSize: 10}}>
                        {item.assignToUsername || 'Chưa gán'}
                    </Chip>
                    <Text style={styles.status}>
                        {item.isCompleted ? 'Đã xong' : 'Đang mua'}
                    </Text>
                </View>
            </Card.Content>
        </Card>
    );

    return (
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Kế Hoạch Mua Sắm</Text>
            </View>

            <FlatList
                data={lists}
                renderItem={renderItem}
                keyExtractor={(item) => item._id || item.id || Math.random().toString()}
                contentContainerStyle={styles.list}
                refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchLists} />}
                ListEmptyComponent={
                    loading ? null : (
                        <View style={styles.empty}>
                            <Text style={{ color: '#9CA3AF' }}>Chưa có danh sách nào. Hãy tạo mới!</Text>
                        </View>
                    )
                }
            />

            <FAB
                style={styles.fab}
                icon="plus"
                color="white"
                label="Tạo danh sách"
                onPress={() => setCreateVisible(true)}
            />

            <CreateListModal 
                visible={createVisible} 
                onClose={() => setCreateVisible(false)} 
                onSuccess={fetchLists} 
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F3F4F6' },
    header: { padding: 20, backgroundColor: 'white', paddingBottom: 10 },
    headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#111827' },
    list: { padding: 16, paddingBottom: 80 },
    card: { marginBottom: 12, borderRadius: 12, backgroundColor: 'white' },
    note: { color: '#6B7280', fontStyle: 'italic', marginBottom: 8, fontSize: 12 },
    footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
    chip: { backgroundColor: '#F3F4F6', height: 28 },
    status: { fontSize: 12, color: '#059669', fontWeight: '600' },
    fab: { position: 'absolute', margin: 16, right: 0, bottom: 0, backgroundColor: '#7C3AED' },
    empty: { alignItems: 'center', marginTop: 50 }
});

export default ShoppingListScreen;