import { supabase, ensureAnonSession } from "./supabaseClient";

async function joinGame(gameId) {
  // Ensure we have an auth session (anonymous OK)
  await ensureAnonSession();

  const { data: game, error: gameErr } = await supabase
    .from('games')
    .select('id, owner_id_1, owner_id_2, status')
    .eq('id', gameId)
    .single();
  if (gameErr) throw gameErr;

  if (game.owner_id_1 && game.owner_id_2) {
    return { role: 'viewer'};
  }

    // Get current user
    const { data: { user }, error: userErr } = await supabase.auth.getUser();
    if (userErr) throw userErr;

    const { error: insertErr } = await supabase
      .from('players')
      .insert({ game_id: gameId, slot: 2, auth_id: user.id });
    if (insertErr) throw insertErr;

  return { role: 'player', slot: 2 };
}

export default joinGame;