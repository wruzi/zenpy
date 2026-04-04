const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

function deepClone(value) {
    return JSON.parse(JSON.stringify(value));
}

function safeParseJSON(rawValue, fallback) {
    try {
        return JSON.parse(rawValue);
    } catch {
        return fallback;
    }
}

function createJsonStore({ dataDir, keys = [], defaults = {}, tableName = 'json_store', logger = console, localMirror = false }) {
    const cache = new Map();
    const keySet = new Set(keys);
    const pendingWrites = new Map();

    let supabase = null;
    let mode = 'local';
    let flushTimer = null;
    let flushInFlight = null;

    function localFilePath(key) {
        return path.join(dataDir, key);
    }

    function ensureLocalDir() {
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }
    }

    function readLocalFile(key) {
        const filePath = localFilePath(key);
        const fallback = Object.prototype.hasOwnProperty.call(defaults, key) ? deepClone(defaults[key]) : [];

        if (!fs.existsSync(filePath)) {
            fs.writeFileSync(filePath, JSON.stringify(fallback, null, 2), 'utf8');
            return fallback;
        }

        const rawValue = fs.readFileSync(filePath, 'utf8');
        return safeParseJSON(rawValue, fallback);
    }

    function writeLocalFile(key, data) {
        const filePath = localFilePath(key);
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    }

    function shouldWriteLocal() {
        if (mode === 'local') return true;
        return !!localMirror;
    }

    function queueSupabaseWrite(key, data) {
        if (mode !== 'supabase' || !supabase) return;
        pendingWrites.set(key, data);

        if (flushTimer) return;
        flushTimer = setTimeout(() => {
            flushTimer = null;
            flushNow().catch((error) => {
                logger.error('[supabase-store] background flush failed:', error.message);
            });
        }, 250);
    }

    async function flushNow() {
        if (mode !== 'supabase' || !supabase || pendingWrites.size === 0) return;
        if (flushInFlight) {
            await flushInFlight;
            return;
        }

        const rows = Array.from(pendingWrites.entries()).map(([key, data]) => ({
            key,
            data,
            updated_at: new Date().toISOString()
        }));

        pendingWrites.clear();

        flushInFlight = (async () => {
            const { error } = await supabase
                .from(tableName)
                .upsert(rows, { onConflict: 'key' });

            if (error) {
                rows.forEach(row => pendingWrites.set(row.key, row.data));
                throw error;
            }
        })();

        try {
            await flushInFlight;
        } finally {
            flushInFlight = null;
        }
    }

    async function hydrateFromSupabase() {
        const { data, error } = await supabase
            .from(tableName)
            .select('key,data');

        if (error) throw error;

        const remoteMap = new Map((data || []).map(row => [row.key, row.data]));

        for (const key of keySet) {
            if (remoteMap.has(key)) {
                const remoteValue = deepClone(remoteMap.get(key));
                cache.set(key, remoteValue);
                if (shouldWriteLocal()) {
                    writeLocalFile(key, remoteValue);
                }
            } else {
                queueSupabaseWrite(key, cache.get(key));
            }
        }

        await flushNow();
    }

    function readJSON(key) {
        if (!cache.has(key)) {
            const fallback = Object.prototype.hasOwnProperty.call(defaults, key) ? deepClone(defaults[key]) : [];
            cache.set(key, fallback);
        }
        return deepClone(cache.get(key));
    }

    function writeJSON(key, data) {
        if (!keySet.has(key)) {
            keySet.add(key);
        }

        const cloned = deepClone(data);
        cache.set(key, cloned);

        if (shouldWriteLocal()) {
            try {
                writeLocalFile(key, cloned);
            } catch (error) {
                logger.error(`[supabase-store] local write failed for ${key}:`, error.message);
            }
        }

        queueSupabaseWrite(key, cloned);
    }

    async function init() {
        ensureLocalDir();

        const supabaseUrl = (process.env.SUPABASE_URL || '').trim();
        const supabaseKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY || '').trim();

        if (supabaseUrl && supabaseKey) {
            try {
                supabase = createClient(supabaseUrl, supabaseKey, {
                    auth: { persistSession: false, autoRefreshToken: false }
                });

                for (const key of keySet) {
                    if (localMirror) {
                        cache.set(key, readLocalFile(key));
                    } else {
                        const fallback = Object.prototype.hasOwnProperty.call(defaults, key) ? deepClone(defaults[key]) : [];
                        cache.set(key, fallback);
                    }
                }

                mode = 'supabase';
                await hydrateFromSupabase();
                logger.log(`[supabase-store] Supabase sync active (table: ${tableName})${localMirror ? ' with local mirror.' : ' without local mirror.'}`);
                return;
            } catch (error) {
                mode = 'local';
                supabase = null;
                logger.error('[supabase-store] Supabase unavailable. Falling back to local JSON files:', error.message);
            }
        } else {
            mode = 'local';
            logger.warn('[supabase-store] SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY missing. Using local JSON files.');
        }

        for (const key of keySet) {
            cache.set(key, readLocalFile(key));
        }
    }

    function getMode() {
        return mode;
    }

    return {
        init,
        readJSON,
        writeJSON,
        flushNow,
        getMode
    };
}

module.exports = {
    createJsonStore
};
