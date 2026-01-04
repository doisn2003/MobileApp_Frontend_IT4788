import React, { useState, useEffect } from 'react';
import { View, Modal, StyleSheet, ScrollView, Image, TouchableOpacity, Alert } from 'react-native';
import { Text, IconButton, Button, Chip } from 'react-native-paper';
import client from '../api/client';
import RenderHtml from 'react-native-render-html';
import { useWindowDimensions } from 'react-native';

const getImageUrl = (path) => {
    if (!path) return 'https://via.placeholder.com/300';
    if (path.startsWith('http')) return path;
    let baseUrl = client.defaults.baseURL || '';
    if (baseUrl.endsWith('/it4788')) baseUrl = baseUrl.replace('/it4788', '');
    if (baseUrl.endsWith('/')) baseUrl = baseUrl.slice(0, -1);
    const cleanPath = path.replace(/\\/g, '/');
    const finalPath = cleanPath.startsWith('/') ? cleanPath : `/${cleanPath}`;
    return `${baseUrl}${finalPath}`;
};

const RecipeModal = ({ visible, onClose, item, fridgeItems = [], onDelete, onEdit }) => {
    const { width } = useWindowDimensions();

    // Logic to check missing ingredients
    const checkAvailability = (ingredientName) => {
        if (!fridgeItems || fridgeItems.length === 0) return false;
        // Case-insensitive check
        return fridgeItems.some(f => f.foodId?.name?.toLowerCase() === ingredientName.toLowerCase());
    };

    if (!item) return null;

    return (
        <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
            <View style={styles.container}>
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    {/* Header Image */}
                    <Image source={{ uri: getImageUrl(item.image) }} style={styles.image} />
                    <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
                        <IconButton icon="close" iconColor="white" size={20} />
                    </TouchableOpacity>

                    <View style={styles.body}>
                        <Text style={styles.title}>{item.name}</Text>

                        {/* Tags */}
                        <View style={styles.tagsRow}>
                            {item.tags && item.tags.map((tag, idx) => (
                                <Chip key={idx} style={styles.tag}>{tag}</Chip>
                            ))}
                        </View>

                        {/* Nutrition */}
                        <View style={styles.nutritionBox}>
                            <View style={styles.nutriItem}>
                                <Text style={styles.nutriVal}>{item.nutrition?.kcal}</Text>
                                <Text style={styles.nutriLabel}>Kcal</Text>
                            </View>
                            <View style={styles.nutriItem}>
                                <Text style={styles.nutriVal}>{item.nutrition?.protein}g</Text>
                                <Text style={styles.nutriLabel}>Protein</Text>
                            </View>
                            <View style={styles.nutriItem}>
                                <Text style={styles.nutriVal}>{item.nutrition?.fat}g</Text>
                                <Text style={styles.nutriLabel}>Fat</Text>
                            </View>
                            <View style={styles.nutriItem}>
                                <Text style={styles.nutriVal}>{item.nutrition?.carb}g</Text>
                                <Text style={styles.nutriLabel}>Carb</Text>
                            </View>
                        </View>

                        <Text style={styles.sectionTitle}>Nguyên liệu</Text>
                        <View style={styles.ingredientList}>
                            {item.ingredients?.map((ing, idx) => {
                                const isAvailable = checkAvailability(ing.name);
                                return (
                                    <View key={idx} style={styles.ingredientRow}>
                                        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                                            <IconButton
                                                icon={isAvailable ? "check-circle" : "alert-circle"}
                                                iconColor={isAvailable ? "#10B981" : "#EF4444"}
                                                size={20}
                                                style={{ margin: 0, marginRight: 8 }}
                                            />
                                            <Text style={[styles.ingName, !isAvailable && styles.missingText]}>
                                                {ing.name}
                                            </Text>
                                        </View>
                                        <Text style={styles.ingQty}>{ing.quantity} {ing.unit}</Text>
                                    </View>
                                );
                            })}
                        </View>

                        <Text style={styles.sectionTitle}>Chế biến</Text>
                        <View style={styles.htmlContainer}>
                            {item.htmlContent ? (
                                <RenderHtml
                                    contentWidth={width - 48}
                                    source={{ html: item.htmlContent }}
                                />
                            ) : (
                                <Text>Chưa có hướng dẫn.</Text>
                            )}
                        </View>

                        {/* Actions */}
                        <View style={styles.actions}>
                            <Button mode="outlined" onPress={() => onEdit && onEdit(item)} style={{ flex: 1, marginRight: 8 }}>Sửa</Button>
                            <Button mode="contained" buttonColor="#EF4444" onPress={() => onDelete && onDelete(item._id)} style={{ flex: 1 }}>Xóa</Button>
                        </View>
                    </View>
                </ScrollView>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: 'white' },
    scrollContent: { paddingBottom: 40 },
    image: { width: '100%', height: 250 },
    closeBtn: { position: 'absolute', top: 16, right: 16, backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 20 },
    body: { padding: 24, marginTop: -20, backgroundColor: 'white', borderTopLeftRadius: 24, borderTopRightRadius: 24 },
    title: { fontSize: 24, fontWeight: 'bold', color: '#111827', marginBottom: 8 },
    tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
    tag: { backgroundColor: '#F3F4F6' },

    nutritionBox: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#F9FAFB', padding: 16, borderRadius: 12, marginBottom: 24 },
    nutriItem: { alignItems: 'center' },
    nutriVal: { fontSize: 16, fontWeight: 'bold', color: '#7C3AED' },
    nutriLabel: { fontSize: 12, color: '#6B7280' },

    sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 12, color: '#374151' },
    ingredientList: { marginBottom: 24 },
    ingredientRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
    ingName: { fontSize: 15, color: '#374151' },
    missingText: { color: '#EF4444' },
    ingQty: { fontWeight: '600', color: '#6B7280' },

    htmlContainer: { marginBottom: 24 },
    actions: { flexDirection: 'row', marginTop: 10 }
});

export default RecipeModal;
