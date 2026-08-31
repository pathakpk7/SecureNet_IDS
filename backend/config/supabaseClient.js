import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Debug: Check if environment variables are loaded
console.log('Environment Variables Debug:');
console.log('SUPABASE_URL:', process.env.SUPABASE_URL ? 'Loaded' : 'NOT LOADED');
console.log('SUPABASE_KEY:', process.env.SUPABASE_KEY ? 'Loaded' : 'NOT LOADED');

// Validate environment variables
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_KEY) {
  console.error('ERROR: SUPABASE_URL and SUPABASE_KEY must be set in .env file');
  process.exit(1);
}

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

console.log('Supabase client initialized successfully');
export default supabase;
