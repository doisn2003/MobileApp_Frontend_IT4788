import React, { useContext, useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Image, TouchableOpacity, Alert, SafeAreaView } from 'react-native';
import { Text, List, Divider, Avatar, Switch } from 'react-native-paper';
import { AuthContext } from '../../contexts/AuthContext';
import { EditProfileModal, ChangePasswordModal } from '../../components/ProfileModals';

import CategoryManagement from '../../components/CategoryManagement';
import UnitManagement from '../../components/UnitManagement';
import client from '../../api/client';
import { API_BASE_URL } from '../../../constants';

const ProfileScreen = ({ navigation }) => {
    const { logout, userInfo, updateUser } = useContext(AuthContext);
    
    // Modal States
    const [editVisible, setEditVisible] = useState(false);
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [categoryVisible, setCategoryVisible] = useState(false);
    const [unitVisible, setUnitVisible] = useState(false);
    const [notifications, setNotifications] = useState(true);
    const [groupInfo, setGroupInfo] = useState(null);

    // THÊM MỚI: Kiểm tra xem user có phải là admin của group không
    const isGroupAdmin = () => {
        if (!groupInfo || !userInfo) return false;
        const adminId = groupInfo.adminId?._id || groupInfo.adminId;
        const userId = userInfo.id || userInfo._id;
        return adminId === userId;
    };

    // THÊM MỚI: Fetch group info khi component mount
    useEffect(() => {
        fetchGroupInfo();
    }, []);

    const fetchGroupInfo = async () => {
        try {
            const response = await client.get('/user/group/info');
            if (response.data && response.data.data) {
                setGroupInfo(response.data.data);
            }
        } catch (error) {
            // User chưa có nhóm - không cần báo lỗi
            if (error.response?.data?.code !== '00096') {
                console.log('Fetch group info error:', error);
            }
        }
    };

    // THÊM MỚI: Xử lý mở Category Management
    const handleOpenCategoryManagement = () => {
        if (!groupInfo) {
            Alert.alert('Thông báo', 'Bạn chưa tham gia nhóm nào.');
            return;
        }
        if (!isGroupAdmin()) {
            Alert.alert('Thông báo', 'Bạn không phải quản trị viên');
            return;
        }
        setCategoryVisible(true);
    };

    // THÊM MỚI: Xử lý mở Unit Management
    const handleOpenUnitManagement = () => {
        if (!groupInfo) {
            Alert.alert('Thông báo', 'Bạn chưa tham gia nhóm nào.');
            return;
        }
        if (!isGroupAdmin()) {
            Alert.alert('Thông báo', 'Bạn không phải quản trị viên');
            return;
        }
        setUnitVisible(true);
    };

    const handleLogout = () => {
        Alert.alert('Đăng xuất', 'Bạn có chắc chắn muốn đăng xuất?', [
            { text: 'Hủy', style: 'cancel' },
            { text: 'Đăng xuất', onPress: logout, style: 'destructive' }
        ]);
    };

    // [FIX HIỂN THỊ ẢNH]
    const getAvatarUri = (avatarPath) => {
        if (!avatarPath) return null;
        // Nếu là ảnh từ máy (file://...) hoặc ảnh mạng (http...) thì giữ nguyên
        if (avatarPath.startsWith('http') || avatarPath.startsWith('file')) {
            return { uri: avatarPath };
        }
        // Nếu là đường dẫn tương đối từ server (/uploads/...) thì nối thêm Base URL
        // Cần đảm bảo đường dẫn không bị double slash
        const cleanPath = avatarPath.startsWith('/') ? avatarPath.substring(1) : avatarPath;
        // BASE_URL trong file client.js thường đã có /it4788
        // Nếu server trả về full path /it4788/uploads... thì cẩn thận trùng lặp
        // Ở đây giả định server trả về đường dẫn tĩnh
        return { uri: `${API_BASE_URL}/${cleanPath}` };
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                
                {/* Header Info */}
                <View style={styles.header}>
                    <View style={styles.avatarContainer}>
                        {userInfo?.avatar ? (
                            <Image 
                                source={getAvatarUri(userInfo.avatar)} 
                                style={styles.avatar} 
                                // Thêm default source hoặc xử lý lỗi load ảnh nếu cần
                            />
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

                {/* THÊM MỚI: Admin Section với badge */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Quản trị hệ thống (Admin)</Text>
                        {groupInfo && (
                            <View style={[styles.adminBadge, isGroupAdmin() ? styles.adminBadgeActive : styles.adminBadgeInactive]}>
                                <Text style={styles.adminBadgeText}>
                                    {isGroupAdmin() ? '👑 Quản trị viên' : '👤 Thành viên'}
                                </Text>
                            </View>
                        )}
                    </View>
                    <List.Item
                        title="Quản lý Danh mục (Categories)"
                        description="Thêm/Sửa/Xóa loại thực phẩm"
                        left={props => <List.Icon {...props} icon="shape-outline" color="#7C3AED" />}
                        right={props => <List.Icon {...props} icon="chevron-right" />}
                        onPress={handleOpenCategoryManagement}
                        style={styles.listItem}
                    />
                    <Divider />
                    <List.Item
                        title="Quản lý Đơn vị (Units)"
                        description="kg, g, lít, hộp..."
                        left={props => <List.Icon {...props} icon="scale" color="#10B981" />}
                        right={props => <List.Icon {...props} icon="chevron-right" />}
                        onPress={handleOpenUnitManagement}
                        style={styles.listItem}
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

            {/* THÊM MỚI: Admin Management Modals */}
            <CategoryManagement
                visible={categoryVisible}
                onClose={() => setCategoryVisible(false)}
                isAdmin={isGroupAdmin()}
            />

            <UnitManagement
                visible={unitVisible}
                onClose={() => setUnitVisible(false)}
                isAdmin={isGroupAdmin()}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F3F4F6' },
    scrollContent: { paddingBottom: 40 },
    header: { alignItems: 'center', padding: 24, backgroundColor: 'white', marginBottom: 12 },
    avatarContainer: { position: 'relative', marginBottom: 12 },
    avatar: { width: 80, height: 80, borderRadius: 40, borderWidth: 1, borderColor: '#E5E7EB' },
    editIcon: { position: 'absolute', bottom: 0, right: 0 },
    name: { fontSize: 20, fontWeight: 'bold', color: '#111827' },
    email: { fontSize: 14, color: '#6B7280', marginTop: 4 },
    
    section: { backgroundColor: 'white', marginBottom: 12, paddingVertical: 8 },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingRight: 16 },
    sectionTitle: { fontSize: 13, fontWeight: '700', color: '#9CA3AF', paddingHorizontal: 16, paddingVertical: 8, textTransform: 'uppercase' },
    adminBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
    adminBadgeActive: { backgroundColor: '#FEF3C7' },
    adminBadgeInactive: { backgroundColor: '#F3F4F6' },
    adminBadgeText: { fontSize: 11, fontWeight: '600', color: '#1F2937' },
    listItem: { paddingVertical: 4 },
    
    logoutBtn: { margin: 16, padding: 16, backgroundColor: '#FEE2E2', borderRadius: 12, alignItems: 'center' },
    logoutText: { color: '#DC2626', fontWeight: 'bold', fontSize: 16 },
    version: { textAlign: 'center', color: '#9CA3AF', fontSize: 12, marginBottom: 20 }
});

export default ProfileScreen;