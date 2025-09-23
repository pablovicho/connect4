import { supabase } from './supabaseClient';

export const testRealtimeConnection = async () => {
  // eslint-disable-next-line no-console
  console.log('🔍 Testing Supabase Realtime connection...');
  
  const results = {
    timestamp: new Date().toISOString(),
    success: false,
    errors: [],
    warnings: [],
    connectionDetails: {}
  };

  try {
    // Test basic Supabase connection
    // eslint-disable-next-line no-console
    console.log('1. Testing basic Supabase connection...');
    const { data, error } = await supabase.from('games').select('*').limit(1);
    // eslint-disable-next-line no-console
    console.log('Data:', data);
    
    if (error) {
      results.errors.push(`Database connection failed: ${error.message}`);
      console.error('❌ Database connection failed:', error);
    } else {
      console.log('✅ Database connection successful');
      results.connectionDetails.databaseWorking = true;
    }

    // Test realtime connection
    // eslint-disable-next-line no-console
    console.log('2. Testing WebSocket realtime connection...');
    
    const testChannel = supabase
      .channel('connection-test', {
        config: {
          broadcast: { self: true }
        }
      })
      .subscribe((status, err) => {
        // eslint-disable-next-line no-console
        console.log(`Connection test status: ${status}`);
        
        if (err) {
          // eslint-disable-next-line no-console
          console.error('❌ WebSocket connection error:', err);
          results.errors.push(`WebSocket error: ${err.message || JSON.stringify(err)}`);
          
          // Check for specific Cloudflare errors
          if (err.message && err.message.includes('__cf_bm')) {
            results.errors.push('Cloudflare bot management is blocking WebSocket connections');
            results.warnings.push('This is common in development. Try:');
            results.warnings.push('- Verify your Supabase project allows localhost in Auth settings');
            results.warnings.push('- Check if your ISP or network is blocking WebSocket connections');
            results.warnings.push('- Try using a VPN or different network');
            results.warnings.push('- Contact Supabase support to whitelist your development domain');
          }
          
          return;
        }

        switch (status) {
          case 'SUBSCRIBED':
            // eslint-disable-next-line no-console
            console.log('✅ WebSocket connection established successfully');
            results.success = true;
            results.connectionDetails.websocketWorking = true;
            break;
          case 'CHANNEL_ERROR':
            // eslint-disable-next-line no-console
            console.error('❌ Channel error occurred');
            results.errors.push('Channel error during subscription');
            break;
          case 'TIMED_OUT':
            // eslint-disable-next-line no-console
            console.error('❌ Connection timed out');
            results.errors.push('WebSocket connection timed out');
            break;
          case 'CLOSED':
            // eslint-disable-next-line no-console
            console.log('🔒 Channel was closed');
            break;
          default:
            // eslint-disable-next-line no-console
            console.log(`ℹ️ Status: ${status}`);
        }
      });

    // Test for 10 seconds then cleanup
    setTimeout(() => {
      // eslint-disable-next-line no-console
      console.log('3. Cleaning up test connection...');
      supabase.removeChannel(testChannel);
      
      // Print results
      // eslint-disable-next-line no-console
      console.log('\n📋 Connection Test Results:');
      // eslint-disable-next-line no-console
      console.log('==========================');
      console.log(`Success: ${results.success ? '✅' : '❌'}`);
      console.log(`Timestamp: ${results.timestamp}`);
      
      if (results.errors.length > 0) {
        // eslint-disable-next-line no-console
        console.log('\nErrors:');
        results.errors.forEach(error => console.log(`  ❌ ${error}`));
      }
      
      if (results.warnings.length > 0) {
        // eslint-disable-next-line no-console
        console.log('\nSuggestions:');
        results.warnings.forEach(warning => console.log(`  💡 ${warning}`));
      }
      
      if (results.connectionDetails.databaseWorking && results.connectionDetails.websocketWorking) {
        // eslint-disable-next-line no-console
        console.log('\n🎉 All connections working! Your multiplayer game should work properly.');
      } else if (results.connectionDetails.databaseWorking && !results.connectionDetails.websocketWorking) {
        // eslint-disable-next-line no-console
        console.log('\n⚠️ Database works but WebSocket is failing. This will prevent real-time updates.');
      } else {
        // eslint-disable-next-line no-console
        console.log('\n🚨 Connection issues detected. Please check your Supabase configuration.');
      }
      
      return results;
    }, 10000);

  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('❌ Unexpected error during connection test:', error);
    results.errors.push(`Unexpected error: ${error.message}`);
  }
  
  return results;
};

// Helper function to test from browser console
window.testSupabaseConnection = testRealtimeConnection;

export default testRealtimeConnection;