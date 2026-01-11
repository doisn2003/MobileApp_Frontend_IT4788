import client from './client';
import { saveCache, getCache, addToQueue, updateLocalCache } from '../services/offline';
import NetInfo from '@react-native-community/netinfo';

// Danh sách endpoints được cache
const CACHEABLE_ENDPOINTS = [
    '/fridge/',
    '/recipe/',
    '/meal',
    '/shopping/',
    '/user/group/',
    '/food/categories',
    '/food/units',
];

// Helper: Check if endpoint is cacheable
const isCacheable = (endpoint) => {
    return CACHEABLE_ENDPOINTS.some(e => endpoint.startsWith(e));
};

// Helper: Check network status
const checkNetwork = async () => {
    const netState = await NetInfo.fetch();
    return netState.isConnected && netState.isInternetReachable;
};

/**
 * OfflineClient Class
 * Wrapper around axios client với offline support
 * Giữ nguyên interface: offlineClient.get(), offlineClient.post(), etc.
 */
class OfflineClient {
    /**
     * GET request với offline support
     */
    async get(endpoint, config = {}) {
        const isOnline = await checkNetwork();

        if (isOnline) {
            try {
                const response = await client.get(endpoint, config);

                // Cache kết quả nếu endpoint được phép cache
                if (isCacheable(endpoint)) {
                    await saveCache(endpoint, response.data);
                }

                return response;
            } catch (error) {
                // Nếu lỗi mạng, thử lấy từ cache
                if (error.code === 'ECONNABORTED' || !error.response) {
                    const cached = await getCache(endpoint);
                    if (cached) {
                        console.log(`📦 Returning cached data for ${endpoint}`);
                        return { data: cached.data, fromCache: true };
                    }
                }
                throw error;
            }
        } else {
            // Offline: Lấy từ cache
            const cached = await getCache(endpoint);
            if (cached) {
                console.log(`📦 [Offline] Returning cached data for ${endpoint}`);
                return { data: cached.data, fromCache: true };
            }
            throw new Error('Không có kết nối mạng và không có dữ liệu cache');
        }
    }

    /**
     * POST request với offline support
     */
    async post(endpoint, payload, config = {}) {
        const isOnline = await checkNetwork();

        if (isOnline) {
            try {
                const response = await client.post(endpoint, payload, config);
                return response;
            } catch (error) {
                // Nếu lỗi mạng, thêm vào queue action
                if (error.code === 'ECONNABORTED' || !error.response) {
                    // Queue action để sync sau
                    await addToQueue('POST', endpoint, payload);

                    // Optimistic update local cache
                    await this._optimisticCreate(endpoint, payload);

                    return {
                        data: { message: '📦 Đã lưu POST offline, sẽ đồng bộ khi có mạng' },
                        offline: true
                    };
                }
                throw error;
            }
        } else {
            // Offline: thêm vào queue action
            // Queue action để sync sau
            await addToQueue('POST', endpoint, payload);

            // Optimistic update local cache
            await this._optimisticCreate(endpoint, payload);

            return {
                data: { message: '📦 [Offline] Đã lưu POST offline, sẽ đồng bộ khi có mạng' },
                offline: true
            };
        }
    }

    /**
     * PUT request với offline support
     */
    async put(endpoint, payload, config = {}) {
        const isOnline = await checkNetwork();

        if (isOnline) {
            try {
                const response = await client.post(endpoint, payload, config);
                return response;
            } catch (error) {
                // Nếu lỗi mạng, thêm vào queue action
                if (error.code === 'ECONNABORTED' || !error.response) {
                    // Queue action để sync sau
                    await addToQueue('PUT', endpoint, payload);

                    // Optimistic update local cache
                    await this._optimisticUpdate(endpoint, payload);

                    return {
                        data: { message: '📦 Đã lưu PATCH offline, sẽ đồng bộ khi có mạng' },
                        offline: true
                    };
                }
                throw error;                
            }
        } else {
            // Offline: thêm vào queue action
            // Queue action để sync sau
            await addToQueue('PATCH', endpoint, payload);

            // Optimistic update local cache
            await this._optimisticUpdate(endpoint, payload);

            return {
                data: { message: '📦 [Offline] Đã lưu PATCH offline, sẽ đồng bộ khi có mạng' },
                offline: true
            };
        }
    }

    /**
     * DELETE request với offline support
     */
    async delete(endpoint, config = {}) {
        const isOnline = await checkNetwork();

        if (isOnline) {
            try {
                const response = await client.delete(endpoint, config);
                return response;
            } catch (error) {
                // Nếu lỗi mạng, thêm vào queue action
                if (error.code === 'ECONNABORTED' || !error.response) {
                    // Queue action để sync sau
                    await addToQueue('DELETE', endpoint, payload);

                    // Optimistic update local cache
                    await this._optimisticDelete(endpoint, payload);

                    return {
                        data: { message: '📦 Đã lưu DELETE offline, sẽ đồng bộ khi có mạng' },
                        offline: true
                    };
                }
                throw error;                
            }
        } else {
            // Offline: thêm vào queue action
            // Queue action để sync sau
            await addToQueue('DELETE', endpoint, payload);

            // Optimistic update local cache
            await this._optimisticDelete(endpoint, payload);

            return {
                data: { message: '📦 [Offline] Đã lưu DELETE offline, sẽ đồng bộ khi có mạng' },
                offline: true
            };
        }
    }

    /**
     * PATCH request với offline support (tương tự PUT)
     */
    async patch(endpoint, payload, config = {}) {
        const isOnline = await checkNetwork();

        if (isOnline) {
            try {
                const response = await client.patch(endpoint, payload, config);
                return response;
            } catch (error) {
                // Nếu lỗi mạng, thêm vào queue action
                if (error.code === 'ECONNABORTED' || !error.response) {
                    // Queue action để sync sau
                    await addToQueue('PATCH', endpoint, payload);

                    // Optimistic update local cache
                    await this._optimisticUpdate(endpoint, payload);

                    return {
                        data: { message: '📦 Đã lưu PUT offline, sẽ đồng bộ khi có mạng' },
                        offline: true
                    };
                }
                throw error;                
            }
        } else {
            // Offline: thêm vào queue action
            // Queue action để sync sau
            await addToQueue('POST', endpoint, payload);

            // Optimistic update local cache
            await this._optimisticUpdate(endpoint, payload);

            return {
                data: { message: '📦 [Offline] Đã lưu PUT offline, sẽ đồng bộ khi có mạng' },
                offline: true
            };
        }
    }

    // ===================== PRIVATE METHODS =====================

    /**
     * Optimistic Create - Thêm item vào cache local
     */
    async _optimisticCreate(endpoint, payload) {
        if (endpoint === '/fridge/') {
            await updateLocalCache('/fridge/', (data) => {
                const newItem = {
                    _id: `temp_${Date.now()}`,
                    ...payload,
                    createdAt: new Date().toISOString(),
                    foodId: { name: payload.foodName, image: null }
                };
                return {
                    ...data,
                    data: [...(data.data || []), newItem]
                };
            });
        } else if (endpoint === '/recipe/') {
            await updateLocalCache('/recipe/', (data) => {
                const newItem = {
                    _id: `temp_${Date.now()}`,
                    ...payload,
                    createdAt: new Date().toISOString()
                };
                return {
                    ...data,
                    data: [...(data.data || []), newItem]
                };
            });
        } else if (endpoint === '/shopping/') {
            await updateLocalCache('/shopping/', (data) => {
                const newItem = {
                    _id: `temp_${Date.now()}`,
                    ...payload,
                    createdAt: new Date().toISOString()
                };
                return {
                    ...data,
                    data: [...(data.data || []), newItem]
                };
            });
        }
    }

    /**
     * Optimistic Update - Cập nhật item trong cache local
     */
    async _optimisticUpdate(endpoint, payload) {
        if (endpoint === '/fridge/') {
            await updateLocalCache('/fridge/', (data) => {
                return {
                    ...data,
                    data: (data.data || []).map(item =>
                        item._id === payload.itemId
                            ? { ...item, quantity: payload.newQuantity, ...payload }
                            : item
                    )
                };
            });
        } else if (endpoint.startsWith('/recipe/')) {
            const recipeId = endpoint.split('/')[2];
            await updateLocalCache('/recipe/', (data) => {
                return {
                    ...data,
                    data: (data.data || []).map(item =>
                        item._id === recipeId ? { ...item, ...payload } : item
                    )
                };
            });
        }
    }

    /**
     * Optimistic Delete - Xóa item khỏi cache local
     */
    async _optimisticDelete(endpoint, payload) {
        if (endpoint === '/fridge/') {
            await updateLocalCache('/fridge/', (data) => {
                return {
                    ...data,
                    data: (data.data || []).filter(item =>
                        item.foodId?.name !== payload?.foodName
                    )
                };
            });
        } else if (endpoint.startsWith('/recipe/')) {
            const recipeId = endpoint.split('/')[2];
            await updateLocalCache('/recipe/', (data) => {
                return {
                    ...data,
                    data: (data.data || []).filter(item => item._id !== recipeId)
                };
            });
        } else if (endpoint.startsWith('/shopping/')) {
            const listId = endpoint.split('/')[2];
            await updateLocalCache('/shopping/', (data) => {
                return {
                    ...data,
                    data: (data.data || []).filter(item => item._id !== listId)
                };
            });
        }
    }
}

// Export singleton instance
const offlineClient = new OfflineClient();
export default offlineClient;