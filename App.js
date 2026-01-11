// App.js
import React, { useEffect } from 'react';
import { Provider as PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context'; // <--- IMPORT MỚI
import { AuthProvider } from './src/contexts/AuthContext';
import { NetworkProvider } from './src/contexts/NetworkContext';
import AppNavigator from './src/navigation/AppNavigator';
import { registerNotificationListeners } from './src/services/notifications';
import { initDatabase } from './src/services/offline'; // THÊM MỚI

export default function App() {
  useEffect(() => {
    // Khởi tạo offline database
    initDatabase()

    // Đăng ký notification listeners khi app khởi động
    const cleanup = registerNotificationListeners();

    // Cleanup khi app unmount
    return cleanup;
  }, []);

  return (
    <SafeAreaProvider> 
      <PaperProvider>
        <NetworkProvider>
          <AuthProvider>
            <AppNavigator />
          </AuthProvider>
        </NetworkProvider>
      </PaperProvider>
    </SafeAreaProvider>
  );
}