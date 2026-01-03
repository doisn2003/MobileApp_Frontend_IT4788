import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, Alert } from 'react-native';
import { Text, List, FAB, Dialog, TextInput, Button, ActivityIndicator, IconButton, SegmentedButtons } from 'react-native-paper';
import client from '../../api/client';
import { useIsFocused } from '@react-navigation/native';
import dayjs from 'dayjs';
import Refresh from '../../components/Refresh';

const MealPlanScreen = () => {
    const [meals, setMeals] = useState([]);
    const [loading, setLoading] = useState(false);
    const [date, setDate] = useState(dayjs());
    const isFocused = useIsFocused();

    // Dialog state
    const [visible, setVisible] = useState(false);
    const [foodName, setFoodName] = useState('');
    const [mealType, setMealType] = useState('Breakfast');
    const [addLoading, setAddLoading] = useState(false);

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

    useEffect(() => {
        if (isFocused) {
            fetchMeals();
        }
    }, [isFocused, date]);

    const handleAddMeal = async () => {
        if (!foodName) return;
        setAddLoading(true);
        try {
            await client.post('/meal/', {
                date: date.format('YYYY-MM-DD'),
                mealType,
                foodName
            });
            setFoodName('');
            setVisible(false);
            fetchMeals();
        } catch (e) {
            Alert.alert('Error', 'Failed to add meal');
        } finally {
            setAddLoading(false);
        }
    };

    const handleDeleteMeal = async (planId) => {
        try {
            await client.delete('/meal/', { data: { planId } });
            fetchMeals();
        } catch (e) { Alert.alert('Error', 'Failed to delete'); }
    };

    const renderItem = ({ item }) => (
        <List.Item
            title={item.foodName}
            description={item.mealType}
            left={props => <List.Icon {...props} icon="food-fork-drink" />}
            right={props => <IconButton {...props} icon="delete" onPress={() => handleDeleteMeal(item._id || item.id)} />}
        />
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <IconButton icon="chevron-left" onPress={() => setDate(date.subtract(1, 'day'))} />
                <Text style={styles.dateText}>{date.format('DD/MM/YYYY')}</Text>
                <IconButton icon="chevron-right" onPress={() => setDate(date.add(1, 'day'))} />
            </View>

            {loading ? (
                <View style={styles.centered}><ActivityIndicator /></View>
            ) : (
                <Refresh style={{ flex: 1 }} onRefresh={fetchMeals}>
                    {meals.length === 0 ? (
                        <View style={styles.centered}><Text style={{ marginTop: 20 }}>No meals planned for this day.</Text></View>
                    ) : (
                        meals.map(item => (
                            <List.Item
                                key={item._id || item.id || Math.random().toString()}
                                title={item.foodName}
                                description={item.mealType}
                                left={props => <List.Icon {...props} icon="food-fork-drink" />}
                                right={props => <IconButton {...props} icon="delete" onPress={() => handleDeleteMeal(item._id || item.id)} />}
                            />
                        ))
                    )}
                </Refresh>
            )}

            <FAB
                style={styles.fab}
                icon="plus"
                label="Add Meal"
                onPress={() => setVisible(true)}
            />

            <Dialog visible={visible} onDismiss={() => setVisible(false)}>
                <Dialog.Title>Add Meal</Dialog.Title>
                <Dialog.Content>
                    <TextInput
                        label="Food Name"
                        value={foodName}
                        onChangeText={setFoodName}
                        mode="outlined"
                        style={{ marginBottom: 10 }}
                    />
                    <Text style={{ marginBottom: 5 }}>Meal Type:</Text>
                    <SegmentedButtons
                        value={mealType}
                        onValueChange={setMealType}
                        buttons={[
                            { value: 'Breakfast', label: 'Brek' },
                            { value: 'Lunch', label: 'Lunch' },
                            { value: 'Dinner', label: 'Din' },
                        ]}
                    />
                </Dialog.Content>
                <Dialog.Actions>
                    <Button onPress={() => setVisible(false)}>Cancel</Button>
                    <Button onPress={handleAddMeal} loading={addLoading}>Add</Button>
                </Dialog.Actions>
            </Dialog>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f5f5' },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 10, backgroundColor: '#fff', elevation: 2 },
    dateText: { fontSize: 18, fontWeight: 'bold' },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
    fab: { position: 'absolute', margin: 16, right: 0, bottom: 0 },
});

export default MealPlanScreen;
