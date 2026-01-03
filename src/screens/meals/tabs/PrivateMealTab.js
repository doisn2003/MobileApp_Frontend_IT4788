import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { Text, Chip, SegmentedButtons } from 'react-native-paper';
import client from '../../../api/client';
import { useIsFocused } from '@react-navigation/native';
import Refresh from '../../../components/Refresh';
import RecipeItem from '../../../components/RecipeItem';
import RecipeModal from '../../../components/RecipeModal';

const PrivateMealTab = () => {
    const [recipes, setRecipes] = useState([]);
    const [fridgeItems, setFridgeItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [mode, setMode] = useState('Gymer'); // Default mode

    // Modal State
    const [selectedRecipe, setSelectedRecipe] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);

    const isFocused = useIsFocused();

    const fetchData = async () => {
        setLoading(true);
        try {
            // Fetch Recipes with Mode
            const resRecipes = await client.get(`/recipe/?mode=${mode}`);
            setRecipes(resRecipes.data.data || []);

            // Fetch Fridge Items (If needed for checking, usually shared context is better but fetching works)
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
    }, [isFocused, mode]);

    const handlePressItem = (item) => {
        setSelectedRecipe(item);
        setModalVisible(true);
    };

    return (
        <View style={styles.container}>
            {/* Mode Filter */}
            <View style={styles.filterContainer}>
                <Chip
                    selected={mode === 'Gymer'}
                    onPress={() => setMode('Gymer')}
                    style={styles.chip}
                    showSelectedOverlay
                >Gymer</Chip>
                <Chip
                    selected={mode === 'Gain Weight'}
                    onPress={() => setMode('Gain Weight')}
                    style={styles.chip}
                    showSelectedOverlay
                >Tăng cân</Chip>
                <Chip
                    selected={mode === 'Lose Weight'}
                    onPress={() => setMode('Lose Weight')}
                    style={styles.chip}
                    showSelectedOverlay
                >Giảm cân</Chip>
                <Chip
                    selected={mode === 'Vegan'}
                    onPress={() => setMode('Vegan')}
                    style={styles.chip}
                    showSelectedOverlay
                >Thuần chay</Chip>
            </View>

            {loading ? (
                <View style={styles.centered}><ActivityIndicator /></View>
            ) : (
                <Refresh style={{ flex: 1 }} onRefresh={fetchData}>
                    <View style={styles.grid}>
                        {recipes.length === 0 ? (
                            <Text style={{ textAlign: 'center', marginTop: 30, color: '#6B7280' }}>
                                Không tìm thấy món ăn phù hợp với chế độ {mode}.
                            </Text>
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
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f5f5' },
    filterContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        padding: 10,
        backgroundColor: 'white',
        gap: 8,
        justifyContent: 'center',
        elevation: 1
    },
    chip: { flexGrow: 1, justifyContent: 'center' },
    grid: { flexDirection: 'row', flexWrap: 'wrap', padding: 5, marginTop: 5 },
    gridItem: { width: '50%', padding: 5 },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});

export default PrivateMealTab;
