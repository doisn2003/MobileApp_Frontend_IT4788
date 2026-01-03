import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Text, List, FAB, Dialog, TextInput, Button, ActivityIndicator, IconButton, SegmentedButtons } from 'react-native-paper';
import client from '../../../api/client';
import { useIsFocused } from '@react-navigation/native';
import dayjs from 'dayjs';
import Refresh from '../../../components/Refresh';
import DatePicker from '../../../components/DatePicker';

const FamilyMealTab = () => {
    const [meals, setMeals] = useState([]);
    const [mealDates, setMealDates] = useState([]);
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

    const handleAddMeal = async () => {
        if (!foodName) return;
        setAddLoading(true);
        try {
            await client.post('/meal/', {
                date: date.format('YYYY-MM-DD'),
                name: mealType, // Fixed incorrect key from 'mealType' to 'name' as per backend logic in Controller (req.body.name is session)
                foodName
            });
            setFoodName('');
            setVisible(false);
            fetchMeals();
            fetchMealDates();
        } catch (e) {
            console.log(e.response?.data);
            Alert.alert('Error', 'Failed to add meal');
        } finally {
            setAddLoading(false);
        }
    };

    const handleDeleteMeal = async (planId) => {
        try {
            await client.delete('/meal/', { data: { planId } });
            fetchMeals();
            fetchMealDates();
        } catch (e) { Alert.alert('Error', 'Failed to delete'); }
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
                <Refresh style={{ flex: 1 }} onRefresh={fetchMeals}>
                    {meals.length === 0 ? (
                        <View style={styles.centered}><Text style={{ marginTop: 20 }}>Không có bữa ăn nào.</Text></View>
                    ) : (
                        meals.map(item => (
                            <List.Item
                                key={item._id || item.id || Math.random().toString()}
                                title={item.foodName || item.foodId?.name}
                                description={item.session || item.mealType}
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
                label="Thêm Bữa Ăn"
                onPress={() => setVisible(true)}
            />

            <Dialog visible={visible} onDismiss={() => setVisible(false)}>
                <Dialog.Title>Thêm bữa ăn chung</Dialog.Title>
                <Dialog.Content>
                    <TextInput
                        label="Tên món ăn (trong tủ lạnh)"
                        value={foodName}
                        onChangeText={setFoodName}
                        mode="outlined"
                        style={{ marginBottom: 10 }}
                    />
                    <Text style={{ marginBottom: 5 }}>Bữa:</Text>
                    <SegmentedButtons
                        value={mealType}
                        onValueChange={setMealType}
                        buttons={[
                            { value: 'Sáng', label: 'Sáng' },
                            { value: 'Trưa', label: 'Trưa' },
                            { value: 'Tối', label: 'Tối' },
                        ]}
                    />
                </Dialog.Content>
                <Dialog.Actions>
                    <Button onPress={() => setVisible(false)}>Hủy</Button>
                    <Button onPress={handleAddMeal} loading={addLoading}>Thêm</Button>
                </Dialog.Actions>
            </Dialog>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f5f5' },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 10, backgroundColor: '#fff', elevation: 2 },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
    fab: { position: 'absolute', margin: 16, right: 0, bottom: 0 },
});

export default FamilyMealTab;
