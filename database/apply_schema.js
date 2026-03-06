const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const connectionString = 'postgresql://postgres:040520081059Abc@db.gdazavxbtcvuxviqmyji.supabase.co:5432/postgres';

async function run() {
    const client = new Client({
        connectionString,
        ssl: { rejectUnauthorized: false }
    });

    try {
        console.log('Connecting to database...');
        await client.connect();
        console.log('Connected successfully.');

        const schemaPath = path.join(__dirname, 'schema.sql');
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');

        console.log('Executing schema...');
        await client.query(schemaSql);
        console.log('Schema executed successfully!');
    } catch (error) {
        console.error('Error executing schema:', error);
    } finally {
        await client.end();
    }
}

run();
