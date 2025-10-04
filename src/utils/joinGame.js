import { supabase, ensureAnonSession } from "./supabaseClient";

async function joinGame(gameId) {
  await ensureAnonSession();

  const { data: { user }, error: userErr } = await supabase.auth.getUser();
  if (userErr) throw userErr;

  // Fetch game with owner_id_2 for viewer gating
  const { data: game, error: gameErr } = await supabase
    .from('games')
    .select('id, owner_id_2')
    .eq('id', gameId)
    .maybeSingle();
  if (gameErr) throw gameErr;
  if (!game) throw new Error('Game not found');

  // If another user already owns slot 2, route as viewer
  if (game.owner_id_2 && game.owner_id_2 !== user.id) {
    return { role: 'viewer' };
  }

  const { data: existing, error: existingErr } = await supabase
    .from('players')
    .select('game_id, slot, auth_id')
    .eq('game_id', gameId)
    .eq('slot', 2)
    .maybeSingle();
  if (existingErr) throw existingErr;

  // Helper to set owner_id_2 only if it is currently null
  const ensureOwner2 = async () => {
    const { error: setErr } = await supabase
      .from('games')
      .update({ owner_id_2: user.id })
      .eq('id', gameId)
      .is('owner_id_2', null);
    if (setErr) throw setErr;
  };

  if (existing && existing.auth_id === user.id) {
    // Ensure game owner is set for slot 2
    await ensureOwner2();
    return { role: 'player', slot: 2 };
  }
  if (existing && existing.auth_id && existing.auth_id !== user.id) {
    return { role: 'viewer' };
  }

  if (existing && !existing.auth_id) {
    const { error: claimErr } = await supabase
      .from('players')
      .update({ auth_id: user.id })
      .eq('game_id', gameId)
      .eq('slot', 2)
      .is('auth_id', null);

    if (claimErr) throw claimErr;
    await ensureOwner2();
    return { role: 'player', slot: 2 };
  }

  const tryInsert = async () => {
    const { error: insertErr } = await supabase
      .from('players')
      .insert({ game_id: gameId, slot: 2, auth_id: user.id });
    return insertErr;
  };

  let insertError = await tryInsert();
  if (insertError) {
    // Handle race: someone else might have inserted concurrently
    const isDup = insertError.code === '23505' ||
                  (typeof insertError.message === 'string' && insertError.message.includes('duplicate key value'));
    if (isDup) {
      // Re-read slot 2
      const { data: after, error: afterErr } = await supabase
        .from('players')
        .select('auth_id')
        .eq('game_id', gameId)
        .eq('slot', 2)
        .maybeSingle();
      if (afterErr) throw afterErr;
      if (after && after.auth_id === user.id) {
        await ensureOwner2();
        return { role: 'player', slot: 2 };
      }
      return { role: 'viewer' };
    }
    throw insertError;
  }

  // Insert succeeded: set owner2 if missing
  await ensureOwner2();
  return { role: 'player', slot: 2 };
}

export default joinGame;