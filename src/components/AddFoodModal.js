import React, { useState, useEffect } from 'react';
import { View, Text, Modal, TextInput, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { IconButton } from 'react-native-paper';
import dayjs from 'dayjs';
import client from '../api/client';

const AddFoodModal = ({ visible, onClose, onAdd, initialCompartment = 'Cooler' }) => {
    const [form, setForm] = useState({
        foodName: '',
        quantity: '',
        unitName: '',
        compartment: initialCompartment,
        categoryName: '',
        useWithin: dayjs().add(7, 'day').format('YYYY-MM-DD'),
        note: ''
    });

    const [categories, setCategories] = useState([]);
    const [units, setUnits] = useState([]);

    // Reset or update form when visible or initialCompartment changes
    useEffect(() => {
        if (visible) {
            setForm(prev => ({
                ...prev,
                compartment: initialCompartment
            }));
            fetchOptions();
        }
    }, [visible, initialCompartment]);

    const fetchOptions = async () => {
        try {
            const [catRes, unitRes] = await Promise.all([
                client.get('/food/categories'),
                client.get('/food/units')
            ]);
            if (catRes.data.data) setCategories(catRes.data.data);
            if (unitRes.data.data) setUnits(unitRes.data.data);
        } catch (e) {
            console.log('Error fetching options', e);
        }
    };

    const resetForm = () => {
        setForm({
            foodName: '',
            quantity: '',
            unitName: '',
            compartment: initialCompartment,
            categoryName: '',
            useWithin: dayjs().add(7, 'day').format('YYYY-MM-DD'),
            note: ''
        });
    };

    const handleAdd = () => {
        if (!form.foodName || !form.quantity || !form.unitName || !form.useWithin) {
            Alert.alert('Vui lòng điền đầy đủ thông tin.');
            return;
        }
        onAdd(form);
        resetForm();
    };

    return (
        <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <View style={styles.header}>
                        <Text style={styles.title}>Thêm Thực Phẩm Vào Tủ</Text>
                        <TouchableOpacity onPress={onClose}>
                            <IconButton icon="close" size={20} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView contentContainerStyle={styles.body}>
                        {/* Food Name */}
                        <Text style={styles.label}>Tên Thực Phẩm</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="vd: Thịt gà"
                            value={form.foodName}
                            onChangeText={t => setForm({ ...form, foodName: t })}
                        />

                        {/* Quantity */}
                        <Text style={styles.label}>Số lượng</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="vd: 1"
                            keyboardType="numeric"
                            value={form.quantity}
                            onChangeText={t => setForm({ ...form, quantity: t })}
                        />

                        {/* Unit Selection */}
                        <Text style={styles.label}>Đơn vị</Text>
                        <View style={styles.chipWrapper}>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipContainer}>
                                {units.map(u => (
                                    <TouchableOpacity
                                        key={u._id}
                                        style={[styles.chip, form.unitName === u.name && styles.chipActive]}
                                        onPress={() => setForm({ ...form, unitName: u.name })}
                                    >
                                        <Text style={form.unitName === u.name ? styles.chipTextActive : styles.chipText}>{u.name}</Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>
                        {/* Manual Unit Input Fallback (Optional, keeps UI flexible) */}
                        <TextInput
                            style={[styles.input, { marginTop: 4 }]}
                            placeholder="Hoặc nhập đơn vị khác..."
                            value={form.unitName}
                            onChangeText={t => setForm({ ...form, unitName: t })}
                        />

                        {/* Category Selection */}
                        <Text style={styles.label}>Danh mục (Loại thực phẩm)</Text>
                        <View style={styles.chipWrapper}>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipContainer}>
                                {categories.map(c => (
                                    <TouchableOpacity
                                        key={c._id}
                                        style={[styles.chip, form.categoryName === c.name && styles.chipActive]}
                                        onPress={() => setForm({ ...form, categoryName: c.name })}
                                    >
                                        <Text style={form.categoryName === c.name ? styles.chipTextActive : styles.chipText}>{c.name}</Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>
                        <TextInput
                            style={[styles.input, { marginTop: 4 }]}
                            placeholder="Hoặc nhập loại khác..."
                            value={form.categoryName}
                            onChangeText={t => setForm({ ...form, categoryName: t })}
                        />

                        {/* Date */}
                        <Text style={styles.label}>Hạn sử dụng (YYYY-MM-DD)</Text>
                        <TextInput
                            style={styles.input}
                            value={form.useWithin}
                            onChangeText={t => setForm({ ...form, useWithin: t })}
                        />

                        {/* Note */}
                        <Text style={styles.label}>Ghi chú</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Tùy chọn"
                            value={form.note}
                            onChangeText={t => setForm({ ...form, note: t })}
                        />

                        <TouchableOpacity style={styles.addBtn} onPress={handleAdd}>
                            <Text style={styles.addBtnText}>Thêm vào tủ lạnh</Text>
                        </TouchableOpacity>

                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
    modalContent: { backgroundColor: 'white', borderRadius: 24, padding: 20, maxHeight: '90%' },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
    title: { fontSize: 20, fontWeight: '800', color: '#111827' },
    body: { paddingBottom: 20 },
    label: { fontSize: 12, fontWeight: '700', color: '#9CA3AF', marginBottom: 6, marginTop: 12, textTransform: 'uppercase' },
    input: { backgroundColor: '#F9FAFB', padding: 12, borderRadius: 12, fontSize: 13, color: '#184f1cff' },

    chipWrapper: { height: 40 },
    chipContainer: { flexDirection: 'row', gap: 8, alignItems: 'center', paddingRight: 20 },
    chip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, backgroundColor: '#F3F4F6', borderWidth: 1, borderColor: '#E5E7EB' },
    chipActive: { backgroundColor: '#EDE9FE', borderColor: '#7C3AED' },
    chipText: { fontSize: 13, color: '#4B5563' },
    chipTextActive: { color: '#7C3AED', fontWeight: '700' },

    addBtn: { backgroundColor: '#7C3AED', paddingVertical: 14, borderRadius: 16, alignItems: 'center', marginTop: 24 },
    addBtnText: { color: 'white', fontWeight: '800', fontSize: 16 }
});

export default AddFoodModal;
