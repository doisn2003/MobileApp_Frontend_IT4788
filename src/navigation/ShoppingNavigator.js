import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ShoppingListScreen from '../screens/shopping/ShoppingListScreen';
import ShoppingDetailScreen from '../screens/shopping/ShoppingDetailScreen';

const Stack = createNativeStackNavigator();

const ShoppingNavigator = () => {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="ShoppingListMain" component={ShoppingListScreen} />
            <Stack.Screen name="ShoppingDetail" component={ShoppingDetailScreen} />
        </Stack.Navigator>
    );
};

export default ShoppingNavigator;