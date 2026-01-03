import React, { useState, useEffect, useMemo, useContext } from 'react';
import { View, StyleSheet, FlatList, Alert, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, IconButton } from 'react-native-paper';
import { useIsFocused } from '@react-navigation/native';
import client from '../../api/client';
import { AuthContext } from '../../contexts/AuthContext';

import { FreezerItem, CoolerItem } from '../../components/FoodItem';
import FoodModal from '../../components/FoodModal';
import AddFoodModal from '../../components/AddFoodModal';
import Refresh from '../../components/Refresh';

const FridgeScreen = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);

    // Selection State
    const [selectedItem, setSelectedItem] = useState(null);
    const [detailVisible, setDetailVisible] = useState(false);

    // Add State
    const [addOptions, setAddOptions] = useState({ visible: false, compartment: 'Cooler' });

    const isFocused = useIsFocused();
    const { logout } = useContext(AuthContext);

    const fetchFridgeItems = async () => {
        setLoading(true);
        try {
            const response = await client.get('/fridge/');
            // Xử lý linh hoạt dữ liệu trả về
            if (response.data && Array.isArray(response.data.data)) {
                setItems(response.data.data);
            } else if (Array.isArray(response.data)) {
                setItems(response.data);
            } else {
                setItems([]);
            }
        } catch (e) {
            console.log('Fetch Error:', e);
            // Kiểm tra mã lỗi session hết hạn
            if (e.response && (e.response.status === 401 || e.response.data?.code === '00011')) {
                Alert.alert('Phiên đăng nhập hết hạn', 'Vui lòng đăng nhập lại', [
                    { text: 'OK', onPress: () => logout() }
                ]);
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

    // Sorting & Filtering
    const sortedFreezer = useMemo(() =>
        items.filter(i => i.compartment === 'Freezer').sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
        [items]
    );

    const sortedCooler = useMemo(() =>
        items.filter(i => (!i.compartment || i.compartment === 'Cooler')).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
        [items]
    );

    const handleItemClick = (item) => {
        setSelectedItem(item);
        setDetailVisible(true);
    };

    const handleUpdate = async (id, values) => {
        try {
            // API Update: PUT fridge/
            await client.put('/fridge/', { 
                itemId: id, 
                newQuantity: values.quantity,
                // Có thể thêm newNote hoặc newUseWithin nếu Modal hỗ trợ
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
                        // DELETE fridge/ yêu cầu body có foodName
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
            // 1. Kiểm tra: Nếu thực phẩm chưa có trong DB (dựa trên tên), cần gọi POST food/ trước.
            // Ở đây ta giả định thực phẩm đã có hoặc chấp nhận rủi ro lỗi 00194 để xử lý đơn giản trước.
            
            // 2. Gọi API thêm vào tủ lạnh (POST fridge/)
            // API này yêu cầu x-www-form-urlencoded, KHÔNG dùng FormData
            const payload = {
                foodName: formData.foodName,
                quantity: formData.quantity,
                useWithin: formData.useWithin,
                // note: formData.note // Nếu backend hỗ trợ note khi create
            };

            await client.post('/fridge/', payload, {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            });

            handleCloseAdd();
            fetchFridgeItems();
            Alert.alert('Thành công!', 'Đã thêm thực phẩm vào tủ lạnh!');
        } catch (e) {
            console.log(e.response?.data);
            const errorCode = e.response?.data?.code;
            const errorMessage = e.response?.data?.message || 'Thêm thất bại!';

            // Mã 00194: Thực phẩm không tồn tại -> Gợi ý người dùng tạo mới
            if (errorCode === '00194') {
                Alert.alert('Chưa có dữ liệu', `Món "${formData.foodName}" chưa có trong hệ thống. Bạn cần tạo món này trong danh mục thực phẩm trước.`);
                // Trong tương lai: Có thể điều hướng sang màn hình "Tạo Food" tại đây
            } else {
                Alert.alert('Thất bại', errorMessage);
            }
        }
    };

    return (
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Tủ Lạnh Gia Đình</Text>
                <View style={{ flexDirection: 'row' }}>
                    <IconButton icon="magnify" size={24} iconColor="#9CA3AF" style={styles.searchBtn} />
                </View>
            </View>

            <Refresh style={styles.mainScroll} contentContainerStyle={{ paddingBottom: 100 }} onRefresh={fetchFridgeItems}>
                {/* FREEZER SECTION */}
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
                    />
                </View>

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
                        <TouchableOpacity style={styles.addPlaceholderCooler} onPress={() => handleOpenAdd('Cooler')}>
                            <IconButton icon="plus" size={30} iconColor="#E5E7EB" />
                        </TouchableOpacity>
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
    // Đã xóa paddingTop thủ công để tránh conflict với SafeAreaView
    container: { flex: 1, backgroundColor: '#FFFFFF' },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, paddingVertical: 16 },
    headerTitle: { fontSize: 28, fontWeight: '800', color: '#111827' },
    searchBtn: { backgroundColor: '#F9FAFB' },

    mainScroll: { flex: 1 },

    // Freezer
    freezerSection: { backgroundColor: '#EFF6FF', paddingBottom: 24, paddingTop: 8 },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, marginBottom: 16 },
    sectionTitleRow: { flexDirection: 'row', alignItems: 'center' },
    sectionTitleFreezer: { fontSize: 20, fontWeight: '700', color: '#1E3A8A', marginLeft: 4 },
    countBadgeFreezer: { backgroundColor: '#DBEAFE', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12, marginLeft: 8 },
    countTextFreezer: { fontSize: 10, fontWeight: '700', color: '#1D4ED8', textTransform: 'uppercase' },
    
    freezerList: { paddingHorizontal: 24 },
    addPlaceholderFreezer: { width: 100, height: 120, borderRadius: 16, borderWidth: 2, borderColor: '#E5E7EB', borderStyle: 'dashed', justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.5)' },

    // Cooler
    coolerSection: { backgroundColor: 'white', borderTopLeftRadius: 32, borderTopRightRadius: 32, marginTop: -16, paddingTop: 32, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 5 },
    sectionTitleCooler: { fontSize: 20, fontWeight: '700', color: '#111827', marginLeft: 4 },
    countBadgeCooler: { backgroundColor: '#ECFDF5', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12, marginLeft: 8 },
    countTextCooler: { fontSize: 10, fontWeight: '700', color: '#047857', textTransform: 'uppercase' },
    addBtnCooler: { backgroundColor: '#7C3AED', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
    addBtnCoolerText: { color: 'white', fontSize: 12, fontWeight: 'bold' },

    coolerGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 24, paddingBottom: 100 },
    gridItemWrapper: { width: '33.33%', padding: 6 },
    addPlaceholderCooler: { width: '30%', aspectRatio: 1, borderRadius: 16, borderWidth: 2, borderColor: '#F3F4F6', borderStyle: 'dashed', justifyContent: 'center', alignItems: 'center', backgroundColor: '#F9FAFB', margin: 6 },
});

export default FridgeScreen;