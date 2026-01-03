// // import React, { useState, useEffect } from 'react';
// // import { View, StyleSheet, FlatList, Alert } from 'react-native';
// // import { Text, List, FAB, Dialog, Button, TextInput, Avatar, ActivityIndicator } from 'react-native-paper';
// // import client from '../../api/client';
// // import { useIsFocused } from '@react-navigation/native';

// // const GroupScreen = () => {
// //     const [members, setMembers] = useState([]);
// //     const [loading, setLoading] = useState(false);
// //     const [visible, setVisible] = useState(false); // Dialog visibility
// //     const [usernameToAdd, setUsernameToAdd] = useState('');
// //     const [addLoading, setAddLoading] = useState(false);
// //     const isFocused = useIsFocused();

// //     const fetchMembers = async () => {
// //         setLoading(true);
// //         try {
// //             const response = await client.get('/user/group/');
// //             // response.data.data should be the list or the group object containing members
// //             // Assuming response.data.data.members or response.data.data based on API structure
// //             // Let's assume response.data.data is the list of members for now based on "Get List" usually returning list
// //             // If it returns group info: { _id, name, members: [...] }
// //             const data = response.data.data;
// //             if (Array.isArray(data)) {
// //                 setMembers(data);
// //             } else if (data && Array.isArray(data.members)) {
// //                 setMembers(data.members);
// //             } else {
// //                 setMembers([]);
// //             }
// //         } catch (e) {
// //             console.log(e);
// //             // Alert.alert('Error', 'Could not fetch group members');
// //         } finally {
// //             setLoading(false);
// //         }
// //     };

// //     useEffect(() => {
// //         if (isFocused) {
// //             fetchMembers();
// //         }
// //     }, [isFocused]);

// //     const showDialog = () => setVisible(true);
// //     const hideDialog = () => setVisible(false);

// //     const handleAddMember = async () => {
// //         if (!usernameToAdd) return;
// //         setAddLoading(true);
// //         try {
// //             await client.post('/user/group/add', { username: usernameToAdd });
// //             Alert.alert('Success', 'Member added successfully');
// //             setUsernameToAdd('');
// //             hideDialog();
// //             fetchMembers();
// //         } catch (e) {
// //             Alert.alert('Error', e.response?.data?.message || 'Failed to add member');
// //         } finally {
// //             setAddLoading(false);
// //         }
// //     };

// //     const handleRemoveMember = async (memberId) => {
// //         Alert.alert(
// //             'Confirm Remove',
// //             'Are you sure you want to remove this member?',
// //             [
// //                 { text: 'Cancel', style: 'cancel' },
// //                 {
// //                     text: 'Remove',
// //                     style: 'destructive',
// //                     onPress: async () => {
// //                         try {
// //                             await client.post('/user/group/remove', { memberId });
// //                             fetchMembers();
// //                         } catch (e) {
// //                             Alert.alert('Error', 'Failed to remove member');
// //                         }
// //                     }
// //                 }
// //             ]
// //         );
// //     };

// //     const renderItem = ({ item }) => (
// //         <List.Item
// //             title={item.name || item.username}
// //             description={item.email}
// //             left={props => <Avatar.Text {...props} size={40} label={(item.name || item.username || 'U').substring(0, 2).toUpperCase()} />}
// //             right={props => (
// //                 <Button {...props} onPress={() => handleRemoveMember(item._id || item.id)}>Remove</Button>
// //             )}
// //         />
// //     );

// //     if (loading) {
// //         return <View style={styles.centered}><ActivityIndicator /></View>;
// //     }

// //     return (
// //         <View style={styles.container}>
// //             {members.length === 0 ? (
// //                 <View style={styles.centered}>
// //                     <Text>No members in your group.</Text>
// //                 </View>
// //             ) : (
// //                 <FlatList
// //                     data={members}
// //                     keyExtractor={(item) => item._id || item.id || Math.random().toString()}
// //                     renderItem={renderItem}
// //                 />
// //             )}

// //             <FAB
// //                 style={styles.fab}
// //                 icon="plus"
// //                 label="Add Member"
// //                 onPress={showDialog}
// //             />

// //             <Dialog visible={visible} onDismiss={hideDialog}>
// //                 <Dialog.Title>Add Member</Dialog.Title>
// //                 <Dialog.Content>
// //                     <TextInput
// //                         label="Username"
// //                         value={usernameToAdd}
// //                         onChangeText={setUsernameToAdd}
// //                         mode="outlined"
// //                         autoCapitalize="none"
// //                     />
// //                 </Dialog.Content>
// //                 <Dialog.Actions>
// //                     <Button onPress={hideDialog}>Cancel</Button>
// //                     <Button onPress={handleAddMember} loading={addLoading}>Add</Button>
// //                 </Dialog.Actions>
// //             </Dialog>
// //         </View>
// //     );
// // };

// // const styles = StyleSheet.create({
// //     container: {
// //         flex: 1,
// //         backgroundColor: '#f5f5f5',
// //     },
// //     centered: {
// //         flex: 1,
// //         justifyContent: 'center',
// //         alignItems: 'center',
// //     },
// //     fab: {
// //         position: 'absolute',
// //         margin: 16,
// //         right: 0,
// //         bottom: 0,
// //     },
// // });

// // export default GroupScreen;
// import React, { useState, useEffect, useCallback } from 'react';
// import { View, StyleSheet, FlatList, Alert, Image, RefreshControl } from 'react-native';
// import { Text, Button, TextInput, IconButton, Card, Avatar, FAB, Dialog, Portal } from 'react-native-paper';
// import { useIsFocused } from '@react-navigation/native';
// import client from '../../api/client';

// const GroupScreen = () => {
//     const [hasGroup, setHasGroup] = useState(false);
//     const [members, setMembers] = useState([]);
//     const [loading, setLoading] = useState(false);
//     const [addDialogVisible, setAddDialogVisible] = useState(false);
//     const [newMemberEmail, setNewMemberEmail] = useState(''); // Thực tế API yêu cầu 'username'

//     const isFocused = useIsFocused();

//     const fetchGroupData = useCallback(async () => {
//         setLoading(true);
//         try {
//             // GET user/group/ - Lấy danh sách thành viên
//             const response = await client.get('/user/group/');
            
//             // API trả về code 00096 nếu chưa có nhóm
//             if (response.data.code === '00096') {
//                 setHasGroup(false);
//                 setMembers([]);
//             } else if (response.data.data) {
//                 setHasGroup(true);
//                 setMembers(response.data.data);
//             }
//         } catch (e) {
//             // Nếu lỗi 400/404 và message là "Bạn không thuộc về nhóm nào"
//             if (e.response?.data?.code === '00096') {
//                 setHasGroup(false);
//                 setMembers([]);
//             } else {
//                 console.log('Group fetch error:', e);
//             }
//         } finally {
//             setLoading(false);
//         }
//     }, []);

//     useEffect(() => {
//         if (isFocused) {
//             fetchGroupData();
//         }
//     }, [isFocused, fetchGroupData]);

//     const handleCreateGroup = async () => {
//         try {
//             // POST user/group/
//             await client.post('/user/group/');
//             Alert.alert('Thành công', 'Đã tạo nhóm gia đình mới!');
//             fetchGroupData();
//         } catch (e) {
//             Alert.alert('Lỗi', e.response?.data?.message || 'Không thể tạo nhóm');
//         }
//     };

//     const handleAddMember = async () => {
//         if (!newMemberEmail) return;
//         try {
//             // POST user/group/add/ - Body: { username }
//             // Lưu ý: Tài liệu API ghi tham số là 'username', nhưng UX thường nhập email.
//             // Hãy chắc chắn user nhập đúng Username của người cần mời.
//             await client.post('/user/group/add/', 
//                 { username: newMemberEmail },
//                 { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
//             );
            
//             Alert.alert('Thành công', 'Đã thêm thành viên mới');
//             setAddDialogVisible(false);
//             setNewMemberEmail('');
//             fetchGroupData();
//         } catch (e) {
//             // Mã 00100: Thiếu username, 00099 X: Không tồn tại user
//             Alert.alert('Thất bại', e.response?.data?.message || 'Không tìm thấy người dùng này');
//         }
//     };

//     const handleRemoveMember = (username) => {
//         Alert.alert('Xác nhận', `Xóa ${username} khỏi nhóm?`, [
//             { text: 'Hủy', style: 'cancel' },
//             { 
//                 text: 'Xóa', 
//                 style: 'destructive',
//                 onPress: async () => {
//                     try {
//                         // DELETE user/group/ - Body: { username }
//                         await client.delete('/user/group/', { 
//                             data: { username },
//                             headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
//                         });
//                         fetchGroupData();
//                     } catch (e) {
//                         // Mã 00104: Bạn không phải admin
//                         Alert.alert('Lỗi', e.response?.data?.message || 'Không thể xóa thành viên');
//                     }
//                 }
//             }
//         ]);
//     };

//     const renderMember = ({ item }) => (
//         <Card style={styles.card}>
//             <Card.Title
//                 title={item.name || item.username} // API có thể trả về name hoặc username
//                 subtitle={item.email}
//                 left={(props) => (
//                     item.image 
//                     ? <Avatar.Image {...props} size={40} source={{ uri: item.image }} />
//                     : <Avatar.Text {...props} size={40} label={(item.username || 'U').substring(0,2).toUpperCase()} />
//                 )}
//                 right={(props) => (
//                     <IconButton {...props} icon="account-remove" iconColor="#EF4444" onPress={() => handleRemoveMember(item.username)} />
//                 )}
//             />
//         </Card>
//     );

//     // Giao diện khi chưa có nhóm
//     if (!hasGroup && !loading) {
//         return (
//             <View style={[styles.container, { justifyContent: 'center', alignItems: 'center', padding: 20 }]}>
//                 <MaterialCommunityIcons name="account-group-outline" size={100} color="#D1D5DB" />
//                 <Text style={styles.noGroupText}>Bạn chưa tham gia nhóm nào</Text>
//                 <Text style={styles.noGroupSub}>Tạo nhóm để chia sẻ danh sách đi chợ và quản lý tủ lạnh cùng gia đình.</Text>
//                 <Button mode="contained" onPress={handleCreateGroup} style={styles.createBtn}>
//                     Tạo Nhóm Ngay
//                 </Button>
//             </View>
//         );
//     }

//     // Giao diện khi đã có nhóm
//     return (
//         <View style={styles.container}>
//             <View style={styles.header}>
//                 <Text style={styles.title}>Thành Viên Gia Đình</Text>
//                 <Text style={styles.subtitle}>{members.length} thành viên</Text>
//             </View>

//             <FlatList
//                 data={members}
//                 renderItem={renderMember}
//                 keyExtractor={(item) => item.username || Math.random().toString()}
//                 contentContainerStyle={styles.list}
//                 refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchGroupData} />}
//             />

//             <FAB
//                 style={styles.fab}
//                 icon="account-plus"
//                 label="Thêm người"
//                 onPress={() => setAddDialogVisible(true)}
//             />

//             <Portal>
//                 <Dialog visible={addDialogVisible} onDismiss={() => setAddDialogVisible(false)}>
//                     <Dialog.Title>Thêm thành viên</Dialog.Title>
//                     <Dialog.Content>
//                         <TextInput
//                             label="Nhập Username người dùng"
//                             value={newMemberEmail}
//                             onChangeText={setNewMemberEmail}
//                             mode="outlined"
//                             autoCapitalize="none"
//                         />
//                         <Text style={styles.hint}>Người dùng phải đăng ký tài khoản trước.</Text>
//                     </Dialog.Content>
//                     <Dialog.Actions>
//                         <Button onPress={() => setAddDialogVisible(false)}>Hủy</Button>
//                         <Button onPress={handleAddMember}>Thêm</Button>
//                     </Dialog.Actions>
//                 </Dialog>
//             </Portal>
//         </View>
//     );
// };

// const styles = StyleSheet.create({
//     container: { flex: 1, backgroundColor: '#F3F4F6' },
//     header: { padding: 20, backgroundColor: 'white' },
//     title: { fontSize: 24, fontWeight: 'bold', color: '#111827' },
//     subtitle: { color: '#6B7280', marginTop: 4 },
//     list: { padding: 16 },
//     card: { marginBottom: 12, backgroundColor: 'white', borderRadius: 12 },
//     noGroupText: { fontSize: 20, fontWeight: 'bold', marginTop: 20, color: '#374151' },
//     noGroupSub: { textAlign: 'center', color: '#6B7280', marginTop: 10, marginBottom: 30 },
//     createBtn: { backgroundColor: '#7C3AED', paddingHorizontal: 20 },
//     fab: { position: 'absolute', margin: 16, right: 0, bottom: 0, backgroundColor: '#7C3AED' },
//     hint: { fontSize: 12, color: '#9CA3AF', marginTop: 4, fontStyle: 'italic' }
// });

// // Bạn cần import MaterialCommunityIcons trong file này nếu chưa có
// import { MaterialCommunityIcons } from '@expo/vector-icons';

// export default GroupScreen;
import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, FlatList, Alert, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Button, TextInput, IconButton, Card, Avatar, FAB, Dialog, Portal } from 'react-native-paper';
import { useIsFocused } from '@react-navigation/native';

import { MaterialCommunityIcons } from '@expo/vector-icons';
import client from '../../api/client';


const GroupScreen = () => {
    const [hasGroup, setHasGroup] = useState(false);
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [addDialogVisible, setAddDialogVisible] = useState(false);
    const [newMemberEmail, setNewMemberEmail] = useState('');

    const isFocused = useIsFocused();

    const fetchGroupData = useCallback(async () => {
        setLoading(true);
        try {
            const response = await client.get('/user/group/');
            if (response.data.code === '00096') {
                setHasGroup(false);
                setMembers([]);
            } else if (response.data.data) {
                setHasGroup(true);
                setMembers(response.data.data);
            }
        } catch (e) {
            if (e.response?.data?.code === '00096') {
                setHasGroup(false);
                setMembers([]);
            }
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (isFocused) {
            fetchGroupData();
        }
    }, [isFocused, fetchGroupData]);

    const handleCreateGroup = async () => {
        try {
            await client.post('/user/group/');
            Alert.alert('Thành công', 'Đã tạo nhóm gia đình mới!');
            fetchGroupData();
        } catch (e) {
            Alert.alert('Lỗi', e.response?.data?.message || 'Không thể tạo nhóm');
        }
    };

    const handleAddMember = async () => {
        if (!newMemberEmail) return;
        try {
            await client.post('/user/group/add/', 
                { username: newMemberEmail },
                { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
            );
            Alert.alert('Thành công', 'Đã thêm thành viên mới');
            setAddDialogVisible(false);
            setNewMemberEmail('');
            fetchGroupData();
        } catch (e) {
            Alert.alert('Thất bại', e.response?.data?.message || 'Không tìm thấy người dùng này');
        }
    };

    const handleRemoveMember = (username) => {
        Alert.alert('Xác nhận', `Xóa ${username} khỏi nhóm?`, [
            { text: 'Hủy', style: 'cancel' },
            { 
                text: 'Xóa', 
                style: 'destructive',
                onPress: async () => {
                    try {
                        await client.delete('/user/group/', { 
                            data: { username },
                            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
                        });
                        fetchGroupData();
                    } catch (e) {
                        Alert.alert('Lỗi', e.response?.data?.message || 'Không thể xóa thành viên');
                    }
                }
            }
        ]);
    };

    const renderMember = ({ item }) => (
        <Card style={styles.card}>
            <Card.Title
                title={item.name || item.username} 
                subtitle={item.email}
                left={(props) => (
                    item.image 
                    ? <Avatar.Image {...props} size={40} source={{ uri: item.image }} />
                    : <Avatar.Text {...props} size={40} label={(item.username || 'U').substring(0,2).toUpperCase()} />
                )}
                right={(props) => (
                    <IconButton {...props} icon="account-remove" iconColor="#EF4444" onPress={() => handleRemoveMember(item.username)} />
                )}
            />
        </Card>
    );

    if (!hasGroup && !loading) {
        return (
            <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center', padding: 20 }]} edges={['top', 'left', 'right']}>
                <MaterialCommunityIcons name="account-group-outline" size={100} color="#D1D5DB" />
                <Text style={styles.noGroupText}>Bạn chưa tham gia nhóm nào</Text>
                <Button mode="contained" onPress={handleCreateGroup} style={styles.createBtn}>
                    Tạo Nhóm Ngay
                </Button>
            </SafeAreaView>
        );
    }

    return (

        <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
            <View style={styles.header}>
                <Text style={styles.title}>Thành Viên Gia Đình</Text>
                <Text style={styles.subtitle}>{members.length} thành viên</Text>
            </View>

            <FlatList
                data={members}
                renderItem={renderMember}
                keyExtractor={(item) => item.username || Math.random().toString()}
                contentContainerStyle={styles.list}
                refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchGroupData} />}
            />


            <FAB
                style={styles.fab}
                icon="account-plus"
                label="Thêm người"
                onPress={() => setAddDialogVisible(true)}
            />

            <Portal>
                <Dialog visible={addDialogVisible} onDismiss={() => setAddDialogVisible(false)}>
                    <Dialog.Title>Thêm thành viên</Dialog.Title>
                    <Dialog.Content>
                        <TextInput
                            label="Nhập Username"
                            value={newMemberEmail}
                            onChangeText={setNewMemberEmail}
                            mode="outlined"
                            autoCapitalize="none"
                        />
                    </Dialog.Content>
                    <Dialog.Actions>
                        <Button onPress={() => setAddDialogVisible(false)}>Hủy</Button>
                        <Button onPress={handleAddMember}>Thêm</Button>
                    </Dialog.Actions>
                </Dialog>
            </Portal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F3F4F6' },
    header: { padding: 20, backgroundColor: 'white' },
    title: { fontSize: 24, fontWeight: 'bold', color: '#111827' },
    subtitle: { color: '#6B7280', marginTop: 4 },
    list: { padding: 16 },
    card: { marginBottom: 12, backgroundColor: 'white', borderRadius: 12 },
    noGroupText: { fontSize: 20, fontWeight: 'bold', marginTop: 20, color: '#374151', marginBottom: 20 },
    createBtn: { backgroundColor: '#7C3AED', paddingHorizontal: 20 },
    fab: { position: 'absolute', margin: 16, right: 0, bottom: 0, backgroundColor: '#7C3AED' }
});

export default GroupScreen;