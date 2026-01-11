import messaging from '@react-native-firebase/messaging';
import notifee, { AndroidImportance, AuthorizationStatus } from '@notifee/react-native';
import * as Device from 'expo-device';
import { Platform, Alert, Linking } from 'react-native';

/**
 * Yêu cầu quyền nhận thông báo từ người dùng
 * XIN QUYỀN CHO CẢ FCM VÀ NOTIFEE
 * @returns {Promise<boolean>} true nếu được cấp quyền
 */
export async function requestNotificationPermissions() {
    try {
        // Kiểm tra xem có phải thiết bị thật không
        if (!Device.isDevice) {
            console.warn('⚠️ Push notifications chỉ hoạt động trên thiết bị thật');
            // return false;
        }

        // BƯỚC 1: Xin quyền cho FCM (remote notifications)
        const fcmAuthStatus = await messaging().requestPermission();
        const fcmEnabled =
            fcmAuthStatus === messaging.AuthorizationStatus.AUTHORIZED ||
            fcmAuthStatus === messaging.AuthorizationStatus.PROVISIONAL;

        console.log('📱 FCM permission status:', fcmAuthStatus);

        // BƯỚC 2: Xin quyền cho Notifee (local notifications)
        const notifeeSettings = await notifee.requestPermission();
        const notifeeEnabled = 
            notifeeSettings.authorizationStatus === AuthorizationStatus.AUTHORIZED ||
            notifeeSettings.authorizationStatus === AuthorizationStatus.PROVISIONAL;

        console.log('📱 Notifee permission status:', notifeeSettings.authorizationStatus);

        // Kiểm tra cả hai quyền
        if (!fcmEnabled || !notifeeEnabled) {
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

        console.log('✅ Notification permissions granted (FCM + Notifee)');
        return true;

    } catch (error) {
        console.warn('❌ Error requesting notification permissions:', error);
        return false;
    }
}

/**
 * Kiểm tra quyền hiện tại (không yêu cầu)
 */
export async function checkNotificationPermissions() {
    try {
        // Kiểm tra FCM
        const fcmAuthStatus = await messaging().hasPermission();
        const fcmEnabled =
            fcmAuthStatus === messaging.AuthorizationStatus.AUTHORIZED ||
            fcmAuthStatus === messaging.AuthorizationStatus.PROVISIONAL;

        // Kiểm tra Notifee
        const notifeeSettings = await notifee.getNotificationSettings();
        const notifeeEnabled =
            notifeeSettings.authorizationStatus === AuthorizationStatus.AUTHORIZED ||
            notifeeSettings.authorizationStatus === AuthorizationStatus.PROVISIONAL;

        console.log('📱 Current permissions - FCM:', fcmEnabled, 'Notifee:', notifeeEnabled);
        return fcmEnabled && notifeeEnabled;

    } catch (error) {
        console.warn('❌ Error checking permissions:', error);
        return false;
    }
}

/**
 * Tạo notification channel mặc định cho Android
 * GỌI HÀM NÀY TRƯỚC KHI HIỂN THỊ NOTIFICATION
 */
export async function createDefaultChannel() {
    if (Platform.OS === 'android') {
        try {
            const channelId = await notifee.createChannel({
                id: 'default',
                name: 'Thông báo mặc định',
                importance: AndroidImportance.HIGH,
                sound: 'default',
                vibration: true,
                vibrationPattern: [300, 500],
            });
            console.log('✅ Android notification channel created:', channelId);
            return channelId;
        } catch (error) {
            console.warn('❌ Error creating channel:', error);
            return 'default';
        }
    }
    return 'default';
}