import { supabase, ensureAnonSession } from "./supabaseClient";

async function joinGame(gameId) {
  await ensureAnonSession();

  const { data: { user }, error: userErr } = await supabase.auth.getUser();
  if (userErr) throw userErr;

  const { data: game, error: gameErr } = await supabase
    .from('games')
    .select('id')
    .eq('id', gameId)
    .single();
  if (gameErr) throw gameErr;
  if (!game) throw new Error('Game not found');

  const { data: existing, error: existingErr } = await supabase
    .from('players')
    .select('game_id, slot, auth_id')
    .eq('game_id', gameId)
    .eq('slot', 2)
    .maybeSingle();
  if (existingErr) throw existingErr;

  if (existing && existing.auth_id === user.id) {
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
    if (insertError.message && insertError.message.includes('duplicate key value')) {
      // Re-read slot 2
      const { data: after, error: afterErr } = await supabase
        .from('players')
        .select('auth_id')
        .eq('game_id', gameId)
        .eq('slot', 2)
        .single();
      if (afterErr) throw afterErr;
      if (after.auth_id === user.id) {
        return { role: 'player', slot: 2 };
      }
      return { role: 'viewer' };
    }
    throw insertError;
  }

  return { role: 'player', slot: 2 };
}

export default joinGame;