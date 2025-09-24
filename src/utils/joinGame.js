import { supabase, ensureAnonSession } from "./supabaseClient";

async function joinGame(gameId) {
  // Ensure we have an auth session (anonymous OK)
  await ensureAnonSession();

  const { data: { user }, error: userErr } = await supabase.auth.getUser();
  if (userErr) throw userErr;

  // Check existing players for this game
  const { data: existing, error: fetchErr } = await supabase
    .from("players")
    .select("id, slot, auth_id")
    .eq("game_id", gameId);
  if (fetchErr) throw fetchErr;

  const p2 = (existing || []).find((p) => p.slot === 2);

  if (!p2) {
    // Insert player 2 with current user's auth id
    const { error: insertErr } = await supabase
      .from("players")
      .insert({ game_id: gameId, slot: 2, auth_id: user.id });
    if (insertErr) throw insertErr;
  } else if (!p2.auth_id) {
    // If slot 2 exists but has no user bound yet, bind it
    const { error: updateP2Err } = await supabase
      .from("players")
      .update({ auth_id: user.id })
      .eq("id", p2.id);
    if (updateP2Err) throw updateP2Err;
  }

  const { error: updateGameErr } = await supabase
    .from("games")
    .update({ owner_id_2: user.id, status: "playing" })
    .eq("id", gameId)
    .is("owner_id_2", null);
  if (updateGameErr && updateGameErr.code !== 'PGRST116') {
    // PGRST116 can be returned when no rows match due to the .is(null) filter; that's fine
    throw updateGameErr;
  }
}

export default joinGame;