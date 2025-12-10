import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Bid } from '../types';

export function useBids() {
  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBids = async () => {
    try {
      setLoading(true);
      const data = await api.getBids();
      setBids(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBids();
  }, []);

  return { bids, loading, error, refetch: fetchBids };
}