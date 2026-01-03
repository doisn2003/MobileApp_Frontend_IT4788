import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, IconButton, Button, Modal, TextInput, RadioButton } from 'react-native-paper';
import { useIsFocused } from '@react-navigation/native';
import dayjs from 'dayjs';

import client from '../../api/client';


const MealPlanScreen = () => {
    const [currentDate, setCurrentDate] = useState(dayjs());
    const [meals, setMeals] = useState([]);

    const [modalVisible, setModalVisible] = useState(false);
    
    // Add Meal State
    const [foodName, setFoodName] = useState('');
    const [mealType, setMealType] = useState('sáng'); 

    const isFocused = useIsFocused();

    const fetchMeals = useCallback(async () => {
        try {
            const dateStr = currentDate.format('YYYY-MM-DD');
            const response = await client.get(`/meal/?date=${dateStr}`);
            if (response.data && response.data.data) {
                setMeals(response.data.data);
            } else {
                setMeals([]);
            }
        } catch (e) {
            console.log('Fetch Meal Error:', e);
            setMeals([]);
        }
    }, [currentDate]);

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
    }, [isFocused, fetchMeals]);

    const handleAddMeal = async () => {
        if (!foodName) return;
        try {
            const payload = {
                foodName,
                timestamp: currentDate.format('YYYY-MM-DD HH:mm:ss'),
                name: mealType
            };

            await client.post('/meal/', payload, {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            });

            setModalVisible(false);
            setFoodName('');
            fetchMeals();

            Alert.alert('Thành công', 'Đã lên lịch món ăn!');

        } catch (e) {
            Alert.alert('Thất bại', e.response?.data?.message || 'Lỗi thêm bữa ăn');
        }
    };

    const handleDeleteMeal = async (planId) => {

        Alert.alert('Xóa', 'Bạn muốn xóa món này?', [
            { text: 'Hủy', style: 'cancel' },
            {
                text: 'Xóa', style: 'destructive',
                onPress: async () => {
                    try {
                        await client.delete('/meal/', { data: { planId } });
                        fetchMeals();
                    } catch (e) {
                        Alert.alert('Lỗi', 'Không thể xóa');
                    }
                }
            }
        ]);

    };

    const breakfast = meals.filter(m => m.name && m.name.toLowerCase() === 'sáng');
    const lunch = meals.filter(m => m.name && m.name.toLowerCase() === 'trưa');
    const dinner = meals.filter(m => m.name && m.name.toLowerCase() === 'tối');

    const MealSection = ({ title, data, color }) => (
        <View style={styles.section}>
            <View style={[styles.sectionHeader, { backgroundColor: color }]}>
                <Text style={styles.sectionTitle}>{title}</Text>
            </View>
            {data.length === 0 ? (
                <Text style={styles.emptyText}>Chưa có món nào</Text>
            ) : (
                data.map(item => (
                    <View key={item._id || item.planId} style={styles.mealItem}>
                        <Text style={styles.mealName}>{item.foodName}</Text>
                        <IconButton icon="close-circle-outline" size={20} iconColor="#EF4444" onPress={() => handleDeleteMeal(item._id || item.planId)} />
                    </View>
                ))
            )}
        </View>
    );

    return (
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
            <View style={styles.header}>

                <Text style={styles.headerTitle}>Kế Hoạch Ăn Uống</Text>
                <View style={styles.dateControl}>
                    <IconButton icon="chevron-left" onPress={() => setCurrentDate(currentDate.subtract(1, 'day'))} />
                    <View style={{ alignItems: 'center' }}>
                        <Text style={styles.dateText}>{currentDate.format('DD/MM/YYYY')}</Text>
                        <Text style={styles.dayText}>{currentDate.format('dddd')}</Text>
                    </View>
                    <IconButton icon="chevron-right" onPress={() => setCurrentDate(currentDate.add(1, 'day'))} />
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <MealSection title="Bữa Sáng" data={breakfast} color="#FEF3C7" />
                <MealSection title="Bữa Trưa" data={lunch} color="#DBEAFE" />
                <MealSection title="Bữa Tối" data={dinner} color="#D1FAE5" />
                
                <Button mode="contained" icon="plus" onPress={() => setModalVisible(true)} style={styles.addBtn}>
                    Thêm Món Ăn
                </Button>
            </ScrollView>

            <Modal visible={modalVisible} onDismiss={() => setModalVisible(false)} contentContainerStyle={styles.modal}>
                <Text style={styles.modalTitle}>Thêm Món Ăn</Text>
                <TextInput label="Tên món (vd: Phở bò)" value={foodName} onChangeText={setFoodName} style={styles.input} mode="outlined"/>
                
                <Text style={{ marginTop: 10, fontWeight: 'bold' }}>Chọn bữa:</Text>
                <RadioButton.Group onValueChange={setMealType} value={mealType}>
                    <View style={styles.radioRow}>
                        <RadioButton.Item label="Sáng" value="sáng" />
                        <RadioButton.Item label="Trưa" value="trưa" />
                        <RadioButton.Item label="Tối" value="tối" />
                    </View>
                </RadioButton.Group>

                <View style={styles.modalActions}>
                    <Button onPress={() => setModalVisible(false)} style={{ flex: 1 }}>Hủy</Button>
                    <Button mode="contained" onPress={handleAddMeal} style={{ flex: 1 }}>Lưu</Button>
                </View>
            </Modal>
        </SafeAreaView>

    );
};

const styles = StyleSheet.create({

    container: { flex: 1, backgroundColor: '#FFFFFF' },
    header: { padding: 20, backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
    headerTitle: { fontSize: 24, fontWeight: '800', color: '#111827', marginBottom: 10 },
    dateControl: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#F9FAFB', borderRadius: 12 },
    dateText: { fontSize: 16, fontWeight: 'bold', color: '#374151' },
    dayText: { fontSize: 12, color: '#6B7280', textTransform: 'capitalize' },
    content: { padding: 16 },
    section: { marginBottom: 20 },
    sectionHeader: { padding: 10, borderRadius: 8, marginBottom: 8 },
    sectionTitle: { fontWeight: 'bold', color: '#374151', fontSize: 16 },
    emptyText: { fontStyle: 'italic', color: '#9CA3AF', marginLeft: 10 },
    mealItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#F3F4F6', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 8, marginBottom: 6 },
    mealName: { fontSize: 14, fontWeight: '500' },
    addBtn: { marginTop: 10, backgroundColor: '#7C3AED' },
    modal: { backgroundColor: 'white', padding: 20, margin: 20, borderRadius: 16 },
    modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 16, textAlign: 'center' },
    input: { backgroundColor: 'white', marginBottom: 10 },
    radioRow: { flexDirection: 'row', justifyContent: 'space-around' },
    modalActions: { flexDirection: 'row', marginTop: 20, gap: 10 }
});

export default MealPlanScreen;