import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, ActivityIndicator, Modal, TouchableOpacity, SafeAreaView, Platform, StatusBar } from 'react-native';
import { Text, IconButton, Button, Searchbar } from 'react-native-paper';
import client from '../api/client';
import RecipeItem from './RecipeItem';

const RecipeSelectionModal = ({ visible, onClose, onAdd, mode = null }) => {
    const [recipes, setRecipes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedIds, setSelectedIds] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        if (visible) {
            fetchRecipes();
            setSelectedIds([]); // Reset selection on open
        }
    }, [visible, mode]);

    const fetchRecipes = async () => {
        setLoading(true);
        try {
            const url = mode ? `/recipe/?mode=${mode}` : '/recipe/';
            const response = await client.get(url);
            setRecipes(response.data.data || []);
        } catch (e) {
            console.log(e);
        } finally {
            setLoading(false);
        }
    };

    const handlePress = (item) => {
        if (selectedIds.length > 0) {
            toggleSelection(item._id);
        } else {
            toggleSelection(item._id);
        }
    };

    const handleLongPress = (item) => {
        if (!selectedIds.includes(item._id)) {
            toggleSelection(item._id);
        }
    };

    const toggleSelection = (id) => {
        if (selectedIds.includes(id)) {
            setSelectedIds(selectedIds.filter(i => i !== id));
        } else {
            setSelectedIds([...selectedIds, id]);
        }
    };

    const handleAdd = () => {
        // Find full items
        const selectedItems = recipes.filter(r => selectedIds.includes(r._id));
        onAdd(selectedItems);
    };

    const filteredRecipes = recipes.filter(r =>
        r.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <IconButton icon="close" onPress={onClose} />
                    <Text style={styles.title}>Chọn Món Ăn</Text>
                    {selectedIds.length > 0 && (
                        <Text style={styles.countText}>{selectedIds.length} đã chọn</Text>
                    )}
                </View>

                <View style={styles.searchContainer}>
                    <Searchbar
                        placeholder="Tìm kiếm món ăn..."
                        onChangeText={setSearchQuery}
                        value={searchQuery}
                        style={styles.searchBar}
                        inputStyle={{ minHeight: 0 }} // Fix for some versions
                    />
                </View>

                {loading ? (
                    <View style={styles.centered}><ActivityIndicator /></View>
                ) : (
                    <FlatList
                        data={filteredRecipes}
                        keyExtractor={item => item._id}
                        numColumns={2}
                        columnWrapperStyle={styles.row}
                        contentContainerStyle={styles.list}
                        renderItem={({ item }) => (
                            <View style={styles.itemContainer}>
                                <RecipeItem
                                    item={item}
                                    onPress={handlePress}
                                    onLongPress={handleLongPress}
                                    isSelected={selectedIds.includes(item._id)}
                                />
                            </View>
                        )}
                    />
                )}

                <View style={styles.footer}>
                    <Button
                        mode="contained"
                        onPress={handleAdd}
                        style={styles.addButton}
                        disabled={selectedIds.length === 0}
                        buttonColor="#7C3AED"
                    >
                        Thêm vào kế hoạch ({selectedIds.length})
                    </Button>
                </View>
            </SafeAreaView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f5f5', paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
    header: { flexDirection: 'row', alignItems: 'center', padding: 10, backgroundColor: 'white', elevation: 2 },
    title: { fontSize: 18, fontWeight: 'bold', flex: 1, textAlign: 'center' },
    countText: { fontSize: 14, fontWeight: '600', color: '#7C3AED', marginRight: 10 },
    searchContainer: { padding: 10, backgroundColor: 'white' },
    searchBar: { elevation: 0, backgroundColor: '#F3F4F6', height: 45 },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    list: { padding: 8, paddingBottom: 80 },
    row: { justifyContent: 'space-between' },
    itemContainer: { width: '48%', marginBottom: 8 },
    footer: { padding: 16, backgroundColor: 'white', elevation: 8, borderTopWidth: 1, borderTopColor: '#eee' },
    addButton: { borderRadius: 8, paddingVertical: 6 }
});

export default RecipeSelectionModal;
