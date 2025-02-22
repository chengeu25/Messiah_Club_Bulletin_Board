import { useEffect, useState } from 'react';
import { useNavigation } from 'react-router-dom';

/**
 * Custom hook for managing loading state.
 * @returns {Object} loading - The loading state
 */
const useLoading = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState<boolean>(false);
  const [debouncedLoading, setDebouncedLoading] = useState<boolean>(false);

  /**
   * Manages loading state based on navigation state.
   *
   * @function useEffect
   * @description Resets loading state when navigation is complete
   */
  useEffect(() => {
    if (navigation.state === 'loading') {
      setLoading(true);
    } else if (navigation.state === 'idle') {
      setLoading(false);
    }
  }, [navigation.state]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedLoading(loading);
    }, 200); // Adjust the debounce delay as needed

    return () => {
      clearTimeout(handler);
    };
  }, [loading]);

  return { loading: debouncedLoading, setLoading };
};

export default useLoading;
