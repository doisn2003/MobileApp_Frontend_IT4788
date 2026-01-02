import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { AuthContext } from '../contexts/AuthContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ActivityIndicator, View } from 'react-native';

// Auth Screens
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';

// Main Screens
import FridgeScreen from '../screens/fridge/FridgeScreen';
import ShoppingListScreen from '../screens/shopping/ShoppingListScreen';
import MealPlanScreen from '../screens/meals/MealPlanScreen';
import GroupScreen from '../screens/group/GroupScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const AuthStack = () => (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
);

const MainTabs = () => (
    <Tab.Navigator
        screenOptions={({ route }) => ({
            tabBarIcon: ({ color, size }) => {
                let iconName;

                if (route.name === 'Fridge') {
                    iconName = 'fridge';
                } else if (route.name === 'Shopping') {
                    iconName = 'cart';
                } else if (route.name === 'Meals') {
                    iconName = 'calendar-clock';
                } else if (route.name === 'Group') {
                    iconName = 'account-group';
                } else if (route.name === 'Profile') {
                    iconName = 'account';
                }

                return <MaterialCommunityIcons name={iconName} size={size} color={color} />;
            },
            tabBarActiveTintColor: '#6200ee',
            tabBarInactiveTintColor: 'gray',
        })}
    >
        <Tab.Screen name="Fridge" component={FridgeScreen} />
        <Tab.Screen name="Shopping" component={ShoppingListScreen} options={{ title: 'Shopping List' }} />
        <Tab.Screen name="Meals" component={MealPlanScreen} options={{ title: 'Meal Plan' }} />
        <Tab.Screen name="Group" component={GroupScreen} />
        <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
);

const AppNavigator = () => {
    const { userToken, isLoading } = useContext(AuthContext);

    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#6200ee" />
            </View>
        );
    }

    return (
        <NavigationContainer>
            {userToken ? <MainTabs /> : <AuthStack />}
        </NavigationContainer>
    );
};

export default AppNavigator;
