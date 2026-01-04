import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { FAB, Text, Searchbar } from 'react-native-paper';
import client from '../../../api/client';
import { useIsFocused } from '@react-navigation/native';
import Refresh from '../../../components/Refresh';
import RecipeItem from '../../../components/RecipeItem';
import RecipeModal from '../../../components/RecipeModal';
import AddRecipeModal from '../../../components/AddRecipeModal';

const RecipeTab = () => {
    const [recipes, setRecipes] = useState([]);
    const [fridgeItems, setFridgeItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // Modal State
    const [selectedRecipe, setSelectedRecipe] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [addVisible, setAddVisible] = useState(false);

    // Edit State
    const [editingRecipe, setEditingRecipe] = useState(null);

    const isFocused = useIsFocused();

    const fetchData = async () => {
        setLoading(true);
        try {
            // Fetch Recipes
            const resRecipes = await client.get('/recipe/');
            setRecipes(resRecipes.data.data || []);

            // Fetch Fridge Items for Checking
            const resFridge = await client.get('/fridge/');
            setFridgeItems(resFridge.data.data || []);
        } catch (e) {
            console.log(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isFocused) fetchData();
    }, [isFocused]);

    const handlePressItem = (item) => {
        setSelectedRecipe(item);
        setModalVisible(true);
    };

    const handleSave = async (data) => {
        try {
            const formData = new FormData();
            formData.append('name', data.name);
            formData.append('description', data.description || '');
            formData.append('htmlContent', data.htmlContent || '');

            // Append JSON strings for arrays/objects
            formData.append('ingredients', JSON.stringify(data.ingredients));
            formData.append('nutrition', JSON.stringify(data.nutrition));
            formData.append('tags', JSON.stringify(data.tags || []));

            // Append Image if new one selected (uri starts with file or content usually, if http it's old)
            if (data.imageUri && !data.imageUri.startsWith('http')) {
                const uri = data.imageUri;
                const fileType = uri.substring(uri.lastIndexOf('.') + 1);
                formData.append('image', {
                    uri: uri,
                    name: `recipe.${fileType}`,
                    type: `image/${fileType}`
                });
            }

            if (editingRecipe) {
                // Update
                formData.append('recipeId', editingRecipe._id);
                await client.put('/recipe/', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
                alert('Cập nhật thành công');
            } else {
                // Create
                await client.post('/recipe/', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
                alert('Thêm mới thành công');
            }

            setAddVisible(false);
            setEditingRecipe(null); // Reset
            fetchData();
        } catch (e) {
            console.log(e);
            alert('Lỗi khi lưu công thức');
        }
    };

    const handleDelete = async (id) => {
        // Should add confirmation Alert
        try {
            await client.delete('/recipe/', { data: { recipeId: id } });
            setModalVisible(false);
            fetchData();
        } catch (e) {
            console.log(e);
            alert('Không thể xóa công thức này');
        }
    };

    const handleEdit = (item) => {
        setEditingRecipe(item);
        setModalVisible(false);
        setAddVisible(true);
    };

    const openAddModal = () => {
        setEditingRecipe(null);
        setAddVisible(true);
    };

    const filteredRecipes = recipes.filter(r =>
        r.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <View style={styles.container}>
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
                <Refresh style={{ flex: 1 }} onRefresh={fetchData}>
                    <View style={styles.grid}>
                        {filteredRecipes.length === 0 ? (
                            <Text style={{ textAlign: 'center', marginTop: 20 }}>Chưa có công thức nào.</Text>
                        ) : (
                            filteredRecipes.map(item => (
                                <View key={item._id} style={styles.gridItem}>
                                    <RecipeItem item={item} onPress={handlePressItem} />
                                </View>
                            ))
                        )}
                    </View>
                </Refresh>
            )}

            <RecipeModal
                visible={modalVisible}
                item={selectedRecipe}
                fridgeItems={fridgeItems}
                onClose={() => setModalVisible(false)}
                onDelete={handleDelete}
                onEdit={handleEdit}
            />

            <AddRecipeModal
                visible={addVisible}
                onClose={() => setAddVisible(false)}
                onAdd={handleSave}
                initialData={editingRecipe}
            />

            <FAB
                style={styles.fab}
                icon="plus"
                label="Thêm Món"
                onPress={openAddModal}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f5f5' },
    searchContainer: { padding: 10, backgroundColor: 'white' }, // Matches RecipeSelectionModal
    searchBar: { elevation: 0, backgroundColor: '#F3F4F6', height: 45 },
    grid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -5, padding: 10 },
    gridItem: { width: '50%', padding: 5 },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    fab: { position: 'absolute', margin: 16, right: 0, bottom: 0 },
});

export default RecipeTab;
