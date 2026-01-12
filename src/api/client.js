import onlineClient, { BASE_URL } from './client.online';
import { saveCache, getCache, addToQueue, updateLocalCache } from '../services/offline';
import NetInfo from '@react-native-community/netinfo';

// ===================== CONFIGURATION =====================

/**
 * Endpoints được CACHE (GET) và hỗ trợ QUEUE (POST/PUT/DELETE)
 * Key: prefix của endpoint
 * Value: { cache: boolean, queue: boolean }
 */
const OFFLINE_CONFIG = {
    // Fridge - Tủ lạnh
    '/fridge/': { cache: true, queue: true },
    '/fridge': { cache: true, queue: true },  // /fridge/:foodName
    
    // Shopping - Mua sắm
    '/shopping/': { cache: true, queue: true },
    '/shopping/task': { cache: true, queue: true },
    
    // Meal - Thực đơn
    '/meal': { cache: true, queue: true },
    
    // Recipe - Công thức
    '/recipe': { cache: true, queue: true },
    
    // Food - Thực phẩm (chỉ cache GET, không queue mutations vì có upload)
    '/food/': { cache: true, queue: false },
    
    // Admin - Category & Unit (chỉ cache GET)
    '/admin/category': { cache: true, queue: false },
    '/admin/unit': { cache: true, queue: false },
};

/**
 * Endpoints LUÔN bypass offline mode (cần server realtime)
 */
const BYPASS_ENDPOINTS = [
    '/user/login',
    '/user/logout',
    '/user/register',
    '/user/',              // POST register, DELETE account, GET user info
    '/user/edit',
    '/user/forgot-password',
    '/user/change-password',
    '/user/send-verification-code',
    '/user/verify-email',
    '/user/refresh-token',
    '/user/group',         // Tất cả group APIs
];

// ===================== HELPERS =====================

/**
 * Lấy config offline cho endpoint
 */
const getOfflineConfig = (endpoint) => {
    const baseEndpoint = endpoint.split('?')[0]; // Bỏ query params
    
    // Check bypass list
    for (const bypass of BYPASS_ENDPOINTS) {
        if (baseEndpoint.startsWith(bypass)) {
            return { cache: false, queue: false, bypass: true };
        }
    }
    
    // Check offline config
    for (const [prefix, config] of Object.entries(OFFLINE_CONFIG)) {
        if (baseEndpoint.startsWith(prefix)) {
            return { ...config, bypass: false };
        }
    }
    
    // Default: không hỗ trợ offline
    return { cache: false, queue: false, bypass: false };
};

/**
 * Check network status
 */
const checkNetwork = async () => {
    const netState = await NetInfo.fetch();
    return netState.isConnected && netState.isInternetReachable;
};

/**
 * Tạo cache key từ endpoint (bao gồm query params)
 */
const getCacheKey = (endpoint) => {
    return endpoint; // Giữ nguyên để phân biệt /meal?date=2024-01-01 vs /meal?date=2024-01-02
};

/**
 * Lấy base endpoint và extract ID nếu có
 * VD: '/fridge/Thịt bò' -> { base: '/fridge', id: 'Thịt bò' }
 *     '/shopping/task?listId=123' -> { base: '/shopping/task', id: null, params: { listId: '123' } }
 */
const parseEndpoint = (endpoint) => {
    const [path, queryString] = endpoint.split('?');
    const parts = path.split('/').filter(Boolean);
    
    // Parse query params
    const params = {};
    if (queryString) {
        queryString.split('&').forEach(pair => {
            const [key, value] = pair.split('=');
            params[decodeURIComponent(key)] = decodeURIComponent(value || '');
        });
    }
    
    // Xác định base và id
    let base = '/' + parts[0];
    let id = null;
    
    if (parts.length >= 2) {
        // Check nếu part[1] là sub-resource (task) hay là ID
        if (['task'].includes(parts[1])) {
            base = '/' + parts[0] + '/' + parts[1];
            id = parts[2] || null;
        } else {
            id = parts[1];
        }
    }
    
    return { base, id, params, fullPath: path };
};

// ===================== OFFLINE CLIENT CLASS =====================

class OfflineClient {
    constructor() {
        // Mimic axios client structure for compatibility
        this.defaults = {
            baseURL: BASE_URL
        };
    }
    
    // ==================== GET ====================
    
    async get(endpoint, config = {}) {
        const offlineConfig = getOfflineConfig(endpoint);
        const isOnline = await checkNetwork();
        const cacheKey = getCacheKey(endpoint);
        
        // Bypass endpoints luôn gọi trực tiếp
        if (offlineConfig.bypass) {
            return await onlineClient.get(endpoint, config);
        }
        
        if (isOnline) {
            try {
                const response = await onlineClient.get(endpoint, config);
                
                // Cache kết quả nếu được phép
                if (offlineConfig.cache) {
                    await saveCache(cacheKey, response.data);
                    console.log(`💾 Cached: ${cacheKey}`);
                }
                
                return response;
            } catch (error) {
                // Nếu lỗi mạng, thử lấy từ cache
                if (this._isNetworkError(error) && offlineConfig.cache) {
                    const cached = await getCache(cacheKey);
                    if (cached) {
                        console.log(`📦 Fallback to cache: ${cacheKey}`);
                        return { data: cached.data, fromCache: true };
                    }
                }
                throw error;
            }
        } else {
            // Offline: Lấy từ cache
            if (offlineConfig.cache) {
                const cached = await getCache(cacheKey);
                if (cached) {
                    console.log(`📦 [Offline] Cache hit: ${cacheKey}`);
                    return { data: cached.data, fromCache: true };
                }
            }
            throw new Error('Không có kết nối mạng và không có dữ liệu cache');
        }
    }
    
    // ==================== POST ====================
    
    async post(endpoint, payload, config = {}) {
        const offlineConfig = getOfflineConfig(endpoint);
        const isOnline = await checkNetwork();
        
        // Bypass endpoints luôn gọi trực tiếp
        if (offlineConfig.bypass || !offlineConfig.queue) {
            if (!isOnline) {
                throw new Error('Cần kết nối mạng để thực hiện thao tác này');
            }
            return await onlineClient.post(endpoint, payload, config);
        }
        
        if (isOnline) {
            try {
                return await onlineClient.post(endpoint, payload, config);
            } catch (error) {
                if (this._isNetworkError(error)) {
                    return await this._queueAndOptimisticCreate(endpoint, payload);
                }
                throw error;
            }
        } else {
            return await this._queueAndOptimisticCreate(endpoint, payload);
        }
    }
    
    // ==================== PUT ====================
    
    async put(endpoint, payload, config = {}) {
        const offlineConfig = getOfflineConfig(endpoint);
        const isOnline = await checkNetwork();
        
        if (offlineConfig.bypass || !offlineConfig.queue) {
            if (!isOnline) {
                throw new Error('Cần kết nối mạng để thực hiện thao tác này');
            }
            return await onlineClient.put(endpoint, payload, config);
        }
        
        if (isOnline) {
            try {
                return await onlineClient.put(endpoint, payload, config);
            } catch (error) {
                if (this._isNetworkError(error)) {
                    return await this._queueAndOptimisticUpdate(endpoint, payload);
                }
                throw error;
            }
        } else {
            return await this._queueAndOptimisticUpdate(endpoint, payload);
        }
    }
    
    // ==================== DELETE ====================
    
    async delete(endpoint, config = {}) {
        const offlineConfig = getOfflineConfig(endpoint);
        const isOnline = await checkNetwork();
        const payload = config.data || {};
        
        if (offlineConfig.bypass || !offlineConfig.queue) {
            if (!isOnline) {
                throw new Error('Cần kết nối mạng để thực hiện thao tác này');
            }
            return await onlineClient.delete(endpoint, config);
        }
        
        if (isOnline) {
            try {
                return await onlineClient.delete(endpoint, config);
            } catch (error) {
                if (this._isNetworkError(error)) {
                    return await this._queueAndOptimisticDelete(endpoint, payload);
                }
                throw error;
            }
        } else {
            return await this._queueAndOptimisticDelete(endpoint, payload);
        }
    }
    
    // ==================== PATCH ====================
    
    async patch(endpoint, payload, config = {}) {
        const offlineConfig = getOfflineConfig(endpoint);
        const isOnline = await checkNetwork();
        
        if (offlineConfig.bypass || !offlineConfig.queue) {
            if (!isOnline) {
                throw new Error('Cần kết nối mạng để thực hiện thao tác này');
            }
            return await onlineClient.patch(endpoint, payload, config);
        }
        
        if (isOnline) {
            try {
                return await onlineClient.patch(endpoint, payload, config);
            } catch (error) {
                if (this._isNetworkError(error)) {
                    return await this._queueAndOptimisticUpdate(endpoint, payload);
                }
                throw error;
            }
        } else {
            return await this._queueAndOptimisticUpdate(endpoint, payload);
        }
    }
    
    // ===================== QUEUE & OPTIMISTIC METHODS =====================
    
    async _queueAndOptimisticCreate(endpoint, payload) {
        await addToQueue('POST', endpoint, payload);
        await this._optimisticCreate(endpoint, payload);
        console.log(`📝 Queued POST: ${endpoint}`);
        
        return {
            data: { 
                message: 'Đã lưu offline, sẽ đồng bộ khi có mạng',
                _tempId: `temp_${Date.now()}`
            },
            offline: true
        };
    }
    
    async _queueAndOptimisticUpdate(endpoint, payload) {
        await addToQueue('PUT', endpoint, payload);
        await this._optimisticUpdate(endpoint, payload);
        console.log(`📝 Queued PUT: ${endpoint}`);
        
        return {
            data: { message: 'Đã lưu offline, sẽ đồng bộ khi có mạng' },
            offline: true
        };
    }
    
    async _queueAndOptimisticDelete(endpoint, payload) {
        await addToQueue('DELETE', endpoint, payload);
        await this._optimisticDelete(endpoint, payload);
        console.log(`📝 Queued DELETE: ${endpoint}`);
        
        return {
            data: { message: 'Đã lưu offline, sẽ đồng bộ khi có mạng' },
            offline: true
        };
    }
    
    // ===================== OPTIMISTIC CREATE =====================
    
    async _optimisticCreate(endpoint, payload) {
        const { base } = parseEndpoint(endpoint);
        
        switch (base) {
            case '/fridge':
                await this._createFridgeItem(payload);
                break;
            case '/shopping':
                await this._createShoppingList(payload);
                break;
            case '/shopping/task':
                await this._createShoppingTasks(payload);
                break;
            case '/meal':
                await this._createMealPlan(payload);
                break;
            case '/recipe':
                await this._createRecipe(payload);
                break;
        }
    }
    
    async _createFridgeItem(payload) {
        // POST /fridge/ - Thêm đồ vào tủ
        await this._safeUpdateCache('/fridge/', (data) => {
            const newItem = {
                _id: `temp_${Date.now()}`,
                foodId: {
                    _id: `temp_food_${Date.now()}`,
                    name: payload.foodName,
                    image: null,
                    category: { name: payload.categoryName || 'Khác' },
                    unit: { unitName: payload.unitName || 'cái' }
                },
                quantity: payload.quantity || 1,
                compartment: payload.compartment || 'Cooler',
                useWithin: payload.useWithin,
                note: payload.note || '',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            
            return {
                ...data,
                data: [...(data?.data || []), newItem]
            };
        });
    }
    
    async _createShoppingList(payload) {
        // POST /shopping/ - Tạo danh sách mua sắm
        await this._safeUpdateCache('/shopping/', (data) => {
            const newList = {
                _id: `temp_${Date.now()}`,
                name: payload.name,
                date: payload.date,
                assignTo: payload.assignToUsername ? { username: payload.assignToUsername } : null,
                note: payload.note || '',
                tasks: [],
                createdAt: new Date().toISOString()
            };
            
            return {
                ...data,
                data: [...(data?.data || []), newList]
            };
        });
    }
    
    async _createShoppingTasks(payload) {
        // POST /shopping/task - Thêm tasks vào list
        const cacheKey = `/shopping/task?listId=${payload.listId}`;
        
        await this._safeUpdateCache(cacheKey, (data) => {
            const newTasks = (payload.tasks || []).map((task, index) => ({
                _id: `temp_task_${Date.now()}_${index}`,
                foodId: { name: task.foodName },
                quantity: task.quantity,
                isBought: false,
                createdAt: new Date().toISOString()
            }));
            
            return {
                ...data,
                data: {
                    ...(data?.data || {}),
                    tasks: [...(data?.data?.tasks || []), ...newTasks]
                }
            };
        });
    }
    
    async _createMealPlan(payload) {
        // POST /meal/ - Tạo thực đơn
        const cacheKey = `/meal?date=${payload.date}`;
        
        await this._safeUpdateCache(cacheKey, (data) => {
            const newMeal = {
                _id: `temp_${Date.now()}`,
                date: payload.date,
                mealType: payload.mealType,
                foodId: { name: payload.foodName },
                createdAt: new Date().toISOString()
            };
            
            return {
                ...data,
                data: [...(data?.data || []), newMeal]
            };
        });
    }
    
    async _createRecipe(payload) {
        // POST /recipe - Tạo công thức
        const cacheKey = `/recipe?foodName=${encodeURIComponent(payload.foodName)}`;
        
        await this._safeUpdateCache(cacheKey, (data) => {
            const newRecipe = {
                _id: `temp_${Date.now()}`,
                foodId: { name: payload.foodName },
                name: payload.name,
                description: payload.description || '',
                htmlContent: payload.htmlContent || '',
                createdAt: new Date().toISOString()
            };
            
            return {
                ...data,
                data: [...(data?.data || []), newRecipe]
            };
        });
    }
    
    // ===================== OPTIMISTIC UPDATE =====================
    
    async _optimisticUpdate(endpoint, payload) {
        const { base } = parseEndpoint(endpoint);
        
        switch (base) {
            case '/fridge':
                await this._updateFridgeItem(payload);
                break;
            case '/shopping':
                await this._updateShoppingList(payload);
                break;
            case '/shopping/task':
                await this._updateShoppingTask(payload);
                break;
            case '/meal':
                await this._updateMealPlan(payload);
                break;
            case '/recipe':
                await this._updateRecipe(payload);
                break;
        }
    }
    
    async _updateFridgeItem(payload) {
        // PUT /fridge/ - Cập nhật số lượng, hạn dùng
        await this._safeUpdateCache('/fridge/', (data) => {
            return {
                ...data,
                data: (data?.data || []).map(item => {
                    if (item._id === payload.itemId) {
                        return {
                            ...item,
                            quantity: payload.newQuantity ?? item.quantity,
                            useWithin: payload.newUseWithin ?? item.useWithin,
                            updatedAt: new Date().toISOString()
                        };
                    }
                    return item;
                })
            };
        });
    }
    
    async _updateShoppingList(payload) {
        // PUT /shopping/ - Cập nhật tên list
        await this._safeUpdateCache('/shopping/', (data) => {
            return {
                ...data,
                data: (data?.data || []).map(list => {
                    if (list._id === payload.listId) {
                        return {
                            ...list,
                            name: payload.newName ?? list.name,
                            updatedAt: new Date().toISOString()
                        };
                    }
                    return list;
                })
            };
        });
    }
    
    async _updateShoppingTask(payload) {
        // PUT /shopping/task - Cập nhật task
        // Cần tìm cache key phù hợp - có thể cần listId
        // Tạm thời update tất cả cache có chứa task này
        const allCaches = await this._getAllCachesWithPrefix('/shopping/task');
        
        for (const { key, data } of allCaches) {
            const updatedData = {
                ...data,
                data: {
                    ...data.data,
                    tasks: (data.data?.tasks || []).map(task => {
                        if (task._id === payload.taskId) {
                            return {
                                ...task,
                                foodId: payload.newFoodName 
                                    ? { ...task.foodId, name: payload.newFoodName }
                                    : task.foodId,
                                quantity: payload.newQuantity ?? task.quantity,
                                isBought: payload.isBought ?? task.isBought,
                                updatedAt: new Date().toISOString()
                            };
                        }
                        return task;
                    })
                }
            };
            await saveCache(key, updatedData);
        }
    }
    
    async _updateMealPlan(payload) {
        // PUT /meal/ - Cập nhật meal plan
        // Cần tìm đúng cache key theo date
        const allCaches = await this._getAllCachesWithPrefix('/meal?date=');
        
        for (const { key, data } of allCaches) {
            let updated = false;
            const updatedData = {
                ...data,
                data: (data?.data || []).map(meal => {
                    if (meal._id === payload.planId) {
                        updated = true;
                        return {
                            ...meal,
                            foodId: payload.newFoodName 
                                ? { ...meal.foodId, name: payload.newFoodName }
                                : meal.foodId,
                            mealType: payload.newName ?? meal.mealType,
                            updatedAt: new Date().toISOString()
                        };
                    }
                    return meal;
                })
            };
            
            if (updated) {
                await saveCache(key, updatedData);
            }
        }
    }
    
    async _updateRecipe(payload) {
        // PUT /recipe - Cập nhật công thức
        const allCaches = await this._getAllCachesWithPrefix('/recipe?foodName=');
        
        for (const { key, data } of allCaches) {
            let updated = false;
            const updatedData = {
                ...data,
                data: (data?.data || []).map(recipe => {
                    if (recipe._id === payload.recipeId) {
                        updated = true;
                        return {
                            ...recipe,
                            name: payload.newName ?? recipe.name,
                            description: payload.newDescription ?? recipe.description,
                            htmlContent: payload.newHtmlContent ?? recipe.htmlContent,
                            updatedAt: new Date().toISOString()
                        };
                    }
                    return recipe;
                })
            };
            
            if (updated) {
                await saveCache(key, updatedData);
            }
        }
    }
    
    // ===================== OPTIMISTIC DELETE =====================
    
    async _optimisticDelete(endpoint, payload) {
        const { base } = parseEndpoint(endpoint);
        
        switch (base) {
            case '/fridge':
                await this._deleteFridgeItem(payload);
                break;
            case '/shopping':
                await this._deleteShoppingList(payload);
                break;
            case '/shopping/task':
                await this._deleteShoppingTask(payload);
                break;
            case '/meal':
                await this._deleteMealPlan(payload);
                break;
            case '/recipe':
                await this._deleteRecipe(payload);
                break;
        }
    }
    
    async _deleteFridgeItem(payload) {
        // DELETE /fridge/ - Xóa theo foodName
        await this._safeUpdateCache('/fridge/', (data) => {
            return {
                ...data,
                data: (data?.data || []).filter(item => 
                    item.foodId?.name !== payload.foodName
                )
            };
        });
    }
    
    async _deleteShoppingList(payload) {
        // DELETE /shopping/ - Xóa list theo listId
        await this._safeUpdateCache('/shopping/', (data) => {
            return {
                ...data,
                data: (data?.data || []).filter(list => 
                    list._id !== payload.listId
                )
            };
        });
        
        // Xóa luôn cache tasks của list này
        const taskCacheKey = `/shopping/task?listId=${payload.listId}`;
        await this._deleteCache(taskCacheKey);
    }
    
    async _deleteShoppingTask(payload) {
        // DELETE /shopping/task - Xóa task theo taskId
        const allCaches = await this._getAllCachesWithPrefix('/shopping/task');
        
        for (const { key, data } of allCaches) {
            const updatedData = {
                ...data,
                data: {
                    ...data.data,
                    tasks: (data.data?.tasks || []).filter(task => 
                        task._id !== payload.taskId
                    )
                }
            };
            await saveCache(key, updatedData);
        }
    }
    
    async _deleteMealPlan(payload) {
        // DELETE /meal/ - Xóa meal plan theo planId
        const allCaches = await this._getAllCachesWithPrefix('/meal?date=');
        
        for (const { key, data } of allCaches) {
            const filteredData = (data?.data || []).filter(meal => 
                meal._id !== payload.planId
            );
            
            if (filteredData.length !== (data?.data || []).length) {
                await saveCache(key, { ...data, data: filteredData });
            }
        }
    }
    
    async _deleteRecipe(payload) {
        // DELETE /recipe - Xóa recipe theo recipeId
        const allCaches = await this._getAllCachesWithPrefix('/recipe?foodName=');
        
        for (const { key, data } of allCaches) {
            const filteredData = (data?.data || []).filter(recipe => 
                recipe._id !== payload.recipeId
            );
            
            if (filteredData.length !== (data?.data || []).length) {
                await saveCache(key, { ...data, data: filteredData });
            }
        }
    }
    
    // ===================== HELPER METHODS =====================
    
    _isNetworkError(error) {
        return error.code === 'ECONNABORTED' || 
               error.code === 'ERR_NETWORK' ||
               !error.response;
    }
    
    async _safeUpdateCache(cacheKey, updateFn) {
        try {
            const cached = await getCache(cacheKey);
            
            if (cached) {
                const updatedData = updateFn(cached.data);
                await saveCache(cacheKey, updatedData);
            } else {
                // Tạo cache mới với cấu trúc mặc định
                const newData = updateFn({ data: [] });
                await saveCache(cacheKey, newData);
                console.log(`📦 Created new cache: ${cacheKey}`);
            }
        } catch (error) {
            console.error(`Error updating cache ${cacheKey}:`, error);
        }
    }
    
    async _getAllCachesWithPrefix(prefix) {
        // Cần thêm hàm này vào services/offline/index.js
        try {
            const { getAllCachesWithPrefix } = await import('../services/offline');
            return await getAllCachesWithPrefix(prefix);
        } catch (error) {
            console.error('Error getting caches with prefix:', error);
            return [];
        }
    }
    
    async _deleteCache(cacheKey) {
        try {
            const { deleteCache } = await import('../services/offline');
            await deleteCache(cacheKey);
        } catch (error) {
            console.error(`Error deleting cache ${cacheKey}:`, error);
        }
    }
}

// Export singleton instance
const client = new OfflineClient();
export default client;