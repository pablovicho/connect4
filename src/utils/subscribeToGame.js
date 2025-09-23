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
    .subscribe(async (status, err) => {      
      if (err) {
        console.error('Subscription error:', err);
        if (err.message && err.message.includes('__cf_bm')) {
          console.error('Cloudflare bot management is blocking the connection. This is common in development.');
          
          setTimeout(() => {
            console.log('Attempting to reconnect...');
            subscribeToGame(gameId, onUpdate);
          }, 5000);
        }
        return;
      }
      
      if (status === 'SUBSCRIBED') {
        console.log(`✅ Successfully subscribed to game ${gameId}`);
        // Immediately hydrate current state to avoid missing initial state
        try {
          const { data, error } = await supabase
            .from('games')
            .select('board, turn')
            .eq('id', gameId)
            .single();
          if (!error && data) {
            onUpdate({ board: data.board, turn: data.turn });
          } else if (error) {
            console.error('Hydration fetch error:', error);
          }
        } catch (fetchErr) {
          console.error('Hydration fetch exception:', fetchErr);
        }
      } else if (status === 'CHANNEL_ERROR') {
        console.error(`❌ Channel error for game ${gameId}`);
      } else if (status === 'TIMED_OUT') {
        console.error(`⏰ Subscription timed out for game ${gameId}`);
      } else if (status === 'CLOSED') {
        console.log(`🔒 Channel closed for game ${gameId}`);
      }
    });

  // Add channel state monitoring
  if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'local') {
    const monitorInterval = setInterval(() => {
      const state = channel.state;
      console.log(`Channel state for game ${gameId}:`, state);
      
      if (state === 'closed' || state === 'errored') {
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