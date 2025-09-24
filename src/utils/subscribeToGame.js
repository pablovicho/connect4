import { supabase } from "./supabaseClient";

function subscribeToGame(gameId, onUpdate) {  
  const channel = supabase
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
    )
    .subscribe((status) => {      
      if (status === 'SUBSCRIBED') {
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
      } else if (status === 'TIMED_OUT') {
        // eslint-disable-next-line no-console
        console.error(`⏰ Subscription timed out for game ${gameId}`);
      } else if (status === 'CLOSED') {
        // eslint-disable-next-line no-console
        console.log(`🔒 Channel closed for game ${gameId}`);
      }
    });

  // Add channel state monitoring
  if (import.meta.env.MODE === 'development') {
    const monitorInterval = setInterval(() => {
      const state = channel.state;
      // eslint-disable-next-line no-console
      console.log(`Channel state for game ${gameId}:`, state);
      
      if (state === 'closed' || state === 'errored') {
        // eslint-disable-next-line no-console
        console.log('Channel is in bad state, clearing monitor');
        clearInterval(monitorInterval);
      }
    }, 30000);
    // Store the interval ID for cleanup
    channel._monitorInterval = monitorInterval;
  }

  return {
    channel, // Expose channel for debugging
    unsubscribe: () => {
      if (channel._monitorInterval) {
        clearInterval(channel._monitorInterval);
      }
      return supabase.removeChannel(channel);
    }
  };
}

export default subscribeToGame;