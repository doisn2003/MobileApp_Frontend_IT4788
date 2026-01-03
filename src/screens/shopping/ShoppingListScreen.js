import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, StyleSheet, FlatList, Alert, RefreshControl, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, FAB, Card, IconButton, Avatar, Chip, ActivityIndicator } from 'react-native-paper';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import dayjs from 'dayjs';
import client from '../../api/client';
import { CreateListModal } from '../../components/ShoppingModals';
import DatePicker from '../../components/DatePicker';

const ShoppingListScreen = () => {
    const [lists, setLists] = useState([]);
    const [loading, setLoading] = useState(false);
    const [createVisible, setCreateVisible] = useState(false);
    
    const [filterDate, setFilterDate] = useState(dayjs());
    const [isFiltering, setIsFiltering] = useState(false);

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

    const markedDates = useMemo(() => {
        return lists.map(l => dayjs(l.date).format('YYYY-MM-DD'));
    }, [lists]);

    const displayedLists = useMemo(() => {
        if (!isFiltering) return lists;
        const targetStr = filterDate.format('YYYY-MM-DD');
        return lists.filter(l => dayjs(l.date).format('YYYY-MM-DD') === targetStr);
    }, [lists, filterDate, isFiltering]);

    const handleDateSelect = (newDate) => {
        setFilterDate(newDate);
        setIsFiltering(true);
    };

    const clearFilter = () => {
        setIsFiltering(false);
        setFilterDate(dayjs());
    };

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
                    <IconButton {...props} icon="delete-outline" onPress={() => handleDelete(item._id || item.id || item.listId)} />
                )}
            />
            <Card.Content>
                {item.note ? <Text style={styles.note}>{item.note}</Text> : null}
                <View style={styles.footer}>
                    <Chip icon="account" style={styles.chip} textStyle={{fontSize: 12}}>
                        {item.assigneeId?.username || item.assignToUsername || 'Chưa gán'}
                    </Chip>
                    <Text style={styles.status}>Chi tiết {'>'}</Text>
                </View>
            </Card.Content>
        </Card>
    );

    return (
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
            <View style={styles.header}>
                {/* Bọc Text trong View container để kiểm soát độ rộng */}
                <View style={styles.headerTextContainer}>
                    <Text style={styles.headerTitle} numberOfLines={1} ellipsizeMode='tail'>
                        Kế Hoạch Mua Sắm
                    </Text>
                    <Text style={styles.subHeader}>
                        {isFiltering ? `Ngày: ${filterDate.format('DD/MM/YYYY')}` : 'Tất cả danh sách'}
                    </Text>
                </View>
                
                {/* Bộ lọc ngày */}
                <View style={styles.filterContainer}>
                    {isFiltering && (
                        <TouchableOpacity onPress={clearFilter} style={styles.clearBtn}>
                            <Text style={styles.clearText}>X</Text>
                        </TouchableOpacity>
                    )}
                    <DatePicker 
                        date={filterDate} 
                        onDateChange={handleDateSelect} 
                        markedDates={markedDates} 
                    />
                </View>
            </View>

            {loading && lists.length === 0 ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#7C3AED" />
                </View>
            ) : (
                <FlatList
                    data={displayedLists}
                    renderItem={renderItem}
                    keyExtractor={(item) => item._id || item.id || item.listId || Math.random().toString()}
                    contentContainerStyle={styles.list}
                    refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchLists} />}
                    ListEmptyComponent={
                        <View style={styles.empty}>
                            <Text style={{ color: '#9CA3AF' }}>
                                {isFiltering ? 'Không có chuyến đi nào vào ngày này.' : 'Chưa có danh sách nào. Hãy tạo mới!'}
                            </Text>
                        </View>
                    }
                />
            )}

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
                selectedDate={filterDate}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F3F4F6' },
    
    // Header Styles đã được Fix
    header: { 
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: 'white', 
        flexDirection: 'row', 
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6'
    },
    headerTextContainer: {
        flex: 1, // Chiếm hết không gian còn lại bên trái
        paddingRight: 10, // Tạo khoảng cách an toàn với DatePicker
    },
    headerTitle: { 
        fontSize: 22, // Giảm nhẹ size chữ để vừa vặn hơn
        fontWeight: 'bold', 
        color: '#111827' 
    },
    subHeader: { 
        fontSize: 13, 
        color: '#6B7280', 
        marginTop: 2 
    },
    
    filterContainer: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        gap: 8,
        flexShrink: 0 // Đảm bảo DatePicker không bị co lại
    },
    clearBtn: { 
        backgroundColor: '#FEE2E2',
        width: 24,
        height: 24,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center'
    },
    clearText: { color: '#EF4444', fontSize: 10, fontWeight: 'bold' },

    // List & Card Styles
    list: { padding: 16, paddingBottom: 80 },
    card: { marginBottom: 12, borderRadius: 12, backgroundColor: 'white' },
    note: { color: '#6B7280', fontStyle: 'italic', marginBottom: 8, fontSize: 12 },
    footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
    chip: { backgroundColor: '#F3F4F6' },
    status: { fontSize: 12, color: '#6B7280', fontWeight: '600' },
    fab: { position: 'absolute', margin: 16, right: 0, bottom: 0, backgroundColor: '#7C3AED' },
    empty: { alignItems: 'center', marginTop: 50 },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' }
});

export default ShoppingListScreen;