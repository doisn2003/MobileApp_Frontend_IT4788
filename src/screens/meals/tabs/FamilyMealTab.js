import React, { useState, useEffect, useMemo } from 'react';
import { View, StyleSheet, Alert, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Text, IconButton, ActivityIndicator } from 'react-native-paper';
import client from '../../../api/client';
import { useIsFocused } from '@react-navigation/native';
import dayjs from 'dayjs';
import Refresh from '../../../components/Refresh';
import DatePicker from '../../../components/DatePicker';
import RecipeItem from '../../../components/RecipeItem'; // Reusing
import RecipeSelectionModal from '../../../components/RecipeSelectionModal';
import RecipeModal from '../../../components/RecipeModal';

const FamilyMealTab = () => {
    const [meals, setMeals] = useState([]);
    const [mealDates, setMealDates] = useState([]);
    const [loading, setLoading] = useState(false);
    const [date, setDate] = useState(dayjs());
    const isFocused = useIsFocused();

    // Add Modal State
    const [selectionVisible, setSelectionVisible] = useState(false);
    const [targetSession, setTargetSession] = useState(null); // 'Sáng', 'Trưa', 'Tối'

    // Detail Modal State
    const [detailVisible, setDetailVisible] = useState(false);
    const [selectedDetail, setSelectedDetail] = useState(null);

    const fetchMeals = async () => {
        setLoading(true);
        try {
            const dateStr = date.format('YYYY-MM-DD');
            const response = await client.get(`/meal?date=${dateStr}`);
            setMeals(response.data.data || []);
        } catch (e) {
            console.log(e);
        } finally {
            setLoading(false);
        }
    };

    const fetchMealDates = async () => {
        try {
            const response = await client.get('/meal/dates');
            if (response.data && response.data.data) {
                setMealDates(response.data.data);
            }
        } catch (e) {
            console.log('Error fetching dates', e);
        }
    };

    useEffect(() => {
        if (isFocused) {
            fetchMeals();
            fetchMealDates();
        }
    }, [isFocused, date]);

    const handleOpenAdd = (session) => {
        setTargetSession(session);
        setSelectionVisible(true);
    };

    const handleAddMeals = async (selectedRecipes) => {
        setSelectionVisible(false);
        if (!selectedRecipes || selectedRecipes.length === 0) return;

        try {
            // Loop add
            for (const recipe of selectedRecipes) {
                await client.post('/meal/', {
                    timestamp: date.format('YYYY-MM-DD'), // Changed from date to timestamp
                    name: targetSession,
                    recipeId: recipe._id
                });
            }
            fetchMeals();
            fetchMealDates();
        } catch (e) {
            console.log(e);
            Alert.alert('Error', 'Failed to add meals');
        }
    };

    const handleDeleteMeal = async (planId) => {
        // Confirmation before delete
        Alert.alert('Xác nhận', 'Bạn có chắc muốn xóa món này?', [
            { text: 'Hủy', style: 'cancel' },
            {
                text: 'Xóa', style: 'destructive', onPress: async () => {
                    try {
                        await client.delete('/meal/', { data: { planId } });
                        // No need to close detailVisible here since we might delete from list directly
                        if (detailVisible) setDetailVisible(false);
                        fetchMeals();
                        fetchMealDates();
                    } catch (e) { Alert.alert('Error', 'Failed to delete'); }
                }
            }
        ]);
    };

    const handleItemPress = (mealPlanItem) => {
        const detail = mealPlanItem.recipeId || mealPlanItem.foodId;
        setSelectedDetail({ ...detail, planId: mealPlanItem._id });
        setDetailVisible(true);
    };

    // Rendering Sections
    const renderSection = (title, sessionKey) => {
        const sessionMeals = meals.filter(m => m.session && m.session.toLowerCase() === sessionKey.toLowerCase());

        return (
            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>{title}</Text>
                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>{sessionMeals.length}</Text>
                    </View>
                </View>

                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.listContent}>
                    {sessionMeals.map((planItem) => {
                        const displayItem = planItem.recipeId || planItem.foodId || { name: 'Unknown', image: null };
                        return (
                            <View key={planItem._id} style={styles.cardWrapper}>
                                <RecipeItem
                                    item={displayItem}
                                    onPress={() => handleItemPress(planItem)}
                                    compact={true} // 70% size
                                    onDelete={() => handleDeleteMeal(planItem._id)} // Delete button
                                />
                            </View>
                        );
                    })}

                    {/* Add Placeholder - also reduced size */}
                    <TouchableOpacity style={styles.addPlaceholder} onPress={() => handleOpenAdd(sessionKey)}>
                        <IconButton icon="plus" size={24} iconColor="#D1D5DB" />
                        <Text style={styles.addText}>Thêm</Text>
                    </TouchableOpacity>
                </ScrollView>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <IconButton icon="chevron-left" onPress={() => setDate(date.subtract(1, 'day'))} />
                <DatePicker
                    date={date}
                    onDateChange={setDate}
                    markedDates={mealDates}
                />
                <IconButton icon="chevron-right" onPress={() => setDate(date.add(1, 'day'))} />
            </View>

            {loading ? (
                <View style={styles.centered}><ActivityIndicator /></View>
            ) : (
                <Refresh style={styles.scroll} contentContainerStyle={{ paddingBottom: 100, paddingLeft: 16 }} onRefresh={fetchMeals}>
                    {renderSection('Bữa Sáng', 'Sáng')}
                    {renderSection('Bữa Trưa', 'Trưa')}
                    {renderSection('Bữa Tối', 'Tối')}
                </Refresh>
            )}

            <RecipeSelectionModal
                visible={selectionVisible}
                onClose={() => setSelectionVisible(false)}
                onAdd={handleAddMeals}
            />

            {/* Reuse RecipeModal or create a specific MealDetailModal? 
                RecipeModal has delete logic for Recipe. 
                We want to delete MealPlan. 
                Let's hijack onDelete. 
            */}
            {selectedDetail && (
                <RecipeModal
                    visible={detailVisible}
                    item={selectedDetail}
                    onClose={() => setDetailVisible(false)}
                    onDelete={() => handleDeleteMeal(selectedDetail.planId)}
                // Pass a prop to indicate this is a MealPlan view if RecipeModal needs different buttons? 
                // Current RecipeModal likely shows "Delete" which calls onDelete. Perfect.
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f5f5'},
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 5, backgroundColor: '#fff', elevation: 2 },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 2},
    scroll: { flex: 1, padding: 16 },

    section: {
        marginBottom: 16, // Reduced margin
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    sectionTitle: {
        fontSize: 18, // Reduced font size
        fontWeight: 'bold',
        color: '#1F2937'
    },
    badge: {
        backgroundColor: '#E5E7EB',
        borderRadius: 12,
        paddingHorizontal: 8,
        paddingVertical: 2,
        marginLeft: 8
    },
    badgeText: {
        fontSize: 11,
        fontWeight: 'bold',
        color: '#4B5563'
    },
    listContent: {
        alignItems: 'center',
        paddingRight: 20
    },
    cardWrapper: {
        width: 140, // Reduced from 200
        marginRight: 10,
    },
    addPlaceholder: {
        width: 90, // Reduced for compact look
        height: 90,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#E5E7EB',
        borderStyle: 'dashed',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.5)',
        marginRight: 12
    },
    addText: {
        fontSize: 12,
        color: '#9CA3AF',
        fontWeight: '600',
        marginTop: 4
    }
});

export default FamilyMealTab;
