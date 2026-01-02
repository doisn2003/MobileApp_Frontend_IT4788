import React, { useContext } from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, Text } from 'react-native-paper';
import { AuthContext } from '../../contexts/AuthContext';

const ProfileScreen = () => {
    const { logout, userInfo } = useContext(AuthContext);
    return (
        <View style={styles.container}>
            <Text style={{ marginBottom: 20 }}>User: {userInfo?.name || 'User'}</Text>
            <Button mode="contained" onPress={logout}>Logout</Button>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }
});

export default ProfileScreen;
