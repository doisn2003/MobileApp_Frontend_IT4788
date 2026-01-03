import React, { useState } from 'react';
import { View, Modal, StyleSheet, TouchableOpacity, Image, Alert, ActivityIndicator } from 'react-native';
import { Text, TextInput, Button, IconButton } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import client from '../api/client';

// --- MODAL SỬA THÔNG TIN (Avatar & Username) ---
export const EditProfileModal = ({ visible, onClose, userInfo, onUpdateSuccess }) => {
    const [username, setUsername] = useState(userInfo?.name || '');
    const [image, setImage] = useState(null); // URI ảnh
    const [loading, setLoading] = useState(false);

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.5,
        });

        if (!result.canceled) {
            setImage(result.assets[0].uri);
        }
    };

    const handleSave = async () => {
        if (!username || username.length < 3) {
            // [cite: 56] Mã 00028: Tên > 3 ký tự
            Alert.alert('Lỗi', 'Tên hiển thị phải dài hơn 3 ký tự.');
            return;
        }

        setLoading(true);
        try {
            const formData = new FormData();
            // [cite: 67] Edit user API yêu cầu field 'username'
            formData.append('username', username);
            
            if (image) {
                const filename = image.split('/').pop();
                const match = /\.(\w+)$/.exec(filename);
                const type = match ? `image/${match[1]}` : `image`;
                
                // [cite: 67] Edit user API yêu cầu field 'image' là File
                formData.append('image', { uri: image, name: filename, type });
            }

            // [cite: 67] PUT user/
            const response = await client.put('/user/', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            // [cite: 57] Mã 00086: Thông tin hồ sơ thay đổi thành công
            if (response.data.code === '00086' || response.status === 200) {
                Alert.alert('Thành công', 'Cập nhật hồ sơ thành công!');
                // Cập nhật lại context phía ngoài
                onUpdateSuccess({ name: username, avatar: image ? image : userInfo.avatar }); 
                onClose();
            }
        } catch (e) {
            console.log(e.response?.data);
            Alert.alert('Thất bại', e.response?.data?.message || 'Không thể cập nhật hồ sơ.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal visible={visible} animationType="slide" transparent>
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <Text style={styles.title}>Chỉnh sửa hồ sơ</Text>
                    
                    <TouchableOpacity onPress={pickImage} style={styles.imagePicker}>
                        {image || userInfo?.avatar ? (
                            <Image source={{ uri: image || userInfo?.avatar }} style={styles.avatarPreview} />
                        ) : (
                            <View style={[styles.avatarPreview, { backgroundColor: '#E5E7EB', justifyContent: 'center', alignItems: 'center' }]}>
                                <IconButton icon="camera" size={30} />
                            </View>
                        )}
                        <Text style={styles.imageHint}>Chạm để đổi ảnh</Text>
                    </TouchableOpacity>

                    <TextInput
                        label="Tên hiển thị"
                        value={username}
                        onChangeText={setUsername}
                        mode="outlined"
                        style={styles.input}
                    />

                    <View style={styles.actions}>
                        <Button onPress={onClose} style={styles.btn}>Hủy</Button>
                        <Button mode="contained" onPress={handleSave} loading={loading} style={styles.btn}>Lưu</Button>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

// --- MODAL ĐỔI MẬT KHẨU ---
export const ChangePasswordModal = ({ visible, onClose }) => {
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = async () => {
        // [cite: 56] Mã 00027: Mật khẩu 6-20 ký tự
        if (newPassword.length < 6 || newPassword.length > 20) {
            Alert.alert('Lỗi', 'Mật khẩu mới phải từ 6 đến 20 ký tự.');
            return;
        }

        setLoading(true);
        try {
            // [cite: 67] Change password API: POST user/change-password/
            // Body: oldPassword, newPassword
            const response = await client.post('/user/change-password/', {
                oldPassword,
                newPassword
            });

            // [cite: 57] Mã 00076: Mật khẩu thay đổi thành công
            if (response.data.code === '00076') {
                Alert.alert('Thành công', 'Đổi mật khẩu thành công!');
                setOldPassword('');
                setNewPassword('');
                onClose();
            } else {
                 Alert.alert('Thất bại', response.data.message);
            }
        } catch (e) {
            console.log(e.response?.data);
            Alert.alert('Lỗi', e.response?.data?.message || 'Đổi mật khẩu thất bại.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal visible={visible} animationType="slide" transparent>
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <Text style={styles.title}>Đổi mật khẩu</Text>
                    
                    <TextInput
                        label="Mật khẩu cũ"
                        value={oldPassword}
                        onChangeText={setOldPassword}
                        secureTextEntry
                        mode="outlined"
                        style={styles.input}
                    />
                    <TextInput
                        label="Mật khẩu mới"
                        value={newPassword}
                        onChangeText={setNewPassword}
                        secureTextEntry
                        mode="outlined"
                        style={styles.input}
                    />

                    <View style={styles.actions}>
                        <Button onPress={onClose} style={styles.btn}>Hủy</Button>
                        <Button mode="contained" onPress={handleChange} loading={loading} style={styles.btn}>Đổi</Button>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
    modalContent: { backgroundColor: 'white', borderRadius: 20, padding: 20 },
    title: { fontSize: 20, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
    imagePicker: { alignItems: 'center', marginBottom: 20 },
    avatarPreview: { width: 100, height: 100, borderRadius: 50 },
    imageHint: { marginTop: 8, color: '#6B7280', fontSize: 12 },
    input: { marginBottom: 12, backgroundColor: 'white' },
    actions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 10, gap: 10 },
    btn: { flex: 1 }
});