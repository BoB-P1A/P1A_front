import { useState, useCallback } from 'react';
import { toast } from 'sonner';

interface UseApiOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
  successMessage?: string;
  errorMessage?: string;
}

/**
 * API 호출을 위한 커스텀 훅
 * 로딩, 에러 상태 관리 및 토스트 알림 제공
 */
export function useApi<T = any>(options: UseApiOptions = {}) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const execute = useCallback(
    async (apiCall: () => Promise<T>) => {
      setLoading(true);
      setError(null);

      try {
        const result = await apiCall();
        setData(result);
        
        if (options.successMessage) {
          toast.success(options.successMessage);
        }
        
        options.onSuccess?.(result);
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('API 요청 중 오류가 발생했습니다');
        setError(error);
        
        const errorMessage = options.errorMessage || error.message;
        toast.error(errorMessage);
        
        options.onError?.(error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [options]
  );

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    data,
    loading,
    error,
    execute,
    reset,
  };
}
