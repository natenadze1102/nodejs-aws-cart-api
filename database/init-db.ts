import * as fs from 'fs';
import * as path from 'path';
import { Client } from 'pg';
import * as dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

async function initDB() {
  const client = new Client({
    host: 'cart-service-db.cd66u40eafyf.eu-central-1.rds.amazonaws.com',
    port: '5432',
    user: 'postgres',
    password: '1tCez7g1ere6DNgTwQS7',
    database: 'cartdb',

    ssl:
      process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
  });

  try {
    console.log('Connecting to database...');
    await client.connect();
    console.log('Connected successfully');

    // Read and execute SQL script
    const sqlScript = fs.readFileSync(
      path.join(__dirname, 'init-db.sql'),
      'utf8',
    );

    console.log('Executing SQL script...');
    await client.query(sqlScript);
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

initDB();
