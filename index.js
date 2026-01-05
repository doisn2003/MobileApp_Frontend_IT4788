import { registerRootComponent } from 'expo';
// import messaging from '@react-native-firebase/messaging';
// import notifee, { AndroidImportance } from '@notifee/react-native';
// import { handleBackgroundNotification } from './src/notifications/notification.handlers';
import App from './App';
import { Platform } from 'react-native';

// Tạo default channel cho Android (một lần ở entry)
async function ensureDefaultChannel() {
  //   if (Platform.OS === 'android') {
  //     const channelId = await notifee.createChannel({
  //       id: 'default',
  //       name: 'Thông báo mặc định',
  //       importance: AndroidImportance.HIGH,
  //       sound: 'default',
  //       vibration: true,
  //     });
  //     console.log('✅ Default channel ensured:', channelId);
  //   }
}

// Background handler
// messaging().setBackgroundMessageHandler(async (remoteMessage) => {
//   console.log('⚡ Background message handler triggered');
//   await ensureDefaultChannel();
//   await handleBackgroundNotification(remoteMessage);
// });

// Khởi tạo channel ngay khi app start
ensureDefaultChannel();

// Đăng ký app
registerRootComponent(App);