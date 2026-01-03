// import React, { useContext } from 'react';
// import { View, StyleSheet } from 'react-native';
// import { Button, Text } from 'react-native-paper';
// import { AuthContext } from '../../contexts/AuthContext';

// const ProfileScreen = () => {
//     const { logout, userInfo } = useContext(AuthContext);
//     return (
//         <View style={styles.container}>
//             <Text style={{ marginBottom: 20 }}>User: {userInfo?.name || 'User'}</Text>
//             <Button mode="contained" onPress={logout}>Logout</Button>
//         </View>
//     );
// };

// const styles = StyleSheet.create({
//     container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }
// });

// export default ProfileScreen;
import React, { useContext, useState } from 'react';
import { View, StyleSheet, ScrollView, Image, TouchableOpacity, Alert, SafeAreaView } from 'react-native';
import { Text, List, Divider, Avatar, Switch } from 'react-native-paper';
import { AuthContext } from '../../contexts/AuthContext';
import { EditProfileModal, ChangePasswordModal } from '../../components/ProfileModals';

const ProfileScreen = ({ navigation }) => {
    const { logout, userInfo, updateUser } = useContext(AuthContext);
    
    // Modal States
    const [editVisible, setEditVisible] = useState(false);
    const [passwordVisible, setPasswordVisible] = useState(false);
    
    // Setting States (Giả lập)
    const [notifications, setNotifications] = useState(true);

    const handleLogout = () => {
        Alert.alert('Đăng xuất', 'Bạn có chắc chắn muốn đăng xuất?', [
            { text: 'Hủy', style: 'cancel' },
            { text: 'Đăng xuất', onPress: logout, style: 'destructive' }
        ]);
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                
                {/* Header Info */}
                <View style={styles.header}>
                    <View style={styles.avatarContainer}>
                        {userInfo?.avatar ? (
                            <Image source={{ uri: userInfo.avatar }} style={styles.avatar} />
                        ) : (
                            <Avatar.Text size={80} label={userInfo?.name?.substring(0,2).toUpperCase() || 'US'} style={{backgroundColor: '#7C3AED'}} />
                        )}
                        <TouchableOpacity style={styles.editIcon} onPress={() => setEditVisible(true)}>
                            <Avatar.Icon size={24} icon="pencil" style={{ backgroundColor: '#111827' }} />
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.name}>{userInfo?.name || 'Người dùng'}</Text>
                    <Text style={styles.email}>{userInfo?.email || 'email@example.com'}</Text>
                </View>

                {/* Menu Options */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Tài khoản</Text>
                    
                    <List.Item
                        title="Chỉnh sửa hồ sơ"
                        left={props => <List.Icon {...props} icon="account-edit-outline" />}
                        right={props => <List.Icon {...props} icon="chevron-right" />}
                        onPress={() => setEditVisible(true)}
                        style={styles.listItem}
                    />
                    <Divider />
                    <List.Item
                        title="Đổi mật khẩu"
                        left={props => <List.Icon {...props} icon="lock-reset" />}
                        right={props => <List.Icon {...props} icon="chevron-right" />}
                        onPress={() => setPasswordVisible(true)}
                        style={styles.listItem}
                    />
                </View>

                {/* Admin Section -  Chỉ hiển thị nếu cần quản lý danh mục/đơn vị */}
                {/* Giả định: Kiểm tra role hoặc luôn hiện để demo */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Quản trị hệ thống (Admin)</Text>
                    <List.Item
                        title="Quản lý Danh mục (Categories)"
                        description="Thêm/Sửa/Xóa loại thực phẩm"
                        left={props => <List.Icon {...props} icon="shape-outline" />}
                        onPress={() => Alert.alert('Thông báo', 'Tính năng đang phát triển')}
                    />
                     <Divider />
                    <List.Item
                        title="Quản lý Đơn vị (Units)"
                        description="kg, g, lít, hộp..."
                        left={props => <List.Icon {...props} icon="scale" />}
                        onPress={() => Alert.alert('Thông báo', 'Tính năng đang phát triển')}
                    />
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Cài đặt ứng dụng</Text>
                    <List.Item
                        title="Thông báo nhắc nhở"
                        description="Nhận tin khi thực phẩm sắp hết hạn"
                        left={props => <List.Icon {...props} icon="bell-outline" />}
                        right={() => <Switch value={notifications} onValueChange={setNotifications} color="#7C3AED" />}
                    />
                </View>

                <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
                    <Text style={styles.logoutText}>Đăng xuất</Text>
                </TouchableOpacity>

                <Text style={styles.version}>Phiên bản 1.0.0 - IT4788 Project</Text>
            </ScrollView>

            {/* Modals */}
            <EditProfileModal 
                visible={editVisible} 
                onClose={() => setEditVisible(false)} 
                userInfo={userInfo}
                onUpdateSuccess={updateUser}
            />
            
            <ChangePasswordModal 
                visible={passwordVisible} 
                onClose={() => setPasswordVisible(false)} 
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F3F4F6' },
    scrollContent: { paddingBottom: 40 },
    header: { alignItems: 'center', padding: 24, backgroundColor: 'white', marginBottom: 12 },
    avatarContainer: { position: 'relative', marginBottom: 12 },
    avatar: { width: 80, height: 80, borderRadius: 40 },
    editIcon: { position: 'absolute', bottom: 0, right: 0 },
    name: { fontSize: 20, fontWeight: 'bold', color: '#111827' },
    email: { fontSize: 14, color: '#6B7280', marginTop: 4 },
    
    section: { backgroundColor: 'white', marginBottom: 12, paddingVertical: 8 },
    sectionTitle: { fontSize: 13, fontWeight: '700', color: '#9CA3AF', paddingHorizontal: 16, paddingVertical: 8, textTransform: 'uppercase' },
    listItem: { paddingVertical: 4 },
    
    logoutBtn: { margin: 16, padding: 16, backgroundColor: '#FEE2E2', borderRadius: 12, alignItems: 'center' },
    logoutText: { color: '#DC2626', fontWeight: 'bold', fontSize: 16 },
    version: { textAlign: 'center', color: '#9CA3AF', fontSize: 12, marginBottom: 20 }
});

export default ProfileScreen;