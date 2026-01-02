import React, { useState } from 'react';
import { View, Text, Modal, TextInput, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { IconButton } from 'react-native-paper';
import dayjs from 'dayjs';

const AddFoodModal = ({ visible, onClose, onAdd }) => {
    const [form, setForm] = useState({
        foodName: '',
        quantity: '',
        unitName: '',
        compartment: 'Cooler',
        categoryName: '',
        useWithin: dayjs().add(7, 'day').format('YYYY-MM-DD'),
        note: ''
    });

    const resetForm = () => {
        setForm({
            foodName: '',
            quantity: '',
            unitName: '',
            compartment: 'Cooler',
            categoryName: '',
            useWithin: dayjs().add(7, 'day').format('YYYY-MM-DD'),
            note: ''
        });
    };

    const handleAdd = () => {
        if (!form.foodName || !form.quantity || !form.unitName || !form.useWithin) {
            Alert.alert('Missing Fields', 'Please fill name, quantity, unit, and date.');
            return;
        }
        // Send to parent
        onAdd(form);
        resetForm();
    };

    return (
        <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <View style={styles.header}>
                        <Text style={styles.title}>Add Item</Text>
                        <TouchableOpacity onPress={onClose}>
                            <IconButton icon="close" size={20} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView contentContainerStyle={styles.body}>
                        {/* Food Name */}
                        <Text style={styles.label}>FOOD NAME</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="e.g. Chicken"
                            value={form.foodName}
                            onChangeText={t => setForm({ ...form, foodName: t })}
                        />

                        {/* Quantity & Unit Row */}
                        <View style={styles.row}>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.label}>QUANTITY</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="e.g. 1"
                                    keyboardType="numeric"
                                    value={form.quantity}
                                    onChangeText={t => setForm({ ...form, quantity: t })}
                                />
                            </View>
                            <View style={{ width: 10 }} />
                            <View style={{ flex: 1 }}>
                                <Text style={styles.label}>UNIT</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="e.g. kg, box"
                                    value={form.unitName}
                                    onChangeText={t => setForm({ ...form, unitName: t })}
                                />
                            </View>
                        </View>

                        {/* Compartment Selector */}
                        <Text style={styles.label}>COMPARTMENT</Text>
                        <View style={styles.compartmentRow}>
                            <TouchableOpacity
                                style={[styles.compBtn, form.compartment === 'Freezer' && styles.compBtnActive]}
                                onPress={() => setForm({ ...form, compartment: 'Freezer' })}
                            >
                                <Text style={[styles.compBtnText, form.compartment === 'Freezer' && styles.compBtnTextActive]}>Freezer</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.compBtn, form.compartment === 'Cooler' && styles.compBtnActive]}
                                onPress={() => setForm({ ...form, compartment: 'Cooler' })}
                            >
                                <Text style={[styles.compBtnText, form.compartment === 'Cooler' && styles.compBtnTextActive]}>Cooler</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Category (Needed for new items) */}
                        <Text style={styles.label}>CATEGORY (For New Items)</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="e.g. Meat, Vegetable"
                            value={form.categoryName}
                            onChangeText={t => setForm({ ...form, categoryName: t })}
                        />

                        {/* Date */}
                        <Text style={styles.label}>USE WITHIN (YYYY-MM-DD)</Text>
                        <TextInput
                            style={styles.input}
                            value={form.useWithin}
                            onChangeText={t => setForm({ ...form, useWithin: t })}
                        />

                        {/* Note */}
                        <Text style={styles.label}>NOTE</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Optional"
                            value={form.note}
                            onChangeText={t => setForm({ ...form, note: t })}
                        />

                        <TouchableOpacity style={styles.addBtn} onPress={handleAdd}>
                            <Text style={styles.addBtnText}>Add to Fridge</Text>
                        </TouchableOpacity>

                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
    modalContent: { backgroundColor: 'white', borderRadius: 24, padding: 20, maxHeight: '80%' },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
    title: { fontSize: 20, fontWeight: '800', color: '#111827' },
    body: { paddingBottom: 20 },
    label: { fontSize: 10, fontWeight: '700', color: '#9CA3AF', marginBottom: 6, marginTop: 10 },
    input: { backgroundColor: '#F9FAFB', padding: 12, borderRadius: 12, fontSize: 16 },
    row: { flexDirection: 'row' },
    compartmentRow: { flexDirection: 'row', gap: 10 },
    compBtn: { flex: 1, paddingVertical: 10, borderRadius: 12, backgroundColor: '#F3F4F6', alignItems: 'center' },
    compBtnActive: { backgroundColor: '#7C3AED' },
    compBtnText: { fontWeight: '600', color: '#4B5563' },
    compBtnTextActive: { color: 'white' },
    addBtn: { backgroundColor: '#7C3AED', paddingVertical: 14, borderRadius: 16, alignItems: 'center', marginTop: 20 },
    addBtnText: { color: 'white', fontWeight: '800', fontSize: 16 }
});

export default AddFoodModal;
