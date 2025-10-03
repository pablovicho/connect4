import { supabase, ensureAnonSession } from '../utils/supabaseClient';

/**
 * Security Testing Utility for Players Table
 * 
 * This utility helps verify that your RLS policies work correctly
 * Run in browser console: testPlayersTableSecurity()
 */

export const testPlayersTableSecurity = async () => {
  console.log('🔒 Testing Players Table Security Setup...');
  console.log('==========================================');

  const results = {
    timestamp: new Date().toISOString(),
    tests: [],
    passed: 0,
    failed: 0,
    errors: []
  };

  const addTest = (testName, passed, details = '') => {
    const result = { testName, passed, details };
    results.tests.push(result);
    if (passed) {
      results.passed++;
      console.log(`✅ ${testName}${details ? ': ' + details : ''}`);
    } else {
      results.failed++;
      console.log(`❌ ${testName}${details ? ': ' + details : ''}`);
    }
  };

  try {
    // Ensure we have an authenticated session
    console.log('\n1. Setting up authenticated session...');
    await ensureAnonSession();
    
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error('Failed to get authenticated user');
    }
    console.log(`User ID: ${user.id}`);

    // Test 1: Create a test game
    console.log('\n2. Creating test game...');
    const { data: testGame, error: gameError } = await supabase
      .from('games')
      .insert({ owner_id_1: user.id })
      .select()
      .single();

    if (gameError) {
      addTest('Create test game', false, gameError.message);
      throw gameError;
    }
    addTest('Create test game', true, `Game ID: ${testGame.id}`);

    // Test 2: Create player 1 entry
    console.log('\n3. Creating player 1 entry...');
    const { error: p1Error } = await supabase
      .from('players')
      .insert({ game_id: testGame.id, slot: 1, auth_id: user.id });

    if (p1Error) {
      addTest('Create player 1 entry', false, p1Error.message);
    } else {
      addTest('Create player 1 entry', true);
    }

    // Test 3: Try to create duplicate player 1 (should fail)
    console.log('\n4. Testing duplicate player 1 prevention...');
    const { error: duplicateError } = await supabase
      .from('players')
      .insert({ game_id: testGame.id, slot: 1, auth_id: user.id });

    if (duplicateError) {
      addTest('Prevent duplicate player 1', true, 'Correctly prevented duplicate');
    } else {
      addTest('Prevent duplicate player 1', false, 'Should have prevented duplicate');
    }

    // Test 4: Read own player entries
    console.log('\n5. Testing read access to own player entries...');
    const { data: ownPlayers, error: readError } = await supabase
      .from('players')
      .select('*')
      .eq('game_id', testGame.id);

    if (readError) {
      addTest('Read own player entries', false, readError.message);
    } else if (ownPlayers && ownPlayers.length > 0) {
      addTest('Read own player entries', true, `Found ${ownPlayers.length} entries`);
    } else {
      addTest('Read own player entries', false, 'No entries found');
    }

    // Test 5: Try to create player with wrong auth_id (should fail)
    console.log('\n6. Testing unauthorized player creation...');
    const { error: wrongAuthError } = await supabase
      .from('players')
      .insert({ 
        game_id: testGame.id, 
        slot: 2, 
        auth_id: 'fake-user-id-12345' 
      });

    if (wrongAuthError) {
      addTest('Prevent unauthorized player creation', true, 'Correctly blocked fake auth_id');
    } else {
      addTest('Prevent unauthorized player creation', false, 'Should have blocked fake auth_id');
    }

    // Test 6: Create unbound player 2 slot
    console.log('\n7. Creating unbound player 2 slot...');
    const { error: unboundError } = await supabase
      .from('players')
      .insert({ game_id: testGame.id, slot: 2, auth_id: null });

    if (unboundError) {
      addTest('Create unbound player 2 slot', false, unboundError.message);
    } else {
      addTest('Create unbound player 2 slot', true);
    }

    // Test 7: Test game state reading
    console.log('\n8. Testing game state access...');
    const { data: gameData, error: gameReadError } = await supabase
      .from('games')
      .select('*')
      .eq('id', testGame.id)
      .single();

    if (gameReadError) {
      addTest('Read game state', false, gameReadError.message);
    } else if (gameData) {
      addTest('Read game state', true, 'Can read own game');
    } else {
      addTest('Read game state', false, 'No game data returned');
    }

    // Test 8: Test realtime subscription setup
    console.log('\n9. Testing realtime subscription...');
    let subscriptionWorking = false;
    const testChannel = supabase
      .channel(`security-test-${testGame.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'games',
          filter: `id=eq.${testGame.id}`
        },
        () => {
          subscriptionWorking = true;
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          addTest('Realtime subscription', true, 'Subscription established');
        } else if (status === 'CHANNEL_ERROR') {
          addTest('Realtime subscription', false, 'Channel error');
        }
      });

    // Wait for subscription to establish
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Test 9: Update game state (trigger realtime)
    console.log('\n10. Testing game state updates...');
    const { error: updateError } = await supabase
      .from('games')
      .update({ turn: 2 })
      .eq('id', testGame.id);

    if (updateError) {
      addTest('Update game state', false, updateError.message);
    } else {
      addTest('Update game state', true);
    }

    // Wait for realtime event
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Clean up subscription
    supabase.removeChannel(testChannel);

    // Test 10: Try to access other games (should fail)
    console.log('\n11. Testing access to unauthorized games...');
    const { data: otherGames, error: otherGamesError } = await supabase
      .from('games')
      .select('*')
      .neq('owner_id_1', user.id)
      .limit(1);

    if (otherGamesError) {
      addTest('Block access to unauthorized games', true, 'Access correctly blocked');
    } else if (!otherGames || otherGames.length === 0) {
      addTest('Block access to unauthorized games', true, 'No unauthorized games returned');
    } else {
      addTest('Block access to unauthorized games', false, 'Should not see other games');
    }

    // Cleanup: Delete test game
    console.log('\n12. Cleaning up test data...');
    const { error: cleanupError } = await supabase
      .from('games')
      .delete()
      .eq('id', testGame.id);

    if (!cleanupError) {
      addTest('Cleanup test data', true);
    } else {
      addTest('Cleanup test data', false, cleanupError.message);
    }

  } catch (error) {
    console.error('❌ Test suite error:', error);
    results.errors.push(error.message);
  }

  // Print results summary
  console.log('\n📊 Security Test Results');
  console.log('========================');
  console.log(`Total tests: ${results.tests.length}`);
  console.log(`Passed: ${results.passed}`);
  console.log(`Failed: ${results.failed}`);
  console.log(`Success rate: ${((results.passed / results.tests.length) * 100).toFixed(1)}%`);

  if (results.errors.length > 0) {
    console.log('\nErrors encountered:');
    results.errors.forEach(error => console.log(`  ❌ ${error}`));
  }

  if (results.failed === 0) {
    console.log('\n🎉 All security tests passed! Your setup looks good.');
  } else {
    console.log('\n⚠️  Some tests failed. Review the policies and try again.');
  }

  return results;
};

/**
 * Test multiplayer game flow with two different users
 * This simulates the actual game creation and joining process
 */
export const testMultiplayerFlow = async () => {
  console.log('🎮 Testing Complete Multiplayer Flow...');
  console.log('======================================');

  try {
    // Player 1: Create game
    console.log('\n👤 Player 1: Creating game...');
    await ensureAnonSession();
    const { data: { user: user1 } } = await supabase.auth.getUser();
    console.log(`Player 1 ID: ${user1.id}`);

    const { data: game, error: gameError } = await supabase
      .from('games')
      .insert({ owner_id_1: user1.id })
      .select()
      .single();

    if (gameError) throw gameError;
    console.log(`✅ Game created: ${game.id}`);

    // Player 1: Create player entry
    const { error: p1Error } = await supabase
      .from('players')
      .insert({ game_id: game.id, slot: 1, auth_id: user1.id });

    if (p1Error) throw p1Error;
    console.log('✅ Player 1 entry created');

    console.log('\n🔗 Game link would be: ' + window.location.origin + `/join/${game.id}`);
    console.log('📝 To complete this test, open the link in a different browser/incognito window');
    console.log('   This will simulate Player 2 joining the game');

    return { gameId: game.id, player1Id: user1.id };

  } catch (error) {
    console.error('❌ Multiplayer flow test failed:', error);
    throw error;
  }
};

// Make functions available globally for browser console
if (typeof window !== 'undefined') {
  window.testPlayersTableSecurity = testPlayersTableSecurity;
  window.testMultiplayerFlow = testMultiplayerFlow;
}