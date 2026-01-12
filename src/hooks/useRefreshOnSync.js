import { useEffect, useRef } from 'react';
import { useNetwork } from '../contexts/NetworkContext';

/**
 * Hook để tự động gọi callback khi sync hoàn thành
 * @param {Function} onRefresh - Callback để re-fetch data
 * @param {Array} deps - Dependencies bổ sung (optional)
 */
export function useRefreshOnSync(onRefresh, deps = []) {
    const { refreshKey } = useNetwork();
    const isFirstRender = useRef(true);
    
    useEffect(() => {
        // Bỏ qua lần render đầu tiên (mount)
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }
        
        // Gọi callback khi refreshKey thay đổi
        console.log('🔄 RefreshKey changed, triggering refresh...');
        onRefresh();
    }, [refreshKey, ...deps]);
}