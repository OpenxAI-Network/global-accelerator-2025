// Load environment variables FIRST
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env file from the backend directory (one level up from config)
const envPath = join(__dirname, '..', '.env');

// Check if file exists and load it
if (existsSync(envPath)) {
  dotenv.config({ path: envPath });
} else {
  console.error('❌ .env file NOT found at:', envPath);
  console.error('Please make sure you have a .env file in the backend directory');
}

export default {};
