import { useEffect, useState } from 'react';
import { useNavigation } from 'react-router-dom';

/**
 * Custom hook for managing loading state.
 * @returns {Object} loading - The loading state
 */
const useLoading = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState<boolean>(false);

  /**
   * Manages loading state based on navigation state.
   *
   * @function useEffect
   * @description Resets loading state when navigation is complete
   */
  useEffect(() => {
    let timeoutId;
    if (navigation.state === 'idle') {
      timeoutId = setTimeout(() => setLoading(false), 250);
    } else if (navigation.state === 'loading') {
      clearTimeout(timeoutId);
      setLoading(true);
    }
  }, [navigation.state]);

  return { loading, setLoading };
};

export default useLoading;
