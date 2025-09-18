import { supabase } from "./supabaseClient";

async function joinGame(gameId) {
    // Check if slot 2 available
    const { data: existing } = await supabase
      .from("players")
      .select("*")
      .eq("game_id", gameId);
  
    if (!existing.find(p => p.slot === 2)) {
      await supabase.from("players").insert({ game_id: gameId, slot: 2 });
    }
  
    // Update game status
    await supabase.from("games")
      .update({ status: "playing" })
      .eq("id", gameId);
  }
  
  export default joinGame