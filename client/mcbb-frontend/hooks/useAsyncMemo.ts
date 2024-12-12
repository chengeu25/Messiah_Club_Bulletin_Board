import { useEffect, useState } from 'react';

function useAsyncMemo(asyncCallback, dependencies) {
  const [value, setValue] = useState();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
}

export default useAsyncMemo;
