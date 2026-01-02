import React, { useState, useEffect, useMemo, useContext } from 'react';
import { View, StyleSheet, FlatList, Alert, ScrollView, TouchableOpacity, StatusBar, SafeAreaView, Platform } from 'react-native';
import { Text, IconButton } from 'react-native-paper';
import { useIsFocused } from '@react-navigation/native';
import client from '../../api/client';
import { AuthContext } from '../../contexts/AuthContext';

import { FreezerItem, CoolerItem } from '../../components/FoodItem';
import FoodModal from '../../components/FoodModal';
import AddFoodModal from '../../components/AddFoodModal';

const FridgeScreen = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);

    // Selection State
    const [selectedItem, setSelectedItem] = useState(null);
    const [detailVisible, setDetailVisible] = useState(false);

    // Add State
    const [addVisible, setAddVisible] = useState(false);

    const isFocused = useIsFocused();
    const { logout } = useContext(AuthContext);

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
        } catch (e) {
            console.log('Fetch Error:', e);
            if (e.response && e.response.status === 401) {
                Alert.alert('Session Expired', 'Please login again', [
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
            await client.put('/fridge/', { itemId: id, newQuantity: values.quantity });
            fetchFridgeItems();
            setDetailVisible(false);
        } catch (e) {
            Alert.alert('Error', 'Update failed');
        }
    };

    const handleDelete = async (foodName) => {
        Alert.alert('Confirm', 'Delete this item?', [
            { text: 'Cancel' },
            {
                text: 'Delete',
                style: 'destructive',
                onPress: async () => {
                    try {
                        await client.delete('/fridge/', { data: { foodName } });
                        setDetailVisible(false);
                        fetchFridgeItems();
                    } catch (e) {
                        Alert.alert('Error', 'Delete failed');
                    }
                }
            }
        ]);
    };

    const handleAddItem = async (formData) => {
        try {
            const data = new FormData();
            data.append('foodName', formData.foodName);
            data.append('quantity', formData.quantity);
            data.append('unitName', formData.unitName);
            data.append('compartment', formData.compartment);
            data.append('categoryName', formData.categoryName);
            data.append('useWithin', formData.useWithin);
            if (formData.note) data.append('note', formData.note);

            await client.post('/fridge/', data, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            setAddVisible(false);
            fetchFridgeItems();
            Alert.alert('Success', 'Item added to fridge!');
        } catch (e) {
            console.log(e.response?.data);
            Alert.alert('Error', e.response?.data?.message || 'Failed to add item');
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Fridge</Text>
                <View style={{ flexDirection: 'row' }}>
                    <IconButton icon="logout" size={24} iconColor="#EF4444" onPress={logout} />
                    <IconButton icon="magnify" size={24} iconColor="#9CA3AF" style={styles.searchBtn} />
                </View>
            </View>

            <ScrollView style={styles.mainScroll} contentContainerStyle={{ paddingBottom: 100 }}>
                {/* FREEZER SECTION */}
                <View style={styles.freezerSection}>
                    <View style={styles.sectionHeader}>
                        <View style={styles.sectionTitleRow}>
                            <IconButton icon="snowflake" size={20} iconColor="#2563EB" style={{ margin: 0 }} />
                            <Text style={styles.sectionTitleFreezer}>Freezer</Text>
                            <View style={styles.countBadgeFreezer}>
                                <Text style={styles.countTextFreezer}>{sortedFreezer.length} items</Text>
                            </View>
                        </View>
                        <TouchableOpacity onPress={() => setAddVisible(true)}>
                            <Text style={styles.addBtnText}>+ Add</Text>
                        </TouchableOpacity>
                    </View>

                    <FlatList
                        horizontal
                        data={sortedFreezer}
                        renderItem={({ item }) => <FreezerItem item={item} onClick={handleItemClick} />}
                        keyExtractor={item => item._id}
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.freezerList}
                        ListFooterComponent={
                            <TouchableOpacity style={styles.addPlaceholderFreezer} onPress={() => setAddVisible(true)}>
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
                            <Text style={styles.sectionTitleCooler}>Cooler</Text>
                            <View style={styles.countBadgeCooler}>
                                <Text style={styles.countTextCooler}>{sortedCooler.length} items</Text>
                            </View>
                        </View>
                        <TouchableOpacity style={styles.addBtnCooler} onPress={() => setAddVisible(true)}>
                            <Text style={styles.addBtnCoolerText}>+ Add Item</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.coolerGrid}>
                        {sortedCooler.map(item => (
                            <View key={item._id} style={styles.gridItemWrapper}>
                                <CoolerItem item={item} onClick={handleItemClick} />
                            </View>
                        ))}
                        <TouchableOpacity style={styles.addPlaceholderCooler} onPress={() => setAddVisible(true)}>
                            <IconButton icon="plus" size={30} iconColor="#E5E7EB" />
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>

            <FoodModal
                item={selectedItem}
                visible={detailVisible}
                onClose={() => setDetailVisible(false)}
                onSave={handleUpdate}
                onDelete={handleDelete}
            />

            <AddFoodModal
                visible={addVisible}
                onClose={() => setAddVisible(false)}
                onAdd={handleAddItem}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFFFFF', paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
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
    addBtnText: { color: '#7C3AED', fontWeight: 'bold', fontSize: 14 },

    freezerList: { paddingHorizontal: 24 },
    freezerItem: { width: 120, backgroundColor: 'white', borderRadius: 16, padding: 12, marginRight: 16, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
    freezerImageContainer: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#F9FAFB', overflow: 'hidden', marginBottom: 8 },
    freezerImage: { width: '100%', height: '100%' },
    freezerInfo: { alignItems: 'center' },
    freezerName: { fontSize: 14, fontWeight: '600', color: '#1F2937', textAlign: 'center' },
    freezerQty: { fontSize: 10, color: '#6B7280' },
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
    coolerItem: { backgroundColor: 'white', borderRadius: 16, padding: 10, borderWidth: 1, borderColor: '#F3F4F6', alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.02, elevation: 1 },
    coolerImageContainer: { width: 50, height: 50, borderRadius: 12, backgroundColor: '#F9FAFB', overflow: 'hidden', marginBottom: 8 },
    coolerImage: { width: '100%', height: '100%' },
    coolerName: { fontSize: 11, fontWeight: '600', color: '#1F2937', textAlign: 'center' },
    coolerQty: { fontSize: 10, color: '#9CA3AF' },
    textExpired: { color: '#EF4444', fontWeight: '600' },
    statusDot: { position: 'absolute', top: 8, right: 8, width: 8, height: 8, borderRadius: 4, zIndex: 1 },
    addPlaceholderCooler: { width: '30%', aspectRatio: 1, borderRadius: 16, borderWidth: 2, borderColor: '#F3F4F6', borderStyle: 'dashed', justifyContent: 'center', alignItems: 'center', backgroundColor: '#F9FAFB', margin: 6 },

    // Modal
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: 'white', borderTopLeftRadius: 24, borderTopRightRadius: 24, overflow: 'hidden', height: '80%' },
    modalHeader: { height: 200, backgroundColor: '#F3F4F6' },
    modalHeaderImage: { width: '100%', height: '100%' },
    closeButton: { position: 'absolute', top: 16, right: 16, backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 20 },
    modalBody: { padding: 24, flex: 1 },
    modalTitle: { fontSize: 24, fontWeight: '800', color: '#111827', marginBottom: 4 },
    modalSubtitle: { fontSize: 14, fontWeight: '500', color: '#6B7280', marginBottom: 2 },
    modalNote: { fontSize: 14, fontStyle: 'italic', color: '#4B5563', marginVertical: 8 },
    modalMeta: { fontSize: 10, fontWeight: 'bold', color: '#9CA3AF', letterSpacing: 1, marginTop: 12 },
    modalActions: { flexDirection: 'row', marginTop: 24, gap: 12, alignItems: 'center' },
    btnPrimary: { flex: 1, backgroundColor: '#7C3AED', paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
    btnPrimaryText: { color: 'white', fontWeight: '700', fontSize: 14 },
    btnDelete: { backgroundColor: '#FEF2F2', padding: 10, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },

    // Form
    formContainer: { marginTop: 10 },
    inputLabel: { fontSize: 12, fontWeight: '700', color: '#9CA3AF', textTransform: 'uppercase', marginBottom: 4 },
    input: { backgroundColor: '#F9FAFB', padding: 12, borderRadius: 12, fontSize: 16, marginBottom: 16 },
    formActions: { flexDirection: 'row', gap: 12, marginTop: 8 },
    btnCancel: { flex: 1, backgroundColor: '#F3F4F6', paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
    btnCancelText: { color: '#4B5563', fontWeight: '600' }
});

export default FridgeScreen;
