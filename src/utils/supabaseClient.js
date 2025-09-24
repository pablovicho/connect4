import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if we're in development mode
const isDevelopment = import.meta.env.MODE === 'development' || window.location.hostname === 'localhost';

// Import connection test utility in development
if (isDevelopment) {
  import('./testConnection.js').then(module => {
    // eslint-disable-next-line no-console
    console.log('🔧 Connection test utility loaded. Run testSupabaseConnection() in console to test.');
  }).catch(err => {
    // eslint-disable-next-line no-console
    console.warn('Failed to load connection test utility:', err);
  });
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    storage: {
      getItem: (key) => {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : null;
      },
      setItem: (key, value) => {
        localStorage.setItem(key, JSON.stringify(value));
      },
      removeItem: (key) => {
        localStorage.removeItem(key);
      }
    }
  },
  realtime: {
    params: {
      eventsPerSecond: 1,
    },
    // Development-specific configuration to handle Cloudflare issues
    ...(isDevelopment && {
      heartbeatIntervalMs: 60000,
      reconnectAfterMs: function (tries) {
        return [1000, 2000, 5000, 10000][tries - 1] || 10000;
      },
      logger: (kind, msg, data) => {
        if (kind === 'error') {
          // eslint-disable-next-line no-console
          console.error('Realtime WebSocket error:', msg, data);
        } else if (import.meta.env.MODE === 'development') {
          // eslint-disable-next-line no-console
          console.log(`Realtime [${kind}]:`, msg, data);
        }
      },
      transport: window.WebSocket,
      timeout: 20000,
      longpollerTimeout: 20000,
      encode: (payload, callback) => {
        return callback(JSON.stringify(payload));
      },
      decode: (payload, callback) => {
        return callback(JSON.parse(payload));
      }
    })
  }
});

// Ensure we have an auth session (anonymous if needed)
export async function ensureAnonSession() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    const { error } = await supabase.auth.signInAnonymously();
    if (error) {
      // eslint-disable-next-line no-console
      console.error('Anonymous sign-in failed:', error);
      throw error;
    }
  }
}
