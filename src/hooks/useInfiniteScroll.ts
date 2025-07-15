import { useState, useEffect, useCallback, useRef } from 'react';

interface UseInfiniteScrollProps {
  hasNextPage: boolean;
  loading: boolean;
  loadMore: () => void;
  threshold?: number;
}

export function useInfiniteScroll({ hasNextPage, loading, loadMore, threshold = 100 }: UseInfiniteScrollProps) {
  const [isFetching, setIsFetching] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const targetRef = useRef<HTMLDivElement | null>(null);

  const handleIntersection = useCallback((entries: IntersectionObserverEntry[]) => {
    const target = entries[0];
    if (target.isIntersecting && hasNextPage && !loading && !isFetching) {
      setIsFetching(true);
      loadMore();
    }
  }, [hasNextPage, loading, loadMore, isFetching]);

  useEffect(() => {
    const target = targetRef.current;
    if (!target) return;

    observerRef.current = new IntersectionObserver(handleIntersection, {
      root: null,
      rootMargin: `${threshold}px`,
      threshold: 0.1,
    });

    observerRef.current.observe(target);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [handleIntersection, threshold]);

  useEffect(() => {
    if (!loading) {
      setIsFetching(false);
    }
  }, [loading]);

  return { targetRef, isFetching };
}
