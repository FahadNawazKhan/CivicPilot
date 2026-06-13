import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '..', '..', '.env') });

const config = {
  PORT: parseInt(process.env.PORT, 10) || 5000,
  HOST: '127.0.0.1',
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/civicpilot',
  JWT_SECRET: process.env.JWT_SECRET || 'supersecretkey_change_in_production',
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || null
};

if (!process.env.MONGODB_URI) {
  console.warn("WARNING: MONGODB_URI is not set in environment. Falling back to local default.");
}
if (!config.GEMINI_API_KEY) {
  console.warn("WARNING: GEMINI_API_KEY is not set in environment. AI features will run in offline fallback mode.");
}

export default config;