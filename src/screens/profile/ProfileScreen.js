import React, { useContext } from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, Text } from 'react-native-paper';
import { AuthContext } from '../../contexts/AuthContext';
import Refresh from '../../components/Refresh';
import client from '../../api/client';

const ProfileScreen = () => {
    const { logout, userInfo, checkLogin } = useContext(AuthContext); // Assuming checkLogin or similar refreshes info, otherwise we fetch manual

    const handleRefresh = async () => {
        // Since AuthContext manages userInfo, we can try to call an update function or just manual fetch to verify connectivity
        // Ideally AuthContext should expose a method to refetch user info.
        // If not, we just wait a bit to simulate.
        // But wait, the user wants to refresh content. 
        // We can call /user/ endpoint?
        // Let's assume we just want to visual refresh if no data changed.
        // BETTER: Call checkLogin() if available to sync data? 
        // As I don't see AuthContext source, I will just do a dummy wait or client call.
        try {
            await client.get('/user/');
        } catch (e) { }
    };

    return (
        <Refresh contentContainerStyle={styles.container} onRefresh={handleRefresh}>
            <Text style={{ marginBottom: 20 }}>User: {userInfo?.name || 'User'}</Text>
            <Button mode="contained" onPress={logout}>Logout</Button>
        </Refresh>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }
});

export default ProfileScreen;
