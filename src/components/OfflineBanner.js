import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNetwork } from '../contexts/NetworkContext';

const OfflineBanner = () => {
    const insets = useSafeAreaInsets();
    const { 
        isConnected, 
        wasOffline, 
        isSyncing, 
        pendingCount, 
        syncResult 
    } = useNetwork();

    // Không có mạng - Banner xám
    if (!isConnected) {
        return (
            <View style={[styles.banner, styles.offlineBanner, { paddingTop: insets.top + 8 }]}>
                <Text style={styles.bannerText}>
                    📡 Không có kết nối mạng - Đang dùng dữ liệu offline
                    {pendingCount > 0 && ` (${pendingCount} thay đổi chờ đồng bộ)`}
                </Text>
            </View>
        );
    }

    // Đang đồng bộ - Banner vàng
    if (isSyncing) {
        return (
            <View style={[styles.banner, styles.syncingBanner, { paddingTop: insets.top + 8 }]}>
                <View style={styles.row}>
                    <ActivityIndicator color="white" size="small" />
                    <Text style={styles.bannerText}>
                        Đang đồng bộ {pendingCount} thay đổi...
                    </Text>
                </View>
            </View>
        );
    }

    // Vừa sync xong - Hiển thị kết quả
    if (syncResult) {
        const isSuccess = syncResult.success;
        return (
            <View style={[
                styles.banner, 
                isSuccess ? styles.successBanner : styles.errorBanner, 
                { paddingTop: insets.top + 8 }
            ]}>
                <Text style={styles.bannerText}>
                    {isSuccess ? '✅' : '⚠️'} {syncResult.message}
                </Text>
            </View>
        );
    }

    // Có mạng + có pending (chờ auto-sync) - Banner xanh dương
    if (isConnected && wasOffline && pendingCount > 0) {
        return (
            <View style={[styles.banner, styles.pendingBanner, { paddingTop: insets.top + 8 }]}>
                <Text style={styles.bannerText}>
                    🔄 Đã có mạng! Đang chuẩn bị đồng bộ {pendingCount} thay đổi...
                </Text>
            </View>
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
    syncingBanner: {
        backgroundColor: '#F59E0B', // Amber/Yellow
    },
    pendingBanner: {
        backgroundColor: '#3B82F6', // Blue
    },
    successBanner: {
        backgroundColor: '#10B981', // Green
    },
    errorBanner: {
        backgroundColor: '#EF4444', // Red
    },
    bannerText: {
        color: 'white',
        textAlign: 'center',
        fontSize: 13,
        fontWeight: '600',
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
    },
});

export default OfflineBanner;