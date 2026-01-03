import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, Alert } from 'react-native';
import { Text, List, FAB, Dialog, Button, TextInput, Avatar, ActivityIndicator } from 'react-native-paper';
import client from '../../api/client';
import { useIsFocused } from '@react-navigation/native';
import Refresh from '../../components/Refresh';

const GroupScreen = () => {
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [visible, setVisible] = useState(false); // Dialog visibility
    const [usernameToAdd, setUsernameToAdd] = useState('');
    const [addLoading, setAddLoading] = useState(false);
    const isFocused = useIsFocused();

    const fetchMembers = async () => {
        setLoading(true);
        try {
            const response = await client.get('/user/group/');
            // response.data.data should be the list or the group object containing members
            // Assuming response.data.data.members or response.data.data based on API structure
            // Let's assume response.data.data is the list of members for now based on "Get List" usually returning list
            // If it returns group info: { _id, name, members: [...] }
            const data = response.data.data;
            if (Array.isArray(data)) {
                setMembers(data);
            } else if (data && Array.isArray(data.members)) {
                setMembers(data.members);
            } else {
                setMembers([]);
            }
        } catch (e) {
            console.log(e);
            // Alert.alert('Error', 'Could not fetch group members');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isFocused) {
            fetchMembers();
        }
    }, [isFocused]);

    const showDialog = () => setVisible(true);
    const hideDialog = () => setVisible(false);

    const handleAddMember = async () => {
        if (!usernameToAdd) return;
        setAddLoading(true);
        try {
            await client.post('/user/group/add', { username: usernameToAdd });
            Alert.alert('Success', 'Member added successfully');
            setUsernameToAdd('');
            hideDialog();
            fetchMembers();
        } catch (e) {
            Alert.alert('Error', e.response?.data?.message || 'Failed to add member');
        } finally {
            setAddLoading(false);
        }
    };

    const handleRemoveMember = async (memberId) => {
        Alert.alert(
            'Confirm Remove',
            'Are you sure you want to remove this member?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Remove',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await client.post('/user/group/remove', { memberId });
                            fetchMembers();
                        } catch (e) {
                            Alert.alert('Error', 'Failed to remove member');
                        }
                    }
                }
            ]
        );
    };

    const renderItem = ({ item }) => (
        <List.Item
            title={item.name || item.username}
            description={item.email}
            left={props => <Avatar.Text {...props} size={40} label={(item.name || item.username || 'U').substring(0, 2).toUpperCase()} />}
            right={props => (
                <Button {...props} onPress={() => handleRemoveMember(item._id || item.id)}>Remove</Button>
            )}
        />
    );

    if (loading) {
        return <View style={styles.centered}><ActivityIndicator /></View>;
    }

    return (
        <View style={styles.container}>
            <Refresh style={styles.container} onRefresh={fetchMembers}>
                {members.length === 0 ? (
                    <View style={styles.centered}>
                        <Text>No members in your group.</Text>
                    </View>
                ) : (
                    members.map(item => (
                        <List.Item
                            key={item._id || item.id || Math.random().toString()}
                            title={item.name || item.username}
                            description={item.email}
                            left={props => <Avatar.Text {...props} size={40} label={(item.name || item.username || 'U').substring(0, 2).toUpperCase()} />}
                            right={props => (
                                <Button {...props} onPress={() => handleRemoveMember(item._id || item.id)}>Remove</Button>
                            )}
                        />
                    ))
                )}
            </Refresh>

            <FAB
                style={styles.fab}
                icon="plus"
                label="Add Member"
                onPress={showDialog}
            />

            <Dialog visible={visible} onDismiss={hideDialog}>
                <Dialog.Title>Add Member</Dialog.Title>
                <Dialog.Content>
                    <TextInput
                        label="Username"
                        value={usernameToAdd}
                        onChangeText={setUsernameToAdd}
                        mode="outlined"
                        autoCapitalize="none"
                    />
                </Dialog.Content>
                <Dialog.Actions>
                    <Button onPress={hideDialog}>Cancel</Button>
                    <Button onPress={handleAddMember} loading={addLoading}>Add</Button>
                </Dialog.Actions>
            </Dialog>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    fab: {
        position: 'absolute',
        margin: 16,
        right: 0,
        bottom: 0,
    },
});

export default GroupScreen;
