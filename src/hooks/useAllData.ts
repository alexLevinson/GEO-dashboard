import { useState, useEffect, useCallback } from 'react';
import { supabase, ChatGPTScrape } from '../lib/supabase';

export const useAllData = (customer: string | null) => {
  const [allData, setAllData] = useState<ChatGPTScrape[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAllData = useCallback(async () => {
    if (!customer) {
      setAllData([]);
      return;
    }

    setLoading(true);
    try {
      const { data: result, error } = await supabase
        .from('chatgpt_scrapes')
        .select('*')
        .eq('customer', customer)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setAllData(result || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch all data');
    } finally {
      setLoading(false);
    }
  }, [customer]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  return { allData, loading, error, refetch: fetchAllData };
};