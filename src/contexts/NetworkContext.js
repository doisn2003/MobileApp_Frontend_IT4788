import React, { createContext, useState, useEffect, useContext, useCallback, useRef } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { getPendingActions, markActionSynced, clearCache, clearSyncedActions } from '../services/offline';
import onlineClient from '../api/client.online';
import { navigationRef } from '../navigation/NavigationRef';

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

    // Hàm sync tất cả pending actions
    const syncPendingActions = useCallback(async () => {
        if (isSyncing) return { success: false, message: 'Đang đồng bộ...' };
        
        const actions = await getPendingActions();
        if (actions.length === 0) {
            setWasOffline(false);
            return { success: true, synced: 0, message: 'Không có gì để đồng bộ' };
        }
        
        setIsSyncing(true);
        setSyncResult(null);
        
        let successCount = 0;
        let failedActions = [];

        for (const action of actions) {
            try {
                const payload = action.payload ? JSON.parse(action.payload) : null;
                
                switch (action.method) {
                    case 'POST':
                        await onlineClient.post(action.endpoint, payload);
                        break;
                    case 'PUT':
                        await onlineClient.put(action.endpoint, payload);
                        break;
                    case 'DELETE':
                        await onlineClient.delete(action.endpoint, { data: payload });
                        break;
                    case 'PATCH':
                        await onlineClient.patch(action.endpoint, payload);
                        break;
                }
                
                await markActionSynced(action.id);
                successCount++;
            } catch (error) {
                console.error(`Sync failed for action ${action.id}:`, error);
                failedActions.push(action);
            }
        }

        await clearSyncedActions();
        await clearCache(); // Xóa cache cũ để force lấy data mới
        await checkPendingActions();
        
        const result = {
            success: failedActions.length === 0,
            synced: successCount,
            failed: failedActions.length,
            message: failedActions.length === 0 
                ? `Đồng bộ thành công ${successCount} thay đổi!`
                : `Đồng bộ ${successCount}/${actions.length}. ${failedActions.length} lỗi.`
        };
        
        setSyncResult(result);
        setIsSyncing(false);

        // Trigger refresh sau khi sync thành công
        if (result.success || successCount > 0) {
            // Delay một chút để UI cập nhật trước
            setTimeout(() => {
                triggerRefresh();
            }, 500);
        }
        
        // Nếu thành công hoàn toàn, ẩn banner sau 3 giây
        if (result.success) {
            setTimeout(() => {
                setWasOffline(false);
                setSyncResult(null);
            }, 3000);
        }

        return result;
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
            const isNowConnected = connected;
            
            if (wasDisconnected && isNowConnected) {
                console.log('🌐 Network restored - Auto syncing...');
                syncPendingActions();
            }
            
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