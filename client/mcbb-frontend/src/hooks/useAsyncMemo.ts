import { useEffect, useState } from 'react';

const useAsyncMemo = <T>(
  asyncCallback: () => Promise<T>,
  dependencies: any[]
) => {
  const [value, setValue] = useState<T | undefined>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true; // Track if the component is mounted

    setLoading(true);
    setError(null);

    asyncCallback()
      .then((result) => {
        if (isMounted) {
          setValue(result);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err);
          setLoading(false);
        }
      });

    return () => {
      isMounted = false; // Cleanup function to prevent state updates on unmounted component
    };
  }, dependencies); // Re-run the effect when dependencies change

  return { value, loading, error };
};

export default useAsyncMemo;
