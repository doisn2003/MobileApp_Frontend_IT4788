import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import dayjs from 'dayjs';
import client from '../api/client';

const getImageUrl = (path) => {
    if (!path) return 'https://via.placeholder.com/150';
    if (path.startsWith('http')) return path;

    // We need to construct the full URL.
    // client.defaults.baseURL is http://192.168.1.7:3000/it4788
    // Images are usually at http://192.168.1.7:3000/uploads/...
    // So we need to remove '/it4788' from base URL.

    let baseUrl = client.defaults.baseURL || '';
    if (baseUrl.endsWith('/it4788')) {
        baseUrl = baseUrl.replace('/it4788', '');
    }

    // Ensure no double slashes
    if (baseUrl.endsWith('/')) baseUrl = baseUrl.slice(0, -1);

    const cleanPath = path.replace(/\\/g, '/');
    const finalPath = cleanPath.startsWith('/') ? cleanPath : `/${cleanPath}`;

    return `${baseUrl}${finalPath}`;
};

export const FreezerItem = ({ item, onClick }) => (
    <TouchableOpacity
        style={styles.freezerItem}
        onPress={() => onClick(item)}
        activeOpacity={0.9}
    >
        <View style={styles.freezerImageContainer}>
            <Image source={{ uri: getImageUrl(item.foodId?.image) }} style={styles.freezerImage} />
        </View>
        <View style={styles.freezerInfo}>
            <Text style={styles.freezerName} numberOfLines={1}>{item.foodId?.name || 'Unknown'}</Text>
            <Text style={styles.freezerQty}>{item.quantity}</Text>
        </View>
    </TouchableOpacity>
);

export const CoolerItem = ({ item, onClick }) => {
    const isExpired = dayjs(item.useWithin).isBefore(dayjs());
    const isNearExpiry = dayjs(item.useWithin).isBefore(dayjs().add(3, 'day'));
    const statusColor = isExpired ? '#EF4444' : (isNearExpiry ? '#F59E0B' : '#10B981');

    return (
        <TouchableOpacity
            style={styles.coolerItem}
            onPress={() => onClick(item)}
            activeOpacity={0.9}
        >
            <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
            <View style={styles.coolerImageContainer}>
                <Image source={{ uri: getImageUrl(item.foodId?.image) }} style={styles.coolerImage} />
            </View>
            <Text style={styles.coolerName} numberOfLines={1}>{item.foodId?.name || 'Unknown'}</Text>
            <Text style={[styles.coolerQty, isExpired && styles.textExpired]}>{item.quantity}</Text>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    // Freezer Item
    freezerItem: { width: 120, backgroundColor: 'white', borderRadius: 16, padding: 12, marginRight: 16, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
    freezerImageContainer: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#F9FAFB', overflow: 'hidden', marginBottom: 8 },
    freezerImage: { width: '100%', height: '100%' },
    freezerInfo: { alignItems: 'center' },
    freezerName: { fontSize: 14, fontWeight: '600', color: '#1F2937', textAlign: 'center' },
    freezerQty: { fontSize: 10, color: '#6B7280' },

    // Cooler Item
    coolerItem: { backgroundColor: 'white', borderRadius: 16, padding: 10, borderWidth: 1, borderColor: '#F3F4F6', alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.02, elevation: 1 },
    coolerImageContainer: { width: 50, height: 50, borderRadius: 12, backgroundColor: '#F9FAFB', overflow: 'hidden', marginBottom: 8 },
    coolerImage: { width: '100%', height: '100%' },
    coolerName: { fontSize: 11, fontWeight: '600', color: '#1F2937', textAlign: 'center' },
    coolerQty: { fontSize: 10, color: '#9CA3AF' },
    textExpired: { color: '#EF4444', fontWeight: '600' },
    statusDot: { position: 'absolute', top: 8, right: 8, width: 8, height: 8, borderRadius: 4, zIndex: 1 },
});
