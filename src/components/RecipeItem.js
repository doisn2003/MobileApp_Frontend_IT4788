import React from 'react';
import { View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Text, Card, IconButton } from 'react-native-paper';
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

const RecipeItem = ({ item, onPress, onLongPress, isSelected, isSelectMode, onDelete, compact = false }) => {
    // Default stats
    const stats = item.nutrition || { kcal: 0, protein: 0 };

    // Check if we should render compact size (User requested 70%)
    // Original image height was 120. 70% is ~84.
    const imageHeight = compact ? 90 : 120;
    const titleSize = compact ? 12 : 14;

    return (
        <Card
            style={[
                styles.card,
                isSelected && styles.selectedCard
            ]}
            onPress={() => onPress(item)}
            onLongPress={() => onLongPress && onLongPress(item)}
            delayLongPress={200}
        >
            <View>
                <Card.Cover source={{ uri: getImageUrl(item.image) }} style={[styles.image, { height: imageHeight }]} />

                {/* Selection Overlay */}
                {isSelected && (
                    <View style={styles.selectedOverlay}>
                        <View style={styles.checkIcon}>
                            <Text style={{ color: 'white', fontWeight: 'bold' }}>✓</Text>
                        </View>
                    </View>
                )}

                {/* Delete Button (Top Right) */}
                {onDelete && (
                    <TouchableOpacity style={styles.deleteBtn} onPress={() => onDelete(item)}>
                        <IconButton icon="close" size={14} iconColor="white" style={{ margin: 0 }} />
                    </TouchableOpacity>
                )}
            </View>
            <Card.Content style={styles.content}>
                <Text style={[styles.title, { fontSize: titleSize }]} numberOfLines={2}>{item.name}</Text>
                <View style={styles.metaRow}>
                    <Text style={styles.metaText}>{stats.kcal} kcal</Text>
                    <Text style={styles.metaTextDot}>•</Text>
                    <Text style={styles.metaText}>{stats.protein}g protein</Text>
                </View>
            </Card.Content>
        </Card>
    );
};

const styles = StyleSheet.create({
    card: {
        marginBottom: 10,
        backgroundColor: 'white',
        borderRadius: 12,
        elevation: 2,
        overflow: 'hidden'
    },
    selectedCard: {
        borderColor: '#7C3AED',
        borderWidth: 2,
    },
    selectedOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(124, 58, 237, 0.3)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1
    },
    checkIcon: {
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: '#7C3AED',
        justifyContent: 'center',
        alignItems: 'center',
    },
    deleteBtn: {
        position: 'absolute',
        top: 4,
        right: 4,
        backgroundColor: 'rgba(239, 68, 68, 0.9)', // Red
        borderRadius: 12, // Circle
        width: 24,
        height: 24,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 2,
        elevation: 3
    },
    image: {
        // height set dynamically
    },
    content: {
        paddingVertical: 6,
        paddingHorizontal: 8,
    },
    title: {
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 2,
        height: 36
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    metaText: {
        fontSize: 10,
        color: '#6B7280',
        fontWeight: '500'
    },
    metaTextDot: {
        fontSize: 10,
        color: '#6B7280',
        marginHorizontal: 4
    }
});

export default RecipeItem;
