import { supabase, ensureAnonSession } from "./supabaseClient";

async function subscribeToGame(gameId, onUpdate) {  
  // Ensure we have a valid auth session before opening realtime
  await ensureAnonSession();

  let retries = 0;
  const maxRetries = 3;
  let channel = null;
  let healthInterval = null;
  let lastStatusAt = Date.now();

  const handleStatus = (status) => {      
    lastStatusAt = Date.now();

    if (status === 'SUBSCRIBED') {
      // reset retries on success
      retries = 0;
      // eslint-disable-next-line no-console
      console.log(`✅ Successfully subscribed to game ${gameId}`);
      // Immediately hydrate current state to avoid missing initial state
      (async () => {
        try {
          const { data, error } = await supabase
            .from('games')
            .select('board, turn')
            .eq('id', gameId)
            .single();
          if (!error && data) {
            onUpdate({ board: data.board, turn: data.turn });
          } else if (error) {
            // eslint-disable-next-line no-console
            console.error('Hydration fetch error:', error);
          }
        } catch (fetchErr) {
          // eslint-disable-next-line no-console
          console.error('Hydration fetch exception:', fetchErr);
        }
      })();
    } else if (status === 'CHANNEL_ERROR') {
      // eslint-disable-next-line no-console
      console.error(`❌ Channel error for game ${gameId}`);
      tryResubscribe();
    } else if (status === 'TIMED_OUT') {
      // eslint-disable-next-line no-console
      console.error(`⏰ Subscription timed out for game ${gameId}`);
      tryResubscribe();
    } else if (status === 'CLOSED') {
      // eslint-disable-next-line no-console
      console.log(`🔒 Channel closed for game ${gameId}`);
    }
  };

  const buildChannel = () => {
    const ch = supabase
      .channel(`game:${gameId}`, {
        config: {
          broadcast: { self: true },
          presence: { key: `player_${Date.now()}` }
        }
      })
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'games',
          filter: `id=eq.${gameId}`
        },
        (payload) => {
          onUpdate(payload.new);
        }
      );

    ch.subscribe(handleStatus);
    return ch;
  };

  const tryResubscribe = async () => {
    if (retries >= maxRetries) return;
    retries += 1;
    // Small backoff
    await new Promise(r => setTimeout(r, 500 * retries));
    await ensureAnonSession();
    if (channel) {
      try { await supabase.removeChannel(channel); } catch (_) { /* noop */ }
    }
    channel = buildChannel();
  };

  // Initial subscribe
  channel = buildChannel();

  // Periodic health-check (runs also in production)
  const HEALTH_INTERVAL_MS = 20000;
  const STUCK_THRESHOLD_MS = 15000;
  healthInterval = setInterval(() => {
    const state = channel?.state;
    const now = Date.now();

    if (!channel) return;

    // eslint-disable-next-line no-console
    if (import.meta.env.MODE === 'development') console.log(`⏱️ Health check for game ${gameId} | state=${state}`);

    if (state === 'closed' || state === 'errored') {
      tryResubscribe();
      return;
    }

    if ((state === 'joining' || state === 'leaving') && (now - lastStatusAt > STUCK_THRESHOLD_MS)) {
      // Considered stuck, attempt resubscribe
      tryResubscribe();
    }
  }, HEALTH_INTERVAL_MS);

  // Also keep the dev-only state monitor, but it will no longer clear itself prematurely
  if (import.meta.env.MODE === 'development') {
    const monitorInterval = setInterval(() => {
      const state = channel?.state;
      // eslint-disable-next-line no-console
      console.log(`Channel state for game ${gameId}:`, state);
    }, 30000);
    // Store the interval IDs for cleanup
    channel._monitorInterval = monitorInterval;
  }

  return {
    get channel() { return channel; }, // Expose current channel for debugging
    unsubscribe: () => {
      if (healthInterval) clearInterval(healthInterval);
      // clear dev monitor if present
      if (channel && channel._monitorInterval) {
        clearInterval(channel._monitorInterval);
      }
      if (channel) {
        return supabase.removeChannel(channel);
      }
    }
  };
}

export default subscribeToGame;