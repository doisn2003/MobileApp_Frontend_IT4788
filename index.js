import { registerRootComponent } from 'expo';
import messaging from '@react-native-firebase/messaging';
import { handleBackgroundNotification } from './src/notifications/notification.handlers';
import App from './App';

// Đăng ký background message handler
// PHẢI đặt NGOÀI component, TRƯỚC khi registerRootComponent
messaging().setBackgroundMessageHandler(handleBackgroundNotification);

// Register the main component
registerRootComponent(App);