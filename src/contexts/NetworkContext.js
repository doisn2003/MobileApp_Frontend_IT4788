import React, { createContext, useState, useEffect, useContext, useCallback, useRef } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { getPendingActions, markActionSynced, clearCache, clearSyncedActions } from '../services/offline';
import onlineClient from '../api/client.online';

// Cấu hình retry
const MAX_RETRY_ATTEMPTS = 2;
const RETRY_DELAY_MS = 2000; // 2 giây giữa các lần retry

export const NetworkContext = createContext();

export const NetworkProvider = ({ children }) => {
    const [isConnected, setIsConnected] = useState(true);
    const [wasOffline, setWasOffline] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);
    const [pendingCount, setPendingCount] = useState(0);
    const [syncResult, setSyncResult] = useState(null);
    
    // Key để force re-render các component khi cần
    const [refreshKey, setRefreshKey] = useState(0);
    
    // Ref để track trạng thái trước đó
    const prevConnectedRef = useRef(true);

    // Hàm trigger refresh - tăng key và navigate về tab đầu tiên
    const triggerRefresh = useCallback(() => {
        console.log('🔄 Triggering app refresh...');
        
        // Tăng refreshKey để các component có thể listen và re-fetch
        setRefreshKey(prev => prev + 1);
        
        // // Navigate về tab đầu tiên (Tủ Lạnh) để trigger re-mount
        // if (navigationRef.isReady()) {
        //     try {
        //         // Reset về tab Tủ Lạnh và reset các nested navigators
        //         navigationRef.reset({
        //             index: 0,
        //             routes: [
        //                 {
        //                     name: 'Tủ Lạnh',
        //                 },
        //             ],
        //         });
        //         console.log('✅ Navigation reset to Tủ Lạnh');
        //     } catch (error) {
        //         console.log('⚠️ Navigation reset failed, trying navigate:', error.message);
        //         // Fallback: chỉ navigate về tab đầu tiên
        //         try {
        //             navigationRef.navigate('Tủ Lạnh');
        //         } catch (e) {
        //             console.log('⚠️ Navigate also failed:', e.message);
        //         }
        //     }
        // }
    }, []);

    // Hàm delay
    const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    // Hàm thực hiện sync một action với retry
    const syncActionWithRetry = async (action, attemptNumber = 1) => {
        const { id, method, endpoint, payload } = action;
        const parsedPayload = payload ? JSON.parse(payload) : {};

        try {
            console.log(`🔄 [Attempt ${attemptNumber}/${MAX_RETRY_ATTEMPTS + 1}] Syncing ${method} ${endpoint}`);
            
            switch (method) {
                case 'POST':
                    await onlineClient.post(endpoint, parsedPayload);
                    break;
                case 'PUT':
                    await onlineClient.put(endpoint, parsedPayload);
                    break;
                case 'DELETE':
                    await onlineClient.delete(endpoint, { data: parsedPayload });
                    break;
                case 'PATCH':
                    await onlineClient.patch(endpoint, parsedPayload);
                    break;
                default:
                    throw new Error(`Unknown method: ${method}`);
            }

            await markActionSynced(id);
            console.log(`✅ Synced: ${method} ${endpoint}`);
            return { success: true, action };
            
        } catch (error) {
            console.log(`❌ [Attempt ${attemptNumber}] Failed: ${method} ${endpoint}`, error.message);
            
            // Nếu còn lần retry
            if (attemptNumber <= MAX_RETRY_ATTEMPTS) {
                console.log(`⏳ Waiting ${RETRY_DELAY_MS}ms before retry...`);
                await delay(RETRY_DELAY_MS);
                return await syncActionWithRetry(action, attemptNumber + 1);
            }
            
            // Hết lần retry
            return { 
                success: false, 
                action, 
                error: error.response?.data?.message || error.message 
            };
        }
    };

    // Hàm sync tất cả pending actions
    const syncPendingActions = useCallback(async () => {
        if (isSyncing) return;
        
        const actions = await getPendingActions();
        if (actions.length === 0) {
            console.log('📭 No pending actions to sync');
            return;
        }
        
        setIsSyncing(true);
        setSyncResult(null);
        
        let successCount = 0;
        let failedActions = [];

        console.log(`🚀 Starting sync of ${actions.length} actions...`);

        for (const action of actions) {
            const result = await syncActionWithRetry(action);
            
            if (result.success) {
                successCount++;
            } else {
                failedActions.push({
                    ...result.action,
                    errorMessage: result.error
                });
            }
        }

        // Xóa các actions đã sync thành công
        await clearSyncedActions();

        // Xử lý kết quả
        if (failedActions.length === 0) {
            // Tất cả thành công
            console.log(`✅ All ${successCount} actions synced successfully`);
            setSyncResult({
                success: true,
                message: `Đồng bộ thành công ${successCount} thay đổi`
            });
            
            // Xóa cache cũ để force lấy data mới
            await clearCache();
            
            // Trigger refresh để các screen re-fetch
            triggerRefresh();
        } else {
            // Có actions thất bại
            console.log(`⚠️ Sync completed: ${successCount} success, ${failedActions.length} failed`);
            
            // Log chi tiết các actions thất bại
            failedActions.forEach((action, index) => {
                console.log(`   ${index + 1}. ${action.method} ${action.endpoint}: ${action.errorMessage}`);
            });
            
            // Thông báo lỗi
            setSyncResult({
                success: false,
                message: `Đồng bộ thất bại ${failedActions.length} thay đổi sau ${MAX_RETRY_ATTEMPTS + 1} lần thử. Dữ liệu offline đã bị xóa.`,
                failedCount: failedActions.length,
                successCount: successCount
            });
            
            // Xóa toàn bộ cache và pending actions vì đã thất bại
            console.log('🗑️ Clearing all cache and failed actions...');
            await clearCache();
            await clearActions(); // Xóa luôn các actions thất bại
        }

        setIsSyncing(false);
        await checkPendingActions();
        
        // Tự động ẩn syncResult sau 5 giây
        setTimeout(() => {
            setSyncResult(null);
        }, 5000);
        
    }, [isSyncing, triggerRefresh]);

    const checkPendingActions = async () => {
        try {
            const actions = await getPendingActions();
            setPendingCount(actions.length);
            if (actions.length > 0) {
                setWasOffline(true);
            }
        } catch (error) {
            console.error('Error checking pending actions:', error);
        }
    };

    useEffect(() => {
        const unsubscribe = NetInfo.addEventListener(state => {
            const connected = state.isConnected && state.isInternetReachable;        
            const wasDisconnected = !prevConnectedRef.current;
            
            // Detect: vừa offline -> online
            if (wasDisconnected && connected) {
                console.log('🌐 Network restored - Auto syncing...');
                syncPendingActions();
            }
            
            // Detect: online -> offline
            if (!connected && prevConnectedRef.current) {
                setWasOffline(true);
                setSyncResult(null);
            }
            
            prevConnectedRef.current = connected;
            setIsConnected(connected);
        });

        checkPendingActions();

        return () => unsubscribe();
    }, [syncPendingActions]);

    return (
        <NetworkContext.Provider value={{
            isConnected,
            wasOffline,
            isSyncing,
            pendingCount,
            syncResult,
            refreshKey,
            syncPendingActions,
            checkPendingActions,
            setWasOffline,
            triggerRefresh
        }}>
            {children}
        </NetworkContext.Provider>
    );
};

export const useNetwork = () => useContext(NetworkContext);