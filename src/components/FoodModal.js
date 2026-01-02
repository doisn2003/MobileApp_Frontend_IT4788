import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, Modal, TextInput, StyleSheet } from 'react-native';
import { IconButton } from 'react-native-paper';
import dayjs from 'dayjs';
import client from '../api/client';

const getImageUrl = (path) => {
    if (!path) return 'https://via.placeholder.com/150';
    if (path.startsWith('http')) return path;

    let baseUrl = client.defaults.baseURL || '';
    if (baseUrl.endsWith('/it4788')) {
        baseUrl = baseUrl.replace('/it4788', '');
    }
    if (baseUrl.endsWith('/')) baseUrl = baseUrl.slice(0, -1);

    const cleanPath = path.replace(/\\/g, '/');
    const finalPath = cleanPath.startsWith('/') ? cleanPath : `/${cleanPath}`;

    return `${baseUrl}${finalPath}`;
};

const FoodModal = ({ item, visible, onClose, onSave, onDelete }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [formValues, setFormValues] = useState({ quantity: '', note: '' });

    useEffect(() => {
        if (item) {
            setFormValues({
                quantity: item.quantity,
                note: item.note || ''
            });
            setIsEditing(false);
        }
    }, [item]);

    if (!item) return null;

    const handleSave = () => {
        onSave(item._id, formValues);
        setIsEditing(false);
    };

    return (
        <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    {/* Header Image */}
                    <View style={styles.modalHeader}>
                        <Image source={{ uri: getImageUrl(item.foodId?.image) }} style={styles.modalHeaderImage} />
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <IconButton icon="close" iconColor="white" size={20} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.modalBody}>
                        {!isEditing ? (
                            <>
                                <View>
                                    <Text style={styles.modalTitle}>{item.foodId?.name}</Text>
                                    <Text style={styles.modalSubtitle}>Số lượng: {item.quantity}</Text>
                                    <Text style={styles.modalSubtitle}>Hạn sử dụng: {dayjs(item.useWithin).format('DD/MM/YYYY')}</Text>
                                    {item.note && <Text style={styles.modalNote}>Ghi chú: {item.note}</Text>}
                                    <View style={styles.metaRow}>
                                        <Text style={styles.modalMeta}>Địa điểm: {item.compartment === 'freezer' ? 'Ngăn Đá' : 'Ngăn Mát'}</Text>
                                    </View>
                                </View>

                                <View style={styles.modalActions}>
                                    <TouchableOpacity style={styles.btnPrimary} onPress={() => setIsEditing(true)}>
                                        <Text style={styles.btnPrimaryText}>Chỉnh sửa thông tin 📝</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.btnDelete} onPress={() => onDelete(item.foodId?.name)}>
                                        <IconButton icon="delete" iconColor="#EF4444" size={24} />
                                    </TouchableOpacity>
                                </View>
                            </>
                        ) : (
                            <View style={styles.formContainer}>
                                <Text style={styles.inputLabel}>Số lượng</Text>
                                <TextInput
                                    style={styles.input}
                                    value={formValues.quantity}
                                    onChangeText={t => setFormValues({ ...formValues, quantity: t })}
                                />

                                <Text style={styles.inputLabel}>Ghi chú</Text>
                                <TextInput
                                    style={styles.input}
                                    value={formValues.note}
                                    onChangeText={t => setFormValues({ ...formValues, note: t })}
                                />

                                <View style={styles.formActions}>
                                    <TouchableOpacity style={styles.btnCancel} onPress={() => setIsEditing(false)}>
                                        <Text style={styles.btnCancelText}>Hủy</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.btnPrimary} onPress={handleSave}>
                                        <Text style={styles.btnPrimaryText}>Lưu thay đổi</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        )}
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: 'white', borderTopLeftRadius: 24, borderTopRightRadius: 24, overflow: 'hidden', height: '80%' },
    modalHeader: { height: 200, backgroundColor: '#F3F4F6' },
    modalHeaderImage: { width: '100%', height: '100%' },
    closeButton: { position: 'absolute', top: 16, right: 16, backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 20 },
    modalBody: { padding: 24, flex: 1 },
    modalTitle: { fontSize: 24, fontWeight: '800', color: '#111827', marginBottom: 4 },
    modalSubtitle: { fontSize: 14, fontWeight: '500', color: '#6B7280', marginBottom: 2 },
    modalNote: { fontSize: 14, fontStyle: 'italic', color: '#4B5563', marginVertical: 8 },
    metaRow: { flexDirection: 'row', gap: 10, marginTop: 12 },
    modalMeta: { fontSize: 10, fontWeight: 'bold', color: '#9CA3AF', letterSpacing: 1 },
    modalActions: { flexDirection: 'row', marginTop: 24, gap: 12, alignItems: 'center' },
    btnPrimary: { flex: 1, backgroundColor: '#7C3AED', paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
    btnPrimaryText: { color: 'white', fontWeight: '700', fontSize: 14 },
    btnDelete: { backgroundColor: '#FEF2F2', padding: 10, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },

    formContainer: { marginTop: 10 },
    inputLabel: { fontSize: 12, fontWeight: '700', color: '#9CA3AF', textTransform: 'uppercase', marginBottom: 4 },
    input: { backgroundColor: '#F9FAFB', padding: 12, borderRadius: 12, fontSize: 16, marginBottom: 16 },
    formActions: { flexDirection: 'row', gap: 12, marginTop: 8 },
    btnCancel: { flex: 1, backgroundColor: '#F3F4F6', paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
    btnCancelText: { color: '#4B5563', fontWeight: '600' }
});

export default FoodModal;
