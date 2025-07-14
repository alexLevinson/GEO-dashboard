import { useState, useEffect, useCallback } from 'react';
import { supabase, ChatGPTScrape } from '../lib/supabase';

export const useCustomers = () => {
  const [customers, setCustomers] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const { data, error } = await supabase
          .from('chatgpt_scrapes')
          .select('customer');

        if (error) throw error;

        const uniqueCustomers = [...new Set(data.map(row => row.customer))].sort();
        setCustomers(uniqueCustomers);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch customers');
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, []);

  return { customers, loading, error };
};

export const useQueries = (customer: string | null) => {
  const [queries, setQueries] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!customer) {
      setQueries([]);
      return;
    }

    const fetchQueries = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('chatgpt_scrapes')
          .select('query')
          .eq('customer', customer);

        if (error) throw error;

        const uniqueQueries = [...new Set(data.map(row => row.query))].sort();
        setQueries(uniqueQueries);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch queries');
      } finally {
        setLoading(false);
      }
    };

    fetchQueries();
  }, [customer]);

  return { queries, loading, error };
};

export const useData = (customer: string | null, query: string | null) => {
  const [data, setData] = useState<ChatGPTScrape[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!customer || !query) {
      setData([]);
      return;
    }

    setLoading(true);
    try {
      const { data: result, error } = await supabase
        .from('chatgpt_scrapes')
        .select('*')
        .eq('customer', customer)
        .eq('query', query)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setData(result || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  }, [customer, query]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
};

export const useMetrics = (data: ChatGPTScrape[]) => {
  const [metrics, setMetrics] = useState({
    customerMentionedPct: 0,
    customerTopRankedPct: 0,
    totalRecords: 0,
  });

  useEffect(() => {
    if (!data.length) {
      setMetrics({ customerMentionedPct: 0, customerTopRankedPct: 0, totalRecords: 0 });
      return;
    }

    const pastMonth = new Date();
    pastMonth.setDate(pastMonth.getDate() - 30);

    const pastMonthData = data.filter(row => 
      new Date(row.created_at) >= pastMonth
    );

    const customerMentioned = pastMonthData.filter(row => row.customer_mentioned).length;
    const customerTopRanked = pastMonthData.filter(row => row.customer_top_ranked).length;

    setMetrics({
      customerMentionedPct: pastMonthData.length > 0 ? (customerMentioned / pastMonthData.length) * 100 : 0,
      customerTopRankedPct: pastMonthData.length > 0 ? (customerTopRanked / pastMonthData.length) * 100 : 0,
      totalRecords: pastMonthData.length,
    });
  }, [data]);

  return metrics;
};