import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, Alert } from 'react-native';
import { Text, List, FAB, ActivityIndicator, IconButton } from 'react-native-paper';
import client from '../../api/client';
import { useIsFocused } from '@react-navigation/native';
import dayjs from 'dayjs';

const FridgeScreen = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const isFocused = useIsFocused();

    const fetchFridgeItems = async () => {
        setLoading(true);
        try {
            const response = await client.get('/fridge/');
            // response.data.data
            if (response.data && response.data.data) {
                setItems(response.data.data);
            }
        } catch (e) {
            console.log(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isFocused) {
            fetchFridgeItems();
        }
    }, [isFocused]);

    const handleDelete = async (foodName) => {
        try {
            await client.delete('/fridge/', { data: { foodName } });
            fetchFridgeItems();
        } catch (e) {
            Alert.alert('Error', 'Could not delete item');
        }
    };

    const renderItem = ({ item }) => (
        <List.Item
            title={`${item.foodName} (${item.quantity})`}
            description={`Exp: ${dayjs(item.useWithin).format('DD/MM/YYYY')} - ${item.note || ''}`}
            left={props => <List.Icon {...props} icon="food-apple" />}
            right={props => <IconButton {...props} icon="delete" onPress={() => handleDelete(item.foodName)} />}
        />
    );

    if (loading) return <View style={styles.centered}><ActivityIndicator /></View>;

    return (
        <View style={styles.container}>
            <FlatList
                data={items}
                keyExtractor={(item) => item._id || item.id || Math.random().toString()}
                renderItem={renderItem}
                ListEmptyComponent={<View style={styles.centered}><Text>Fridge is empty!</Text></View>}
            />
            <FAB
                style={styles.fab}
                icon="plus"
                onPress={() => Alert.alert('Notice', 'Add Item feature coming soon!')}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
    fab: { position: 'absolute', margin: 16, right: 0, bottom: 0 },
});

export default FridgeScreen;
