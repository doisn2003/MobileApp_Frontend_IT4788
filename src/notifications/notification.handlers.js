import messaging from '@react-native-firebase/messaging';
import notifee, { AndroidImportance } from '@notifee/react-native';
import { navigate } from '../navigation/NavigationRef';
import { Platform } from 'react-native';

// Helper: hiển thị local notification bằng Notifee
async function displayLocalNotification(remoteMessage) {
    try {
        const { notification, data } = remoteMessage || {};
        const title = notification?.title || data?.title || null;
        const body = notification?.body || data?.body || null;

        if (!title && !body) {
            console.log('⚠️ No title or body to display in notification');
            return null;
        }
        console.log('🔔 Preparing to display notification:', { title, body });

        // QUAN TRỌNG: Đảm bảo channel tồn tại trước khi display
        let channelId = 'default';
        if (Platform.OS === 'android') {
            channelId = await notifee.createChannel({
                id: 'default',
                name: 'Thông báo mặc định',
                importance: AndroidImportance.HIGH,
                sound: 'default',
                vibration: true,
                vibrationPattern: [300, 500],
            });
            console.log('✅ Channel created/verified:', channelId);
        }

        // Hiển thị system notification
        const notificationId = await notifee.displayNotification({
            title,
            body,
            android: {
                channelId,
                importance: AndroidImportance.HIGH,
                pressAction: {
                    id: 'default',
                },
                // Thêm các thuộc tính hiển thị
                smallIcon: 'ic_launcher', // Dùng icon mặc định
                sound: 'default',
                vibrationPattern: [300, 500],
                showTimestamp: true,
                timestamp: Date.now(),
            },
            ios: {
                sound: 'default',
            },
            data: data || {},
        });

        console.log('✅ Notification displayed with ID:', notificationId);
        return notificationId;

    } catch (error) {
        console.error('❌ Error displaying notification:', error);
        throw error;
    }
}

/**
 * Xử lý khi người dùng nhấn vào notification
 * Hoạt động khi app đang: background hoặc killed
 * @param {object} remoteMessage - Remote message từ FCM
 */
export function handleNotificationOpen(remoteMessage) {
    try {
        if (!remoteMessage) {
            console.log('📱 App opened without notification');
            return;
        }
        const { data, notification } = remoteMessage;
        console.log('📱 Notification caused app to open:', remoteMessage);

        // PLACEHOLDER: Xử lý navigation dựa trên data
        if (data?.type === 'new_member') {
            console.log('→ Navigate to GroupMembers');
            navigate('GroupMembers', { groupId: data.groupId });
        } 
        else if (data?.type === 'removed_from_group') {
            console.log('→ Navigate to Home (removed from group)');
            navigate('Home');
        }
        else if (data?.type === 'fridge_expiry') {
            console.log('→ Navigate to Fridge (item expiring)');
            navigate('Fridge');
        }
        else {
            console.log('→ Navigate to Home (default)');
            navigate('Home');
        }

    } catch (error) {
        console.error('❌ Error handling notification open:', error);
    }
}

/**
 * Xử lý khi nhận notification trong khi app đang foreground
 * @param {object} remoteMessage - Remote message từ FCM
 */
export async function handleForegroundNotification(remoteMessage) {
    try {
        console.log('📬 Notification received in foreground:', remoteMessage);
        await displayLocalNotification(remoteMessage);
    } catch (error) {
        console.error('❌ Error handling foreground notification:', error);
    }
}

/**
 * Xử lý khi nhận notification trong background
 * Hàm này PHẢI được đăng ký NGOÀI component (trong index.js)
 * @param {object} remoteMessage - Remote message từ FCM
 */
export async function handleBackgroundNotification(remoteMessage) {
    console.log('📦 Background notification received:', remoteMessage);
    try {
        // ✅ Chặn duplicate: có notification payload => system đã hiện
        if (remoteMessage?.notification?.title || remoteMessage?.notification?.body) {
        console.log('⏭️ Skip Notifee in background (system notification already shown).');
        return;
        }

        // ✅ Data-only => tự hiện bằng Notifee
        await displayLocalNotification(remoteMessage);
    } catch (error) {
        console.error('❌ Error handling background notification:', error);
    }
}