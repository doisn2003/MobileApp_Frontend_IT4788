// App.js
import React, { useEffect } from 'react';
import { Provider as PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context'; // <--- IMPORT MỚI
import { AuthProvider } from './src/contexts/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';
import { registerNotificationListeners } from './src/services/notifications';

export default function App() {
  useEffect(() => {
    // Đăng ký notification listeners khi app khởi động
    const cleanup = registerNotificationListeners();

    // Cleanup khi app unmount
    return cleanup;
  }, []);

  return (
    <SafeAreaProvider> 
      <PaperProvider>
        <AuthProvider>
          <AppNavigator />
        </AuthProvider>
      </PaperProvider>
    </SafeAreaProvider>
  );
}