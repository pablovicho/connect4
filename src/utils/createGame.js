import { supabase, ensureAnonSession } from "./supabaseClient";
import useStore from "./store";

async function createGame() {
  // Ensure we have an auth session (anonymous OK)
  await ensureAnonSession();

  const { data: { user }, error: userErr } = await supabase.auth.getUser();
  if (userErr) throw userErr;

  // Create game with owner_id_1 set
  const { data: game, error } = await supabase
    .from("games")
    .insert({ owner_id_1: user.id })
    .select()
    .single();

  if (error) throw error;

  // Add player 1; I use upsert to avoid duplicates on (game_id, slot)
  const { error: p1Err } = await supabase
    .from("players")
    .upsert({ game_id: game.id, slot: 1, auth_id: user.id }, { onConflict: "game_id,slot" });
  if (p1Err) throw p1Err;

  useStore.setState({ gameId: game.id });
  return game.id;
}

export default createGame;