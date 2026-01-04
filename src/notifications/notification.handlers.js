import messaging from '@react-native-firebase/messaging';
import { navigate } from '../navigation/NavigationRef';
import { Alert } from 'react-native';

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

        console.log('📱 Notification caused app to open:', remoteMessage);

        const { data, notification } = remoteMessage;

        // PLACEHOLDER: Xử lý navigation dựa trên data
        // Backend gửi data từ notification.service.js
        
        if (data?.type === 'new_member') {
            // Từ group.controller.js - addMember()
            console.log('→ Navigate to GroupMembers');
            navigate('GroupMembers', { groupId: data.groupId });
        } 
        else if (data?.type === 'removed_from_group') {
            // Từ group.controller.js - removeMember()
            console.log('→ Navigate to Home (removed from group)');
            navigate('Home');
            
            // TODO: Có thể hiển thị alert
            setTimeout(() => {
                Alert.alert('Thông báo', notification?.body || 'Bạn đã bị xóa khỏi nhóm');
            }, 500);
        }
        else if (data?.type === 'fridge_expiry') {
            // Từ fridge.controller.js - cron job
            console.log('→ Navigate to Fridge (item expiring)');
            navigate('Fridge');
        }
        else {
            // Default: Navigate về Home
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
export function handleForegroundNotification(remoteMessage) {
    try {
        console.log('📬 Notification received in foreground:', remoteMessage);

        const { notification, data } = remoteMessage;

        // PLACEHOLDER: Có thể hiển thị custom notification UI
        // Vì mặc định FCM không hiển thị notification khi app foreground
        
        Alert.alert(
            notification?.title || 'Thông báo mới',
            notification?.body || 'Bạn có một thông báo mới',
            [
                { text: 'Đóng', style: 'cancel' },
                {
                    text: 'Xem',
                    onPress: () => handleNotificationOpen(remoteMessage)
                }
            ]
        );

        // TODO: Có thể thay bằng custom toast/modal đẹp hơn
        // TODO: Hoặc cập nhật badge count, refresh data

    } catch (error) {
        console.error('❌ Error handling foreground notification:', error);
    }
}

/**
 * Xử lý khi nhận notification trong background
 * Hàm này PHẢI được đăng ký NGOÀI component (trong index.js hoặc App.js top level)
 * @param {object} remoteMessage - Remote message từ FCM
 */
export async function handleBackgroundNotification(remoteMessage) {
    console.log('📦 Background notification received:', remoteMessage);
    
    // TODO: Có thể thực hiện tasks như:
    // - Cập nhật local database
    // - Tải dữ liệu mới
    // - Hiển thị local notification
    // - Update badge
    
    // LƯU Ý: Hàm này chạy trong background, không có access đến UI
    // Không dùng Alert, Toast, hoặc navigation ở đây
}