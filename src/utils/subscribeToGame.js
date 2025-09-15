import { supabase } from "./supabaseClient";

function subscribeToGame(gameId, onUpdate) {
  console.log('Subscribing to game:', gameId);
  
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
        console.log('Change received:', payload);
        onUpdate(payload.new);
      }
    )
    .subscribe((status, err) => {
      console.log(`Subscription status for game ${gameId}:`, status);
      
      if (err) {
        console.error('Subscription error:', err);
        
        // Handle specific Cloudflare/WebSocket errors
        if (err.message && err.message.includes('__cf_bm')) {
          console.error('Cloudflare bot management is blocking the connection. This is common in development.');
          console.log('Possible solutions:');
          console.log('1. Check if your Supabase project settings allow localhost');
          console.log('2. Try using a different network or VPN');
          console.log('3. Contact Supabase support to whitelist your domain');
          
          // Attempt to retry subscription after a delay
          setTimeout(() => {
            console.log('Attempting to reconnect...');
            subscribeToGame(gameId, onUpdate);
          }, 5000);
        }
        return;
      }
      
      if (status === 'SUBSCRIBED') {
        console.log(`✅ Successfully subscribed to game ${gameId}`);
      } else if (status === 'CHANNEL_ERROR') {
        console.error(`❌ Channel error for game ${gameId}`);
      } else if (status === 'TIMED_OUT') {
        console.error(`⏰ Subscription timed out for game ${gameId}`);
      } else if (status === 'CLOSED') {
        console.log(`🔒 Channel closed for game ${gameId}`);
      }
    });

  // Add channel state monitoring
  if (process.env.NODE_ENV === 'development') {
    const monitorInterval = setInterval(() => {
      const state = channel.state;
      console.log(`Channel state for game ${gameId}:`, state);
      
      if (state === 'closed' || state === 'errored') {
        console.log('Channel is in bad state, clearing monitor');
        clearInterval(monitorInterval);
      }
    }, 30000); // Check every 30 seconds
    
    // Store the interval ID for cleanup
    channel._monitorInterval = monitorInterval;
  }

  return {
    channel, // Expose channel for debugging
    unsubscribe: () => {
      console.log('Unsubscribing from channel');
      
      // Clear monitoring interval if it exists
      if (channel._monitorInterval) {
        clearInterval(channel._monitorInterval);
      }
      
      return supabase.removeChannel(channel);
    }
  };
}

export default subscribeToGame;