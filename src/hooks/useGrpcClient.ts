import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface GrpcCallOptions {
  service: string;
  method: string;
  payload?: unknown;
}

interface GrpcResponse<T = unknown> {
  data: T | null;
  error: string | null;
}

export function useGrpcClient() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const call = useCallback(async <T = unknown>(
    options: GrpcCallOptions
  ): Promise<GrpcResponse<T>> => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('grpc-proxy', {
        body: {
          service: options.service,
          method: options.method,
          payload: options.payload,
        },
      });

      if (fnError) {
        setError(fnError.message);
        return { data: null, error: fnError.message };
      }

      return { data: data as T, error: null };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      return { data: null, error: message };
    } finally {
      setLoading(false);
    }
  }, []);

  return { call, loading, error };
}
