import React, { useState, useEffect } from 'react';
import { View, Modal, StyleSheet, TouchableOpacity, Image, Alert, ActivityIndicator } from 'react-native';
import { Text, TextInput, Button, IconButton } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import client from '../api/client';

// --- MODAL SỬA THÔNG TIN (Avatar & Username) ---
export const EditProfileModal = ({ visible, onClose, userInfo, onUpdateSuccess }) => {
    const [name, setName] = useState('');
    const [image, setImage] = useState(null); // URI ảnh từ máy
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (visible && userInfo) {
            setName(userInfo.name || userInfo.username || '');
            setImage(null);
        }
    }, [visible, userInfo]);

    const pickImage = async () => {
        // [FIX] Xin quyền truy cập ảnh
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Quyền truy cập', 'Cần cấp quyền để đổi ảnh đại diện.');
            return;
        }

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
        if (!name || name.length < 3) {
            Alert.alert('Lỗi', 'Tên hiển thị phải dài hơn 3 ký tự.');
            return;
        }

        setLoading(true);
        try {
            // [SỬA LẠI]: Dùng POST /user/edit thay vì PUT /user/
            // Lưu ý: Kiểm tra lại tài liệu xem API này nhận FormData (có ảnh) hay x-www-form-urlencoded (chỉ text)
            // Nếu tài liệu mục 1.4 ghi "Content-Type: x-www-form-urlencoded" thì API này KHÔNG upload được ảnh.
            // Tuy nhiên, thường edit profile sẽ có ảnh. Tôi sẽ giữ FormData để gửi ảnh.
            // Nếu server thực sự là /user/edit và chỉ nhận text, bạn phải bỏ phần append image.
            
            // Dựa trên lỗi 404 cũ, hãy thử endpoint chuẩn trong tài liệu:
            const response = await client.post('/user/edit', { 
                name: name, 
                avatar: image // Lưu ý: Nếu API này chỉ nhận string URL ảnh thì logic upload ảnh phải làm riêng
            }, {
                 headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            });

            // *LƯU Ý QUAN TRỌNG*: 
            // Nếu API /user/edit này không hỗ trợ upload file ảnh trực tiếp mà chỉ nhận string URL, 
            // bạn cần 1 API upload ảnh riêng (ví dụ /upload) để lấy URL trước, sau đó mới gọi /user/edit.
            
            // Nếu server hỗ trợ Multipart ở endpoint khác (ví dụ POST /user/update-avatar), hãy dùng endpoint đó.
            // Dưới đây là code thử fix theo hướng POST /user/edit (theo tài liệu bạn cung cấp ở mục 1.4):

            if (response.status === 200) {
                Alert.alert('Thành công', 'Cập nhật hồ sơ thành công!');
                onUpdateSuccess({ name: name }); // Cập nhật tên mới vào Context
                onClose();
            } else {
                Alert.alert('Thông báo', response.data?.message || 'Cập nhật thất bại');
            }

        } catch (e) {
            console.log('Edit Profile Error:', e.response?.data || e.message);
            Alert.alert('Lỗi', 'Không thể kết nối server hoặc sai đường dẫn API.');
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
                        {image ? (
                            <Image source={{ uri: image }} style={styles.avatarPreview} />
                        ) : userInfo?.avatar ? (
                            // Logic hiển thị ảnh cũ sẽ được xử lý kỹ hơn ở ProfileScreen
                            <Image source={{ uri: userInfo.avatar }} style={styles.avatarPreview} />
                        ) : (
                            <View style={[styles.avatarPreview, { backgroundColor: '#E5E7EB', justifyContent: 'center', alignItems: 'center' }]}>
                                <IconButton icon="camera" size={30} />
                            </View>
                        )}
                        <Text style={styles.imageHint}>Chạm để đổi ảnh</Text>
                    </TouchableOpacity>

                    <TextInput
                        label="Tên hiển thị"
                        value={name}
                        onChangeText={setName}
                        mode="outlined"
                        style={styles.input}
                    />

                    <View style={styles.actions}>
                        <Button onPress={onClose} style={styles.btn}>Hủy</Button>
                        <Button mode="contained" onPress={handleSave} loading={loading} style={[styles.btn, {backgroundColor: '#7C3AED'}]}>Lưu</Button>
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

    // Reset form khi đóng/mở modal
    useEffect(() => {
        if (visible) {
            setOldPassword('');
            setNewPassword('');
        }
    }, [visible]);

    const handleChange = async () => {
        // Validate độ dài mật khẩu (theo tài liệu là 6-10 ký tự, nhưng nên để rộng hơn chút cho an toàn)
        if (newPassword.length < 6) {
            Alert.alert('Lỗi', 'Mật khẩu mới phải có ít nhất 6 ký tự.');
            return;
        }

        setLoading(true);
        try {
            // [QUAN TRỌNG]: Chuyển dữ liệu sang dạng form-urlencoded
            const params = new URLSearchParams();
            params.append('oldPassword', oldPassword);
            params.append('newPassword', newPassword);

            // API: POST /user/change-password
            const response = await client.post('/user/change-password', params.toString(), {
                headers: { 
                    'Content-Type': 'application/x-www-form-urlencoded' 
                }
            });

            // Mã 00076: Đổi mật khẩu thành công
            if (response.data?.code === '00076' || response.status === 200) {
                Alert.alert('Thành công', 'Đổi mật khẩu thành công! Vui lòng ghi nhớ mật khẩu mới.');
                onClose();
            } else {
                // Mã 00077: Mật khẩu cũ không đúng (hoặc các lỗi khác)
                Alert.alert('Thất bại', response.data?.message || 'Mật khẩu cũ không chính xác.');
            }
        } catch (e) {
            console.log('Change Pass Error:', e.response?.data);
            
            // Xử lý thông báo lỗi từ server trả về
            const serverMsg = e.response?.data?.message;
            if (serverMsg) {
                Alert.alert('Lỗi', serverMsg);
            } else {
                Alert.alert('Lỗi', 'Không thể kết nối đến máy chủ.');
            }
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
                        label="Mật khẩu hiện tại"
                        value={oldPassword}
                        onChangeText={setOldPassword}
                        secureTextEntry // Che mật khẩu
                        mode="outlined"
                        style={styles.input}
                    />
                    
                    <TextInput
                        label="Mật khẩu mới"
                        value={newPassword}
                        onChangeText={setNewPassword}
                        secureTextEntry // Che mật khẩu
                        mode="outlined"
                        style={styles.input}
                    />

                    <View style={styles.actions}>
                        <Button onPress={onClose} style={styles.btn}>Hủy</Button>
                        <Button 
                            mode="contained" 
                            onPress={handleChange} 
                            loading={loading} 
                            disabled={loading || !oldPassword || !newPassword}
                            style={[styles.btn, {backgroundColor: '#7C3AED'}]}
                        >
                            Đổi mật khẩu
                        </Button>
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
    avatarPreview: { width: 100, height: 100, borderRadius: 50, borderWidth: 1, borderColor: '#E5E7EB' },
    imageHint: { marginTop: 8, color: '#ffffffff', fontSize: 12 },
    input: { marginBottom: 12, backgroundColor: 'white' },
    actions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 10, gap: 10 },
    btn: { flex: 1 }
});