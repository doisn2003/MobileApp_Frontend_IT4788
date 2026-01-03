import React, { useState } from 'react';
import { View, Text, Modal, TextInput, StyleSheet, TouchableOpacity, ScrollView, Alert, Image } from 'react-native';
import { IconButton } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import client from '../api/client';

const AddRecipeModal = ({ visible, onClose, onAdd, initialData = null }) => {
    const [form, setForm] = useState({
        name: '',
        description: '',
        htmlContent: '',
        ingredients: [{ name: '', quantity: '', unit: '' }],
        nutrition: { kcal: '', protein: '', fat: '', carb: '' },
    });
    const [imageUri, setImageUri] = useState(null);

    // Initial Data Logic
    React.useEffect(() => {
        if (visible) {
            if (initialData) {
                // Populate Logic
                setForm({
                    name: initialData.name || '',
                    description: initialData.description || '',
                    htmlContent: initialData.htmlContent || '',
                    ingredients: initialData.ingredients ? initialData.ingredients.map(i => ({
                        name: i.name,
                        quantity: i.quantity?.toString(),
                        unit: i.unit
                    })) : [{ name: '', quantity: '', unit: '' }],
                    nutrition: {
                        kcal: initialData.nutrition?.kcal?.toString(),
                        protein: initialData.nutrition?.protein?.toString(),
                        fat: initialData.nutrition?.fat?.toString(),
                        carb: initialData.nutrition?.carb?.toString()
                    }
                });
                if (initialData.image && initialData.image.startsWith('http')) {
                    setImageUri(initialData.image);
                } else if (initialData.image) {
                    const baseUrl = client.defaults.baseURL.replace('/it4788', '').replace(/\/$/, '');
                    const cleanPath = initialData.image.replace(/\\/g, '/');
                    const finalPath = cleanPath.startsWith('/') ? cleanPath : `/${cleanPath}`;
                    setImageUri(`${baseUrl}${finalPath}`);
                }
            } else {
                resetForm();
            }
        }
    }, [visible, initialData]);

    const resetForm = () => {
        setForm({
            name: '',
            description: '',
            htmlContent: '',
            ingredients: [{ name: '', quantity: '', unit: '' }],
            nutrition: { kcal: '', protein: '', fat: '', carb: '' },
        });
        setImageUri(null);
    };

    const handleAddIngredient = () => {
        setForm(prev => ({
            ...prev,
            ingredients: [...prev.ingredients, { name: '', quantity: '', unit: '' }]
        }));
    };

    const handleRemoveIngredient = (index) => {
        if (form.ingredients.length === 1) return;
        setForm(prev => ({
            ...prev,
            ingredients: prev.ingredients.filter((_, i) => i !== index)
        }));
    };

    const handleIngredientChange = (text, index, field) => {
        const newIngredients = [...form.ingredients];
        newIngredients[index][field] = text;
        setForm({ ...form, ingredients: newIngredients });
    };

    const updateNutrition = (field, value) => {
        setForm(prev => ({
            ...prev,
            nutrition: { ...prev.nutrition, [field]: value }
        }));
    };

    const handlePickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.8,
        });

        if (!result.canceled) {
            setImageUri(result.assets[0].uri);
        }
    };

    const handleSubmit = () => {
        if (!form.name || form.ingredients.some(ing => !ing.name || !ing.quantity)) {
            Alert.alert('Vui lòng điền tên món và đầy đủ thông tin nguyên liệu.');
            return;
        }

        // Prepare Data
        const payload = {
            ...form,
            ingredients: form.ingredients.map(i => ({ ...i, quantity: parseFloat(i.quantity) })),
            nutrition: {
                kcal: parseFloat(form.nutrition.kcal) || 0,
                protein: parseFloat(form.nutrition.protein) || 0,
                fat: parseFloat(form.nutrition.fat) || 0,
                carb: parseFloat(form.nutrition.carb) || 0,
            },
            imageUri: imageUri // Pass URI to parent
        };

        onAdd(payload);
        resetForm();
    };

    return (
        <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <View style={styles.header}>
                        <Text style={styles.title}>Thêm Công Thức Mới</Text>
                        <TouchableOpacity onPress={onClose}>
                            <IconButton icon="close" size={20} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView contentContainerStyle={styles.body}>
                        {/* Image Picker */}
                        <TouchableOpacity style={styles.imagePicker} onPress={handlePickImage}>
                            {imageUri ? (
                                <Image source={{ uri: imageUri }} style={styles.previewImage} />
                            ) : (
                                <View style={styles.placeholder}>
                                    <IconButton icon="camera" size={30} iconColor="#9CA3AF" />
                                    <Text style={styles.placeholderText}>Chọn ảnh món ăn</Text>
                                </View>
                            )}
                        </TouchableOpacity>

                        {/* Name */}
                        <Text style={styles.label}>Tên Món Ăn</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="vd: Ức gà áp chảo"
                            value={form.name}
                            onChangeText={t => setForm({ ...form, name: t })}
                        />

                        {/* Description */}
                        <Text style={styles.label}>Mô Tả Ngắn</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Mô tả món ăn..."
                            value={form.description}
                            onChangeText={t => setForm({ ...form, description: t })}
                        />

                        {/* Nutrition */}
                        <Text style={styles.label}>Dinh Dưỡng (trên 100g)</Text>
                        <View style={styles.row}>
                            <TextInput
                                style={[styles.input, { flex: 1, marginRight: 5 }]}
                                placeholder="Kcal"
                                keyboardType="numeric"
                                value={form.nutrition.kcal}
                                onChangeText={t => updateNutrition('kcal', t)}
                            />
                            <TextInput
                                style={[styles.input, { flex: 1, marginRight: 5 }]}
                                placeholder="Protein (g)"
                                keyboardType="numeric"
                                value={form.nutrition.protein}
                                onChangeText={t => updateNutrition('protein', t)}
                            />
                        </View>
                        <View style={[styles.row, { marginTop: 8 }]}>
                            <TextInput
                                style={[styles.input, { flex: 1, marginRight: 5 }]}
                                placeholder="Fat (g)"
                                keyboardType="numeric"
                                value={form.nutrition.fat}
                                onChangeText={t => updateNutrition('fat', t)}
                            />
                            <TextInput
                                style={[styles.input, { flex: 1, marginRight: 5 }]}
                                placeholder="Carb (g)"
                                keyboardType="numeric"
                                value={form.nutrition.carb}
                                onChangeText={t => updateNutrition('carb', t)}
                            />
                        </View>

                        {/* Ingredients */}
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Text style={styles.label}>Nguyên Liệu (Map với Tủ lạnh)</Text>
                            <TouchableOpacity onPress={handleAddIngredient}>
                                <Text style={{ color: '#7C3AED', fontWeight: 'bold' }}>+ Thêm dòng</Text>
                            </TouchableOpacity>
                        </View>

                        {form.ingredients.map((ing, idx) => (
                            <View key={idx} style={styles.ingRow}>
                                <TextInput
                                    style={[styles.input, { flex: 2, marginRight: 5, marginBottom: 0 }]}
                                    placeholder="Tên (vd: Thịt gà)"
                                    value={ing.name}
                                    onChangeText={t => handleIngredientChange(t, idx, 'name')}
                                />
                                <TextInput
                                    style={[styles.input, { flex: 1, marginRight: 5, marginBottom: 0 }]}
                                    placeholder="Slg"
                                    keyboardType="numeric"
                                    value={ing.quantity}
                                    onChangeText={t => handleIngredientChange(t, idx, 'quantity')}
                                />
                                <TextInput
                                    style={[styles.input, { flex: 1, marginRight: 5, marginBottom: 0 }]}
                                    placeholder="Đơn vị"
                                    value={ing.unit}
                                    onChangeText={t => handleIngredientChange(t, idx, 'unit')}
                                />
                                <TouchableOpacity onPress={() => handleRemoveIngredient(idx)}>
                                    <IconButton icon="minus-circle" iconColor="#EF4444" size={20} />
                                </TouchableOpacity>
                            </View>
                        ))}

                        {/* HTML Content (Instructions) */}
                        <Text style={styles.label}>Hướng Dẫn (HTML/Text)</Text>
                        <TextInput
                            style={[styles.input, { height: 100, textAlignVertical: 'top' }]}
                            placeholder="<h1>Bước 1</h1><p>Làm sạch...</p>"
                            multiline
                            value={form.htmlContent}
                            onChangeText={t => setForm({ ...form, htmlContent: t })}
                        />

                        <TouchableOpacity style={styles.addBtn} onPress={handleSubmit}>
                            <Text style={styles.addBtnText}>Lưu Công Thức</Text>
                        </TouchableOpacity>

                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
    modalContent: { backgroundColor: 'white', borderRadius: 24, padding: 20, maxHeight: '95%' },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
    title: { fontSize: 20, fontWeight: '800', color: '#111827' },
    body: { paddingBottom: 20 },
    label: { fontSize: 12, fontWeight: '700', color: '#9CA3AF', marginBottom: 6, marginTop: 12, textTransform: 'uppercase' },
    input: { backgroundColor: '#F9FAFB', padding: 12, borderRadius: 12, fontSize: 13, color: '#111827', marginBottom: 10 },
    row: { flexDirection: 'row' },
    ingRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
    addBtn: { backgroundColor: '#7C3AED', paddingVertical: 14, borderRadius: 16, alignItems: 'center', marginTop: 24 },
    addBtnText: { color: 'white', fontWeight: '800', fontSize: 16 },

    imagePicker: { height: 150, backgroundColor: '#F3F4F6', borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 12, overflow: 'hidden', borderWidth: 1, borderColor: '#E5E7EB', borderStyle: 'dashed' },
    previewImage: { width: '100%', height: '100%' },
    placeholder: { alignItems: 'center' },
    placeholderText: { fontSize: 13, color: '#9CA3AF' }
});

export default AddRecipeModal;
