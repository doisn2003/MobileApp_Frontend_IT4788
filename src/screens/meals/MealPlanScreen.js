import React, { useState } from 'react';
import { View, StyleSheet, SafeAreaView, StatusBar, Platform } from 'react-native';
import { SegmentedButtons, Text } from 'react-native-paper';
import FamilyMealTab from './tabs/FamilyMealTab';
import RecipeTab from './tabs/RecipeTab';
import PrivateMealTab from './tabs/PrivateMealTab';

const MealPlanScreen = () => {
    const [tab, setTab] = useState('recipe'); // Default to Recipe as requested

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Lên Kế Hoạch Bữa Ăn</Text>
            </View>

            <View style={styles.tabContainer}>
                <SegmentedButtons
                    value={tab}
                    onValueChange={setTab}
                    buttons={[
                        { value: 'recipe', label: 'Công thức' },
                        { value: 'family', label: 'Chung' },
                        { value: 'private', label: 'Riêng' },
                    ]}
                    style={styles.segmentedBtn}
                />
            </View>

            <View style={styles.content}>
                {tab === 'recipe' && <RecipeTab />}
                {tab === 'family' && <FamilyMealTab />}
                {tab === 'private' && <PrivateMealTab />}
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: 'white' },
    header: { padding: 14, backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
    title: { fontSize: 24, fontWeight: '800', color: '#111827' },
    tabContainer: { padding: 6, backgroundColor: 'white' },
    segmentedBtn: {},
    content: { flex: 1 }
});

export default MealPlanScreen;
