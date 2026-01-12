import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabaseSync('offline_cache.db');

// Khởi tạo tables
export async function initDatabase() {
    await db.execAsync(`
        -- Bảng lưu cache của các GET requests
        CREATE TABLE IF NOT EXISTS api_cache (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            endpoint TEXT UNIQUE NOT NULL,
            data TEXT NOT NULL,
            timestamp INTEGER NOT NULL
        );

        -- Bảng lưu queue các actions cần sync
        CREATE TABLE IF NOT EXISTS action_queue (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            method TEXT NOT NULL,
            endpoint TEXT NOT NULL,
            payload TEXT,
            created_at INTEGER NOT NULL,
            status TEXT DEFAULT 'pending'
        );

        -- Bảng lưu tin nhắn chat pending
        CREATE TABLE IF NOT EXISTS pending_messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            temp_id TEXT UNIQUE NOT NULL,
            group_id TEXT NOT NULL,
            sender_id TEXT NOT NULL,
            content TEXT NOT NULL,
            created_at INTEGER NOT NULL,
            status TEXT DEFAULT 'pending'
        );
    `);
    console.log('✅ Offline database initialized');
}

// ==================== CACHING ====================
// Lưu cache cho GET request
export async function saveCache(endpoint, data) {
    const jsonData = JSON.stringify(data);
    const timestamp = Date.now();
    
    await db.runAsync(
        `INSERT OR REPLACE INTO api_cache (endpoint, data, timestamp) VALUES (?, ?, ?)`,
        [endpoint, jsonData, timestamp]
    );
}

// Lấy cache từ endpoint
export async function getCache(endpoint) {
    const result = await db.getFirstAsync(
        `SELECT data, timestamp FROM api_cache WHERE endpoint = ?`,
        [endpoint]
    );
    
    if (result) {
        return {
            data: JSON.parse(result.data),
            timestamp: result.timestamp
        };
    }
    return null;
}

// Lấy tất cả cache có prefix (dùng cho update/delete nhiều cache)
export async function getAllCachesWithPrefix(prefix) {
    try {
        const results = await db.getAllAsync(
            `SELECT endpoint, data FROM api_cache WHERE endpoint LIKE ?`,
            [`${prefix}%`]
        );
        
        return results.map(row => ({
            key: row.endpoint,
            data: JSON.parse(row.data)
        }));
    } catch (error) {
        console.error('Error getting caches with prefix:', error);
        return [];
    }
}

// Xóa cache theo key
export async function deleteCache(endpoint) {
    try {
        await db.runAsync(
            `DELETE FROM api_cache WHERE endpoint = ?`,
            [endpoint]
        );
        console.log(`🗑️ Deleted cache: ${endpoint}`);
    } catch (error) {
        console.error('Error deleting cache:', error);
    }
}

// ==================== ACTION QUEUE ====================
// Xoá toàn bộ cache
export async function clearCache() {
    await db.runAsync(`DELETE FROM api_cache`);
    console.log('✅ All cache cleared');
}

// Thêm action vào queue
export async function addToQueue(method, endpoint, payload) {
    await db.runAsync(
        `INSERT INTO action_queue (method, endpoint, payload, created_at) VALUES (?, ?, ?, ?)`,
        [method, endpoint, JSON.stringify(payload), Date.now()]
    );
}

// Lấy tất cả actions pending
export async function getPendingActions() {
    return await db.getAllAsync(
        `SELECT * FROM action_queue WHERE status = 'pending' ORDER BY created_at ASC`
    );
}

// Đánh dấu action đã sync
export async function markActionSynced(id) {
    await db.runAsync(
        `UPDATE action_queue SET status = 'synced' WHERE id = ?`,
        [id]
    );
}

// Xóa tất cả actions đã sync
export async function clearSyncedActions() {
    await db.runAsync(`DELETE FROM action_queue WHERE status = 'synced'`);
}

// Xoá tất cả actions
export async function clearActions() {
    await db.runAsync(`DELETE FROM action_queue`);
    console.log('✅ All actions cleared');
}

// Cập nhật cache cục bộ (cho optimistic updates)
export async function updateLocalCache(endpoint, updateFn) {
    const cached = await getCache(endpoint);
    if (cached) {
        const updatedData = updateFn(cached.data);
        await saveCache(endpoint, updatedData);
        return updatedData;
    }
    return null;
}

// ==================== PENDING MESSAGES ====================
// Thêm tin nhắn vào queue
export async function addPendingMessage(tempId, groupId, senderId, content) {
    await db.runAsync(
        `INSERT INTO pending_messages (temp_id, group_id, sender_id, content, created_at) VALUES (?, ?, ?, ?, ?)`,
        [tempId, groupId, senderId, content, Date.now()]
    );
    console.log(`📝 Queued message: ${tempId}`);
}

// Lấy tất cả tin nhắn pending
export async function getPendingMessages(groupId = null) {
    if (groupId) {
        return await db.getAllAsync(
            `SELECT * FROM pending_messages WHERE status = 'pending' AND group_id = ? ORDER BY created_at ASC`,
            [groupId]
        );
    }
    return await db.getAllAsync(
        `SELECT * FROM pending_messages WHERE status = 'pending' ORDER BY created_at ASC`
    );
}

// Đánh dấu tin nhắn đã gửi
export async function markMessageSent(tempId) {
    await db.runAsync(
        `UPDATE pending_messages SET status = 'sent' WHERE temp_id = ?`,
        [tempId]
    );
}

// Xóa tin nhắn đã gửi
export async function clearSentMessages() {
    await db.runAsync(`DELETE FROM pending_messages WHERE status = 'sent'`);
}

// Xóa tất cả tin nhắn pending
export async function clearPendingMessages() {
    await db.runAsync(`DELETE FROM pending_messages`);
    console.log('✅ All pending messages cleared');
}

export default db;