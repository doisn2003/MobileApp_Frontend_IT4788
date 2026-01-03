import React from 'react';
import { View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Text, Card } from 'react-native-paper';
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

const RecipeItem = ({ item, onPress }) => {
    return (
        <Card style={styles.card} onPress={() => onPress(item)}>
            <Card.Cover source={{ uri: getImageUrl(item.image) }} style={styles.image} />
            <Card.Content style={styles.content}>
                <Text style={styles.title} numberOfLines={2}>{item.name}</Text>
                <View style={styles.metaRow}>
                    <Text style={styles.metaText}>{item.nutrition?.kcal || 0} kcal</Text>
                    <Text style={styles.metaTextDot}>•</Text>
                    <Text style={styles.metaText}>{item.nutrition?.protein || 0}g protein</Text>
                </View>
            </Card.Content>
        </Card>
    );
};

const styles = StyleSheet.create({
    card: {
        marginBottom: 12,
        backgroundColor: 'white',
        borderRadius: 12,
        elevation: 2,
        overflow: 'hidden'
    },
    image: {
        height: 120,
    },
    content: {
        paddingVertical: 8,
        paddingHorizontal: 10,
    },
    title: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 4,
        height: 40 // Fixed height for 2 lines
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    metaText: {
        fontSize: 11,
        color: '#6B7280',
        fontWeight: '500'
    },
    metaTextDot: {
        fontSize: 11,
        color: '#6B7280',
        marginHorizontal: 4
    }
});

export default RecipeItem;
