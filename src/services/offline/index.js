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
    `);
    console.log('✅ Offline database initialized');
}

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

// Xoá toàn bộ cache
export async function clearCache() {
    await db.runAsync(`TRUNCATE TABLE api_cache`);
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
    await db.runAsync(`TRUNCATE TABLE action_queue`)
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

export default db;