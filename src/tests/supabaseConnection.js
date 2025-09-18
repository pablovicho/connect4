import { useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';

function TestConnection() {
  useEffect(() => {
    async function testConnection() {
      try {
        const { data, error } = await supabase
          .from('games')
          .select('*')
          .limit(1);
        
        if (error) throw error;
        // console.log('Connection successful! Data:', data);
      } catch (error) {
        console.error('Connection failed:', error);
      }
    }
    
    testConnection();
  }, []);

  return <div>Testing connection...</div>;
}

export default TestConnection;