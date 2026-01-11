import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNetwork } from '../contexts/NetworkContext';
import { useNavigation } from '@react-navigation/native';

const OfflineBanner = () => {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation();
    const { 
        isConnected, 
        wasOffline, 
        isSyncing, 
        pendingCount, 
        syncPendingActions,
        setWasOffline 
    } = useNetwork();

    const handleSync = async () => {
        const result = await syncPendingActions();
        
        if (result.success) {
            setWasOffline(false);
            // Navigate về trang chủ
            navigation.reset({
                index: 0,
                routes: [{ name: 'Tủ Lạnh' }],
            });
        } else {
            // Hiện thông báo lỗi nếu cần
            alert(result.message);
        }
    };

    // Không có mạng - Banner xám
    if (!isConnected) {
        return (
            <View style={[styles.banner, styles.offlineBanner, { paddingTop: insets.top + 8 }]}>
                <Text style={styles.offlineText}>
                    📡 Không có kết nối mạng - Đang dùng dữ liệu offline
                </Text>
            </View>
        );
    }

    // Có mạng + có pending actions - Banner xanh
    if (isConnected && wasOffline && pendingCount > 0) {
        return (
            <TouchableOpacity 
                style={[styles.banner, styles.syncBanner, { paddingTop: insets.top + 8 }]}
                onPress={handleSync}
                disabled={isSyncing}
            >
                {isSyncing ? (
                    <View style={styles.syncingRow}>
                        <ActivityIndicator color="white" size="small" />
                        <Text style={styles.syncText}>Đang đồng bộ...</Text>
                    </View>
                ) : (
                    <Text style={styles.syncText}>
                        ✅ Đã có mạng! Nhấn để đồng bộ {pendingCount} thay đổi
                    </Text>
                )}
            </TouchableOpacity>
        );
    }

    return null;
};

const styles = StyleSheet.create({
    banner: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        paddingHorizontal: 16,
        paddingBottom: 12,
        zIndex: 1000,
    },
    offlineBanner: {
        backgroundColor: '#6B7280', // Gray
    },
    syncBanner: {
        backgroundColor: '#10B981', // Green
    },
    offlineText: {
        color: 'white',
        textAlign: 'center',
        fontSize: 13,
        fontWeight: '600',
    },
    syncText: {
        color: 'white',
        textAlign: 'center',
        fontSize: 13,
        fontWeight: '600',
    },
    syncingRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
    },
});

export default OfflineBanner;