// import React, { useContext } from 'react';
// import { NavigationContainer } from '@react-navigation/native';
// import { createNativeStackNavigator } from '@react-navigation/native-stack';
// import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
// import { AuthContext } from '../contexts/AuthContext';
// import { MaterialCommunityIcons } from '@expo/vector-icons';
// import { ActivityIndicator, View } from 'react-native';

// // Auth Screens
// import LoginScreen from '../screens/auth/LoginScreen';
// import RegisterScreen from '../screens/auth/RegisterScreen';

// // Main Screens
// import FridgeScreen from '../screens/fridge/FridgeScreen';
// import ShoppingListScreen from '../screens/shopping/ShoppingListScreen';
// import MealPlanScreen from '../screens/meals/MealPlanScreen';
// import GroupScreen from '../screens/group/GroupScreen';
// import ProfileScreen from '../screens/profile/ProfileScreen';

// const Stack = createNativeStackNavigator();
// const Tab = createBottomTabNavigator();

// const AuthStack = () => (
//     <Stack.Navigator screenOptions={{ headerShown: false }}>
//         <Stack.Screen name="Login" component={LoginScreen} />
//         <Stack.Screen name="Register" component={RegisterScreen} />
//     </Stack.Navigator>
// );

// const MainTabs = () => (
//     <Tab.Navigator
//         screenOptions={({ route }) => ({
//             tabBarIcon: ({ color, size }) => {
//                 let iconName;

//                 if (route.name === 'Tủ Lạnh') {
//                     iconName = 'fridge';
//                 } else if (route.name === 'Mua Sắm') {
//                     iconName = 'cart';
//                 } else if (route.name === 'Bữa Ăn') {
//                     iconName = 'calendar-clock';
//                 } else if (route.name === 'Nhóm') {
//                     iconName = 'account-group';
//                 } else if (route.name === 'Profile') {
//                     iconName = 'account';
//                 }

//                 return <MaterialCommunityIcons name={iconName} size={size} color={color} />;
//             },
//             tabBarActiveTintColor: '#6200ee',
//             tabBarInactiveTintColor: 'gray',
//         })}
//     >
//         <Tab.Screen name="Tủ Lạnh" component={FridgeScreen} />
//         <Tab.Screen name="Mua Sắm" component={ShoppingListScreen} options={{ title: 'Mua Sắm' }} />
//         <Tab.Screen name="Bữa Ăn" component={MealPlanScreen} options={{ title: 'Bữa Ăn' }} />
//         <Tab.Screen name="Nhóm" component={GroupScreen} />
//         <Tab.Screen name="Profile" component={ProfileScreen} />
//     </Tab.Navigator>
// ); 

// const AppNavigator = () => {
//     const { userToken, isLoading } = useContext(AuthContext);

//     if (isLoading) {
//         return (
//             <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
//                 <ActivityIndicator size="large" color="#6200ee" />
//             </View>
//         );
//     }

//     return (
//         <NavigationContainer>
//             {userToken ? <MainTabs /> : <AuthStack />}
//         </NavigationContainer>
//     );
// };

// export default AppNavigator;
import React, { useContext } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AuthContext } from '../contexts/AuthContext';

// Auth Screens
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';

// Main Screens
import FridgeScreen from '../screens/fridge/FridgeScreen';
import MealPlanScreen from '../screens/meals/MealPlanScreen';
import GroupScreen from '../screens/group/GroupScreen'; // File này sẽ tạo ở dưới
import ProfileScreen from '../screens/profile/ProfileScreen';

// Navigators
import ShoppingNavigator from './ShoppingNavigator'; // Import Stack Navigator cho Mua sắm

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
            headerShown: false, // Ẩn header mặc định của Tab để dùng Header riêng của từng màn hình
            tabBarIcon: ({ color, size }) => {
                let iconName;
                if (route.name === 'Tủ Lạnh') iconName = 'fridge';
                else if (route.name === 'Mua Sắm') iconName = 'cart';
                else if (route.name === 'Bữa Ăn') iconName = 'calendar-clock';
                else if (route.name === 'Nhóm') iconName = 'account-group';
                else if (route.name === 'Profile') iconName = 'account';
                return <MaterialCommunityIcons name={iconName} size={size} color={color} />;
            },
            tabBarActiveTintColor: '#7C3AED',
            tabBarInactiveTintColor: 'gray',
        })}
    >
        <Tab.Screen name="Tủ Lạnh" component={FridgeScreen} />
        {/* QUAN TRỌNG: Sử dụng ShoppingNavigator thay vì màn hình đơn lẻ */}
        <Tab.Screen name="Mua Sắm" component={ShoppingNavigator} />
        <Tab.Screen name="Bữa Ăn" component={MealPlanScreen} />
        <Tab.Screen name="Nhóm" component={GroupScreen} />
        <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
);

const AppNavigator = () => {
    const { userToken, isLoading } = useContext(AuthContext);

    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#7C3AED" />
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