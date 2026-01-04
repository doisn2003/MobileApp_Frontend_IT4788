import messaging from '@react-native-firebase/messaging';
import * as Device from 'expo-device';
import { Platform, Alert, Linking } from 'react-native';

/**
 * Yêu cầu quyền nhận thông báo từ người dùng
 * @returns {Promise<boolean>} true nếu được cấp quyền
 */
export async function requestNotificationPermissions() {
    try {
        // Kiểm tra xem có phải thiết bị thật không
        if (!Device.isDevice) {
            console.warn('⚠️ Push notifications chỉ hoạt động trên thiết bị thật');
            // return false;
        }

        // Kiểm tra trạng thái quyền hiện tại
        const authStatus = await messaging().requestPermission();
        const enabled =
            authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
            authStatus === messaging.AuthorizationStatus.PROVISIONAL;

        if (!enabled) {
            Alert.alert(
                'Cần cấp quyền thông báo',
                'Vui lòng bật quyền thông báo trong Cài đặt để nhận các cập nhật quan trọng',
                [
                    { text: 'Hủy', style: 'cancel' },
                    {
                        text: 'Mở Cài đặt',
                        onPress: () => {
                            if (Platform.OS === 'ios') {
                                Linking.openURL('app-settings:');
                            } else {
                                Linking.openSettings();
                            }
                        }
                    }
                ]
            );
            return false;
        }

        console.log('✅ Notification permission granted:', authStatus);
        return true;

    } catch (error) {
        console.error('❌ Error requesting notification permissions:', error);
        return false;
    }
}

/**
 * Kiểm tra quyền hiện tại (không yêu cầu)
 */
export async function checkNotificationPermissions() {
    try {
        const authStatus = await messaging().hasPermission();
        const enabled =
            authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
            authStatus === messaging.AuthorizationStatus.PROVISIONAL;

        return enabled;
    } catch (error) {
        console.error('❌ Error checking permissions:', error);
        return false;
    }
}