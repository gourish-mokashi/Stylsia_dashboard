import { useState, useEffect, useCallback, useRef } from 'react';

interface UseInfiniteScrollProps {
  hasNextPage: boolean;
  loading: boolean;
  loadMore: () => void;
  threshold?: number;
  rootMargin?: string;
}

export function useInfiniteScroll({ 
  hasNextPage, 
  loading, 
  loadMore, 
  threshold = 0.1,
  rootMargin = '400px 0px' // Load 400px before reaching bottom
}: UseInfiniteScrollProps) {
  const [isFetching, setIsFetching] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const targetRef = useRef<HTMLDivElement | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastLoadTime = useRef<number>(0);

  const handleIntersection = useCallback((entries: IntersectionObserverEntry[]) => {
    const target = entries[0];
    const now = Date.now();
    
    // Prevent rapid successive calls (debounce 300ms)
    if (now - lastLoadTime.current < 300) return;
    
    if (target.isIntersecting && hasNextPage && !loading && !isFetching) {
      // Clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      // Immediate call for smooth experience
      setIsFetching(true);
      lastLoadTime.current = now;
      loadMore();
    }
  }, [hasNextPage, loading, loadMore, isFetching]);

  useEffect(() => {
    const target = targetRef.current;
    if (!target) return;

    // Disconnect existing observer
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    // Create new observer with optimized settings
    observerRef.current = new IntersectionObserver(handleIntersection, {
      root: null, // Use viewport as root
      rootMargin, // Load well before reaching bottom
      threshold, // Trigger when element is barely visible
    });

    observerRef.current.observe(target);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [handleIntersection, threshold, rootMargin]);

  useEffect(() => {
    if (!loading) {
      setIsFetching(false);
    }
  }, [loading]);

  return { targetRef, isFetching };
}
