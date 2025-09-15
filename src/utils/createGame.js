import { supabase } from "./supabaseClient";
import useStore from "./store";
async function createGame() {
    const { data: game, error } = await supabase
      .from("games")
      .insert({})
      .select()
      .single();
  
    if (error) throw error;
  
    // Add player 1
    await supabase.from("players").insert({ game_id: game.id, slot: 1 });
    useStore.setState({gameId: game.id});
    return game.id;
  }
  
  export default createGame