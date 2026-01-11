import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { getPendingActions, markActionSynced, clearSyncedActions } from '../services/offline';
import client from '../api/client';

export const NetworkContext = createContext();

export const NetworkProvider = ({ children }) => {
    const [isConnected, setIsConnected] = useState(true);
    const [wasOffline, setWasOffline] = useState(false); // Đã từng offline và cần sync
    const [isSyncing, setIsSyncing] = useState(false);
    const [pendingCount, setPendingCount] = useState(0);

    useEffect(() => {
        const unsubscribe = NetInfo.addEventListener(state => {
            const connected = state.isConnected && state.isInternetReachable;
            
            if (!connected && isConnected) {
                // Vừa mất mạng
                setWasOffline(true);
            }
            
            setIsConnected(connected);
        });

        // Check pending actions count
        checkPendingActions();

        return () => unsubscribe();
    }, [isConnected]);

    const checkPendingActions = async () => {
        const actions = await getPendingActions();
        setPendingCount(actions.length);
        if (actions.length > 0) {
            setWasOffline(true);
        }
    };

    // Hàm sync tất cả pending actions
    const syncPendingActions = useCallback(async () => {
        if (isSyncing) return { success: false, message: 'Đang đồng bộ...' };
        
        setIsSyncing(true);
        const actions = await getPendingActions();
        
        let successCount = 0;
        let failedActions = [];

        for (const action of actions) {
            try {
                const payload = action.payload ? JSON.parse(action.payload) : null;
                
                switch (action.method) {
                    case 'POST':
                        await client.post(action.endpoint, payload);
                        break;
                    case 'PUT':
                        await client.put(action.endpoint, payload);
                        break;
                    case 'DELETE':
                        await client.delete(action.endpoint, { data: payload });
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
        await checkPendingActions();
        
        setIsSyncing(false);
        setWasOffline(failedActions.length > 0);

        return {
            success: failedActions.length === 0,
            synced: successCount,
            failed: failedActions.length,
            message: failedActions.length === 0 
                ? `Đồng bộ thành công ${successCount} thay đổi!`
                : `Đồng bộ ${successCount}/${actions.length}. ${failedActions.length} lỗi.`
        };
    }, [isSyncing]);

    return (
        <NetworkContext.Provider value={{
            isConnected,
            wasOffline,
            isSyncing,
            pendingCount,
            syncPendingActions,
            checkPendingActions,
            setWasOffline
        }}>
            {children}
        </NetworkContext.Provider>
    );
};

export const useNetwork = () => useContext(NetworkContext);