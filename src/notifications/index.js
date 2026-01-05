import notifee, { EventType } from '@notifee/react-native';
import messaging from '@react-native-firebase/messaging';
import { requestNotificationPermissions, checkNotificationPermissions } from './notification.permissions';
import { 
    getFCMToken, 
    registerFCMTokenWithBackend, 
    deleteFCMTokenFromFirebase,
    registerTokenRefreshListener 
} from './notification.registration';
import { 
    saveFCMToken, 
    getFCMTokenFromStorage, 
    deleteFCMTokenFromStorage,
    shouldRefreshToken
} from './notification.storage';
import { 
    handleNotificationOpen, 
    handleForegroundNotification 
} from './notification.handlers';

/**
 * Khởi tạo toàn bộ hệ thống notification
 * Gọi hàm này sau khi user login hoặc khi app khởi động (nếu đã login)
 */
export async function initializeNotifications() {
    try {
        console.log('🔔 Initializing Firebase notification system...');

        // Bước 1: Kiểm tra/xin quyền
        const hasPermission = await requestNotificationPermissions();
        if (!hasPermission) {
            console.warn('⚠️ Notification permission denied, skipping initialization');
            return false;
        }

        // Bước 2: Lấy FCM token
        const fcmToken = await getFCMToken();
        if (!fcmToken) {
            console.warn('❌ Failed to get FCM token');
            return false;
        }

        // Bước 3: Kiểm tra token cũ
        const oldToken = await getFCMTokenFromStorage();
        const needRefresh = await shouldRefreshToken();

        if (oldToken === fcmToken && !needRefresh) {
            console.log('✅ FCM Token unchanged and still fresh, skipping backend update');
            return true;
        }

        // Bước 4: Đăng ký token với backend
        const registered = await registerFCMTokenWithBackend(fcmToken);
        if (!registered) {
            console.warn('⚠️ Failed to register token with backend. User might have not signed in yet!');
            return false;
        }

        // Bước 5: Lưu token vào storage
        await saveFCMToken(fcmToken);
        console.log('✅ Firebase notification system initialized successfully');
        return true;

    } catch (error) {
        console.warn('❌ Error initializing notifications:', error);
        return false;
    }
}

/**
 * Đăng ký các listeners cho notification events
 * Gọi trong App.js để lắng nghe sự kiện
 * @returns {Function} Cleanup function
 */
export function registerNotificationListeners() {
    console.log('📡 Registering notification listeners...');

    // Listener 1: FCM - App opened from background
    messaging().onNotificationOpenedApp(remoteMessage => {
        console.log('📱 App opened from background by FCM notification');
        handleNotificationOpen(remoteMessage);
    });

    // Listener 2: FCM - App opened from killed state
    messaging()
        .getInitialNotification()
        .then(remoteMessage => {
            if (remoteMessage) {
                console.log('📱 App opened from killed state by FCM notification');
                handleNotificationOpen(remoteMessage);
            }
        });

    // Listener 3: FCM - Foreground message
    const unsubscribeForeground = messaging().onMessage(handleForegroundNotification);

    // Listener 4: FCM - Token refresh
    const unsubscribeTokenRefresh = registerTokenRefreshListener();

    // THÊM LISTENER 5: Notifee - User tap notification
    const unsubscribeNotifee = notifee.onForegroundEvent(({ type, detail }) => {
        if (type === EventType.PRESS) {
            console.log('📱 User pressed Notifee notification:', detail.notification);
            // Reconstruct remoteMessage format
            const remoteMessage = {
                data: detail.notification?.data || {},
                notification: {
                    title: detail.notification?.title,
                    body: detail.notification?.body,
                }
            };
            handleNotificationOpen(remoteMessage);
        }
    });

    console.log('✅ Notification listeners registered');

    // Cleanup function
    return () => {
        unsubscribeForeground();
        unsubscribeTokenRefresh();
        unsubscribeNotifee();
        console.log('🧹 Notification listeners cleaned up');
    };
}

/**
 * Xóa FCM token khi logout
 */
export async function cleanupNotifications() {
    try {
        console.log('🧹 Cleaning up notifications...');
        
        // Xóa token từ Firebase
        await deleteFCMTokenFromFirebase();
        
        // Xóa token từ local storage
        await deleteFCMTokenFromStorage();
        
        console.log('✅ Notifications cleaned up');
        return true;
    } catch (error) {
        console.warn('❌ Error cleaning up notifications:', error);
        return false;
    }
}

// Export các hàm riêng lẻ
export { getFCMToken, saveFCMToken, checkNotificationPermissions };