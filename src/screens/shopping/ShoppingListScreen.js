import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, Alert } from 'react-native';
import { Text, List, FAB, Dialog, TextInput, Button, ActivityIndicator, IconButton } from 'react-native-paper';
import client from '../../api/client';
import { useIsFocused } from '@react-navigation/native';
import dayjs from 'dayjs';

const ShoppingListScreen = () => {
    const [lists, setLists] = useState([]);
    const [loading, setLoading] = useState(false);
    const [visible, setVisible] = useState(false);
    const [newListName, setNewListName] = useState('');
    const [createLoading, setCreateLoading] = useState(false);
    const isFocused = useIsFocused();

    const fetchLists = async () => {
        setLoading(true);
        try {
            const response = await client.get('/shopping/');
            setLists(response.data.data || []);
        } catch (e) {
            console.log(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isFocused) {
            fetchLists();
        }
    }, [isFocused]);

    const handleCreateList = async () => {
        if (!newListName) return;
        setCreateLoading(true);
        try {
            await client.post('/shopping/', {
                name: newListName,
                date: dayjs().format('YYYY-MM-DD'),
                // assignToUsername, note... optional
            });
            setNewListName('');
            setVisible(false);
            fetchLists();
        } catch (e) {
            Alert.alert('Error', 'Failed to create list');
        } finally {
            setCreateLoading(false);
        }
    };

    const handleDeleteList = async (listId) => {
        Alert.alert('Confirm', 'Delete this list?', [
            { text: 'Cancel' },
            {
                text: 'Delete', onPress: async () => {
                    try {
                        await client.delete('/shopping/', { data: { listId } });
                        fetchLists();
                    } catch (e) { Alert.alert('Error', 'Failed to delete'); }
                }
            }
        ]);
    };

    const renderItem = ({ item }) => (
        <List.Item
            title={item.name}
            description={`Date: ${dayjs(item.date).format('DD/MM/YYYY')}`}
            left={props => <List.Icon {...props} icon="cart-outline" />}
            right={props => <IconButton {...props} icon="delete" onPress={() => handleDeleteList(item._id || item.id)} />}
            onPress={() => Alert.alert('Info', 'Task management details would go here')}
        />
    );

    if (loading) return <View style={styles.centered}><ActivityIndicator /></View>;

    return (
        <View style={styles.container}>
            <FlatList
                data={lists}
                keyExtractor={item => item._id || item.id || Math.random().toString()}
                renderItem={renderItem}
                ListEmptyComponent={<View style={styles.centered}><Text>No shopping lists found.</Text></View>}
            />
            <FAB
                style={styles.fab}
                icon="plus"
                label="New List"
                onPress={() => setVisible(true)}
            />

            <Dialog visible={visible} onDismiss={() => setVisible(false)}>
                <Dialog.Title>New Shopping List</Dialog.Title>
                <Dialog.Content>
                    <TextInput
                        label="List Name"
                        value={newListName}
                        onChangeText={setNewListName}
                        mode="outlined"
                    />
                </Dialog.Content>
                <Dialog.Actions>
                    <Button onPress={() => setVisible(false)}>Cancel</Button>
                    <Button onPress={handleCreateList} loading={createLoading}>Create</Button>
                </Dialog.Actions>
            </Dialog>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f5f5' },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
    fab: { position: 'absolute', margin: 16, right: 0, bottom: 0 },
});

export default ShoppingListScreen;
