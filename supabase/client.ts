import { createClient } from '@supabase/supabase-js';

// Log environment variables for debugging (remove in production)
console.log('VITE_SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL);
console.log('VITE_SUPABASE_PUBLISHABLE_KEY:', import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY);

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl) {
    console.warn('Missing Supabase URL. Please set VITE_SUPABASE_URL in your .env file.');
}

if (!supabaseAnonKey) {
    console.warn('Missing Supabase Publishable Key. Please set VITE_SUPABASE_PUBLISHABLE_KEY in your .env file.');
}

// Validate key format
if (supabaseAnonKey && !supabaseAnonKey.startsWith('eyJ') && !supabaseAnonKey.startsWith('sb_')) {
    console.warn('Supabase Key may be invalid. It should start with "eyJ" or "sb_".');
}

// Create the Supabase client
export const supabase = createClient(
    supabaseUrl || 'https://placeholder.supabase.co',
    supabaseAnonKey || 'placeholder-key'
);