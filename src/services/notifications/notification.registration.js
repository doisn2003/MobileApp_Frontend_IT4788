import messaging from '@react-native-firebase/messaging';
import client from '../../api/client';

/**
 * Lấy FCM Token từ Firebase
 * @returns {Promise<string|null>} FCM Token hoặc null nếu thất bại
 */
export async function getFCMToken() {
    try {
        // Lấy FCM token
        const fcmToken = await messaging().getToken();
        
        if (fcmToken) {
            console.log('✅ FCM Token obtained:', fcmToken.substring(0, 20) + '...');
            return fcmToken;
        } else {
            console.warn('⚠️ No FCM token available');
            return null;
        }

    } catch (error) {
        console.warn('❌ Error getting FCM token:', error);
        return null;
    }
}

/**
 * Gửi FCM Token lên backend để lưu vào database
 * @param {string} fcmToken - FCM Token cần đăng ký
 * @returns {Promise<boolean>} true nếu thành công
 */
export async function registerFCMTokenWithBackend(fcmToken) {
    try {
        if (!fcmToken) {
            console.warn('⚠️ No FCM token to register');
            return false;
        }

        // Gọi API backend (endpoint đã có trong auth.route.js)
        const response = await client.post('/user/update-fcm-token', {
            fcmToken: fcmToken
        });

        if (response.data.code === '00047') {
            console.log('✅ FCM Token registered with backend');
            return true;
        }

        console.warn('⚠️ Unexpected response:', response.data);
        return false;

    } catch (error) {
        console.warn('❌ Error registering FCM token with backend:', error.response?.data || error.message);
        return false;
    }
}

/**
 * Xóa FCM Token (khi logout)
 * @returns {Promise<boolean>}
 */
export async function deleteFCMTokenFromFirebase() {
    try {
        await messaging().deleteToken();
        console.log('✅ FCM Token deleted from Firebase');
        return true;
    } catch (error) {
        console.warn('❌ Error deleting FCM token:', error);
        return false;
    }
}

/**
 * Đăng ký listener cho việc token refresh
 * Token có thể thay đổi khi:
 * - App được cài đặt lại
 * - User xóa app data
 * - App được restore trên thiết bị mới
 */
export function registerTokenRefreshListener() {
    return messaging().onTokenRefresh(async (newToken) => {
        console.log('🔄 FCM Token refreshed:', newToken.substring(0, 20) + '...');
        
        // Tự động cập nhật token mới lên backend
        await registerFCMTokenWithBackend(newToken);
    });
}