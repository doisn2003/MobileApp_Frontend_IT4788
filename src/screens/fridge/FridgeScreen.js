import React, { useState, useEffect, useMemo, useContext } from 'react';
import { View, StyleSheet, FlatList, Alert, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, IconButton } from 'react-native-paper';
import { useIsFocused } from '@react-navigation/native';
import client from '../../api/client.offline';
import { AuthContext } from '../../contexts/AuthContext';
import { useNetwork } from '../../contexts/NetworkContext';

import { FreezerItem, CoolerItem } from '../../components/FoodItem';
import FoodModal from '../../components/FoodModal';
import AddFoodModal from '../../components/AddFoodModal';
import Refresh from '../../components/Refresh';
import Search from '../../components/Search'; // <--- IMPORT MỚI

const FridgeScreen = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState(''); // <--- STATE TÌM KIẾM

    // Selection State
    const [selectedItem, setSelectedItem] = useState(null);
    const [detailVisible, setDetailVisible] = useState(false);

    // Add State
    const [addOptions, setAddOptions] = useState({ visible: false, compartment: 'Cooler' });

    const isFocused = useIsFocused();
    const { logout } = useContext(AuthContext);

    // Network State
    const { checkPendingActions } = useNetwork();

    const fetchFridgeItems = async () => {
        setLoading(true);
        try {
            const response = await client.get('/fridge/');
            if (response.data && Array.isArray(response.data.data)) {
                setItems(response.data.data);
            } else if (Array.isArray(response.data)) {
                setItems(response.data);
            } else {
                setItems([]);
            }

            if (response.fromCache) {
                console.log('📦 Dữ liệu từ cache');
            }
        } catch (e) {
            console.log('Fetch Error:', e);
            // 401 hoặc mã 00011 -> Token lỗi/hết hạn -> Auto Logout
            if (e.response && (e.response.status === 401 || e.response.data?.code === '00011')) {
                logout(); // Hàm logout từ AuthContext sẽ xóa token trong SecureStore
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isFocused) {
            fetchFridgeItems();
        }
    }, [isFocused]);

    // --- XỬ LÝ LỌC VÀ SẮP XẾP ---
    const sortedFreezer = useMemo(() =>
        items
            .filter(i => i.compartment === 'Freezer')
            // Lọc theo foodId.name (không phải foodName)
            .filter(i => (i.foodId?.name || '').toLowerCase().includes(searchQuery.toLowerCase()))
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
        [items, searchQuery]
    );

    const sortedCooler = useMemo(() =>
        items
            .filter(i => (!i.compartment || i.compartment === 'Cooler'))
            // Lọc theo foodId.name (không phải foodName)
            .filter(i => (i.foodId?.name || '').toLowerCase().includes(searchQuery.toLowerCase()))
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
        [items, searchQuery]
    );

    const handleItemClick = (item) => {
        setSelectedItem(item);
        setDetailVisible(true);
    };

    const handleUpdate = async (id, values) => {
        try {
            await client.put('/fridge/', {
                itemId: id,
                newQuantity: values.quantity,
            });
            fetchFridgeItems();
            setDetailVisible(false);
        } catch (e) {
            Alert.alert('Lỗi', 'Không thể cập nhật thông tin');
        }
    };

    const handleDelete = async (foodName) => {
        Alert.alert('Xác nhận', 'Bạn muốn xóa thực phẩm này khỏi tủ?', [
            { text: 'Hủy', style: 'cancel' },
            {
                text: 'Xóa',
                style: 'destructive',
                onPress: async () => {
                    try {
                        await client.delete('/fridge/', { data: { foodName } });
                        setDetailVisible(false);
                        fetchFridgeItems();
                    } catch (e) {
                        Alert.alert('Lỗi', 'Xóa thất bại');
                    }
                }
            }
        ]);
    };

    const handleOpenAdd = (compartment) => {
        setAddOptions({ visible: true, compartment });
    };

    const handleCloseAdd = () => {
        setAddOptions({ ...addOptions, visible: false });
    };

    const handleAddItem = async (formData) => {
        try {
            const payload = {
                foodName: formData.foodName,
                quantity: formData.quantity,
                useWithin: formData.useWithin,
                compartment: formData.compartment, // Thêm dòng này để fix lỗi Ngăn Mát
                categoryName: formData.categoryName, // Gửi thêm để tạo món mới nếu cần
                unitName: formData.unitName,
                note: formData.note
            };

            const response = await client.post('/fridge/', payload, {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            });

            handleCloseAdd();
            fetchFridgeItems();
            
            // Thông báo khác nhau cho online/offline
            if (response.offline) {
                Alert.alert('Đã lưu!', 'Sẽ đồng bộ khi có mạng.');
            } else {
                Alert.alert('Thành công!', 'Đã thêm thực phẩm vào tủ lạnh!');
            }            
            checkPendingActions(); // Cập nhật pending count
        } catch (e) {
            console.log(e.response?.data);
            const errorCode = e.response?.data?.code;
            const errorMessage = e.response?.data?.message || 'Thêm thất bại!';

            if (errorCode === '00194') {
                Alert.alert('Chưa có dữ liệu', `Món "${formData.foodName}" chưa có trong hệ thống. Bạn cần tạo món này trong danh mục thực phẩm trước.`);
            } else {
                Alert.alert('Thất bại', errorMessage);
            }
        }
    };

    return (
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
            <View style={styles.headerContainer}>
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Tủ Lạnh Gia Đình</Text>
                    {/* Đã xóa nút magnify cũ vì có Search bar bên dưới */}
                </View>

                {/* --- CHÈN COMPONENT SEARCH --- */}
                <Search
                    onSearch={setSearchQuery}
                    placeholder="Tìm món ăn trong tủ..."
                    containerStyle={{ paddingHorizontal: 24, paddingBottom: 10 }}
                />
            </View>

            <Refresh style={styles.mainScroll} contentContainerStyle={{ paddingBottom: 100 }} onRefresh={fetchFridgeItems}>
                {/* FREEZER SECTION */}
                {/* Chỉ hiện section nếu có item (sau khi lọc) hoặc nếu đang không tìm kiếm */}
                {(sortedFreezer.length > 0 || searchQuery === '') && (
                    <View style={styles.freezerSection}>
                        <View style={styles.sectionHeader}>
                            <View style={styles.sectionTitleRow}>
                                <IconButton icon="snowflake" size={20} iconColor="#2563EB" style={{ margin: 0 }} />
                                <Text style={styles.sectionTitleFreezer}>Ngăn Đá</Text>
                                <View style={styles.countBadgeFreezer}>
                                    <Text style={styles.countTextFreezer}>đang có: {sortedFreezer.length} items</Text>
                                </View>
                            </View>
                            <TouchableOpacity onPress={() => handleOpenAdd('Freezer')}>
                                <Text style={[styles.addBtnCooler, { color: '#fff', fontSize: 12, paddingVertical: 4, paddingHorizontal: 8 }]}>+ Thêm</Text>
                            </TouchableOpacity>
                        </View>

                        <FlatList
                            horizontal
                            data={sortedFreezer}
                            renderItem={({ item }) => <FreezerItem item={item} onClick={handleItemClick} />}
                            keyExtractor={item => item._id || Math.random().toString()}
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.freezerList}
                            ListFooterComponent={
                                <TouchableOpacity style={styles.addPlaceholderFreezer} onPress={() => handleOpenAdd('Freezer')}>
                                    <IconButton icon="plus" size={30} iconColor="#D1D5DB" />
                                </TouchableOpacity>
                            }
                            ListEmptyComponent={
                                searchQuery !== '' ? <Text style={styles.emptyText}>Không tìm thấy</Text> : null
                            }
                        />
                    </View>
                )}

                {/* COOLER SECTION */}
                <View style={styles.coolerSection}>
                    <View style={styles.sectionHeader}>
                        <View style={styles.sectionTitleRow}>
                            <IconButton icon="fridge" size={20} iconColor="#059669" style={{ margin: 0 }} />
                            <Text style={styles.sectionTitleCooler}>Ngăn Mát</Text>
                            <View style={styles.countBadgeCooler}>
                                <Text style={styles.countTextCooler}>đang có: {sortedCooler.length} items</Text>
                            </View>
                        </View>
                        <TouchableOpacity style={styles.addBtnCooler} onPress={() => handleOpenAdd('Cooler')}>
                            <Text style={styles.addBtnCoolerText}>+ Thêm</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.coolerGrid}>
                        {sortedCooler.map(item => (
                            <View key={item._id || Math.random().toString()} style={styles.gridItemWrapper}>
                                <CoolerItem item={item} onClick={handleItemClick} />
                            </View>
                        ))}

                        {/* Chỉ hiện nút thêm nếu không đang tìm kiếm (để giao diện sạch hơn) */}
                        {searchQuery === '' && (
                            <TouchableOpacity style={styles.addPlaceholderCooler} onPress={() => handleOpenAdd('Cooler')}>
                                <IconButton icon="plus" size={30} iconColor="#E5E7EB" />
                            </TouchableOpacity>
                        )}

                        {sortedCooler.length === 0 && searchQuery !== '' && (
                            <Text style={[styles.emptyText, { width: '100%', textAlign: 'center', marginTop: 20 }]}>
                                Không tìm thấy thực phẩm nào khớp với "{searchQuery}"
                            </Text>
                        )}
                    </View>
                </View>
            </Refresh>

            <FoodModal
                item={selectedItem}
                visible={detailVisible}
                onClose={() => setDetailVisible(false)}
                onSave={handleUpdate}
                onDelete={handleDelete}
            />

            <AddFoodModal
                visible={addOptions.visible}
                initialCompartment={addOptions.compartment}
                onClose={handleCloseAdd}
                onAdd={handleAddItem}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFFFFF' },
    // Gộp header và search vào một container nền trắng
    headerContainer: { backgroundColor: '#FFFFFF', paddingBottom: 4 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, paddingVertical: 12 },
    headerTitle: { fontSize: 28, fontWeight: '800', color: '#111827' },

    mainScroll: { flex: 1 },

    // Freezer
    freezerSection: { backgroundColor: '#EFF6FF', paddingBottom: 24, paddingTop: 8, borderTopLeftRadius: 32, borderTopRightRadius: 32 },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, marginBottom: 16 },
    sectionTitleRow: { flexDirection: 'row', alignItems: 'center' },
    sectionTitleFreezer: { fontSize: 20, fontWeight: '700', color: '#1E3A8A', marginLeft: 4 },
    countBadgeFreezer: { backgroundColor: '#DBEAFE', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12, marginLeft: 8 },
    countTextFreezer: { fontSize: 10, fontWeight: '700', color: '#1D4ED8', textTransform: 'uppercase' },

    freezerList: { paddingHorizontal: 24 },
    addPlaceholderFreezer: { width: 100, height: 120, borderRadius: 16, borderWidth: 2, borderColor: '#E5E7EB', borderStyle: 'dashed', justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.5)' },

    // Cooler
    coolerSection: { backgroundColor: 'white', borderTopLeftRadius: 32, borderTopRightRadius: 32, borderBottomLeftRadius: 32, borderBottomRightRadius: 32, marginTop: -16, paddingTop: 32, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 5, minHeight: 400 },
    sectionTitleCooler: { fontSize: 20, fontWeight: '700', color: '#111827', marginLeft: 4 },
    countBadgeCooler: { backgroundColor: '#ECFDF5', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12, marginLeft: 8 },
    countTextCooler: { fontSize: 10, fontWeight: '700', color: '#047857', textTransform: 'uppercase' },
    addBtnCooler: { backgroundColor: '#7C3AED', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
    addBtnCoolerText: { color: 'white', fontSize: 12, fontWeight: 'bold' },

    coolerGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 24, paddingBottom: 100 },
    gridItemWrapper: { width: '33.33%', padding: 6 },
    addPlaceholderCooler: { width: '30%', aspectRatio: 1, borderRadius: 16, borderWidth: 2, borderColor: '#F3F4F6', borderStyle: 'dashed', justifyContent: 'center', alignItems: 'center', backgroundColor: '#F9FAFB', margin: 6 },

    emptyText: { color: '#9CA3AF', fontStyle: 'italic', paddingLeft: 10 }
});

export default FridgeScreen;    