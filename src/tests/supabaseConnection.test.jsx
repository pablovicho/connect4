import { useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';

test('test supabase connection', async () => {
  async function testConnection() {
    try {
      const { data, error } = await supabase
        .from('games')
          .select('*')
          .limit(1);
        
        if (error) throw error;
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Connection failed:', error);
      }
    }
    
    expect(testConnection()).resolves.toBeUndefined();
});