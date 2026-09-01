import { useState, useEffect } from "react";

interface UseResultReturn<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

interface UseResultOptions {
  autoFetchFirstTime?: boolean;
}

export default function useResult<T>(
  initialValue: T | (() => T | Promise<T>),
  config?: UseResultOptions
): UseResultReturn<T> {
  const { autoFetchFirstTime = true } = config ?? {};

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [fetchKey, setFetchKey] = useState(0);

  useEffect(() => {
    // skip only the very first fetch
    if (fetchKey === 0 && !autoFetchFirstTime) {
      return;
    }

    let cancelled = false;

    const loadResult = async (): Promise<void> => {
      setLoading(true);
      setError(null);

      try {
        const value =
          typeof initialValue === "function"
            ? await (initialValue as () => T | Promise<T>)()
            : initialValue;

        if (!cancelled) {
          setData(value);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err : new Error(String(err)));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadResult();

    return () => {
      cancelled = true;
    };
  }, [initialValue, fetchKey, autoFetchFirstTime]);

  const refetch = (): void => {
    setFetchKey((prev) => prev + 1);
  };

  return { data, loading, error, refetch };
}
