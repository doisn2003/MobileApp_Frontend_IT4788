import * as SecureStore from 'expo-secure-store';

const FCM_TOKEN_KEY = 'fcmToken';
const FCM_TOKEN_TIMESTAMP_KEY = 'fcmTokenTimestamp';

/**
 * Lưu FCM Token vào SecureStore
 */
export async function saveFCMToken(token) {
    try {
        if (token) {
            await SecureStore.setItemAsync(FCM_TOKEN_KEY, token);
            await SecureStore.setItemAsync(FCM_TOKEN_TIMESTAMP_KEY, Date.now().toString());
            console.log('✅ FCM Token saved to SecureStore');
        }
    } catch (error) {
        console.error('❌ Error saving FCM token:', error);
    }
}

/**
 * Lấy FCM Token từ SecureStore
 */
export async function getFCMTokenFromStorage() {
    try {
        const token = await SecureStore.getItemAsync(FCM_TOKEN_KEY);
        return token;
    } catch (error) {
        console.error('❌ Error reading FCM token:', error);
        return null;
    }
}

/**
 * Xóa FCM Token khỏi SecureStore (khi logout)
 */
export async function deleteFCMTokenFromStorage() {
    try {
        await SecureStore.deleteItemAsync(FCM_TOKEN_KEY);
        await SecureStore.deleteItemAsync(FCM_TOKEN_TIMESTAMP_KEY);
        console.log('✅ FCM Token removed from SecureStore');
    } catch (error) {
        console.error('❌ Error deleting FCM token:', error);
    }
}

/**
 * Kiểm tra xem token có cần refresh không (sau 30 ngày)
 */
export async function shouldRefreshToken() {
    try {
        const timestamp = await SecureStore.getItemAsync(FCM_TOKEN_TIMESTAMP_KEY);
        if (!timestamp) return true;

        const daysSinceUpdate = (Date.now() - parseInt(timestamp)) / (1000 * 60 * 60 * 24);
        return daysSinceUpdate > 30;
    } catch (error) {
        console.error('❌ Error checking token age:', error);
        return true;
    }
}