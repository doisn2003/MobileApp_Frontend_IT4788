import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { FAB, Text } from 'react-native-paper';
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

    // Modal State
    const [selectedRecipe, setSelectedRecipe] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [addVisible, setAddVisible] = useState(false);

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

    const handleCreate = async (data) => {
        try {
            const formData = new FormData();
            formData.append('name', data.name);
            formData.append('description', data.description || '');
            formData.append('htmlContent', data.htmlContent || '');

            // Append JSON strings for arrays/objects
            formData.append('ingredients', JSON.stringify(data.ingredients));
            formData.append('nutrition', JSON.stringify(data.nutrition));
            formData.append('tags', JSON.stringify(data.tags || [])); // Tags might be empty now but backend expects it or we don't send it

            // Append Image
            if (data.imageUri) {
                const uri = data.imageUri;
                const fileType = uri.substring(uri.lastIndexOf('.') + 1);
                formData.append('image', {
                    uri: uri,
                    name: `recipe.${fileType}`,
                    type: `image/${fileType}`
                });
            }

            await client.post('/recipe/', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            setAddVisible(false);
            fetchData();
        } catch (e) {
            console.log(e);
            alert('Lỗi khi thêm công thức');
        }
    };

    const handleDelete = async (id) => {
        // Implement delete logic if user is owner
        // For now just close modal
        setModalVisible(false);
    };

    return (
        <View style={styles.container}>
            {loading ? (
                <View style={styles.centered}><ActivityIndicator /></View>
            ) : (
                <Refresh style={{ flex: 1 }} onRefresh={fetchData}>
                    <View style={styles.grid}>
                        {recipes.length === 0 ? (
                            <Text style={{ textAlign: 'center', marginTop: 20 }}>Chưa có công thức nào.</Text>
                        ) : (
                            recipes.map(item => (
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
            />

            <AddRecipeModal
                visible={addVisible}
                onClose={() => setAddVisible(false)}
                onAdd={handleCreate}
            />

            <FAB
                style={styles.fab}
                icon="plus"
                label="Thêm Món"
                onPress={() => setAddVisible(true)}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f5f5', padding: 10 },
    grid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -5 },
    gridItem: { width: '50%', padding: 5 },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    fab: { position: 'absolute', margin: 16, right: 0, bottom: 0 },
});

export default RecipeTab;
