require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const DATA_DIR = path.join(__dirname, '..', '..', 'database', 'data');
const TABLE_NAME = process.env.SUPABASE_JSON_TABLE || 'json_store';
const SUPABASE_URL = (process.env.SUPABASE_URL || '').trim();
const SUPABASE_SERVICE_ROLE_KEY = (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY || '').trim();

function fail(message) {
    console.error(`\n❌ ${message}\n`);
    process.exit(1);
}

if (!SUPABASE_URL) fail('SUPABASE_URL is missing in your environment.');
if (!SUPABASE_SERVICE_ROLE_KEY) fail('SUPABASE_SERVICE_ROLE_KEY is missing in your environment.');
if (!fs.existsSync(DATA_DIR)) fail(`Data directory not found: ${DATA_DIR}`);

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false }
});

function listJsonFiles() {
    return fs
        .readdirSync(DATA_DIR)
        .filter(file => file.toLowerCase().endsWith('.json'))
        .sort((a, b) => a.localeCompare(b));
}

function parseJsonFile(fileName) {
    const filePath = path.join(DATA_DIR, fileName);
    const rawValue = fs.readFileSync(filePath, 'utf8');

    try {
        return JSON.parse(rawValue);
    } catch (error) {
        fail(`Invalid JSON in ${fileName}: ${error.message}`);
    }
}

async function migrate() {
    const files = listJsonFiles();
    if (files.length === 0) fail('No JSON files found in database/data.');

    const rows = files.map((fileName) => ({
        key: fileName,
        data: parseJsonFile(fileName),
        updated_at: new Date().toISOString()
    }));

    const { error } = await supabase
        .from(TABLE_NAME)
        .upsert(rows, { onConflict: 'key' });

    if (error) {
        fail(`Supabase upsert failed: ${error.message}`);
    }

    console.log(`\n✅ Migrated ${rows.length} JSON files to Supabase table '${TABLE_NAME}'.`);
    console.log('   Keys:', rows.map(r => r.key).join(', '));
    console.log('');
}

migrate().catch((error) => {
    fail(`Unexpected migration error: ${error.message}`);
});
