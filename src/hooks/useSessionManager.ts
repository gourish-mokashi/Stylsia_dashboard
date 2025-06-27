import { useEffect, useCallback } from 'react';
import { useAdminAuth } from '../contexts/AdminAuthContext';

interface UseSessionManagerOptions {
  warningThreshold?: number; // Minutes before expiry to show warning
  onSessionWarning?: () => void;
  onSessionExpired?: () => void;
  autoRefresh?: boolean;
}

export function useSessionManager(options: UseSessionManagerOptions = {}) {
  const {
    warningThreshold = 5,
    onSessionWarning,
    onSessionExpired,
    autoRefresh = true
  } = options;

  const { sessionExpiry, refreshSession, isSessionValid, signOut } = useAdminAuth();

  const checkSessionStatus = useCallback(() => {
    if (!sessionExpiry) return;

    const now = new Date();
    const timeLeft = sessionExpiry.getTime() - now.getTime();
    const minutesLeft = Math.floor(timeLeft / (1000 * 60));

    // Session expired
    if (timeLeft <= 0 || !isSessionValid()) {
      onSessionExpired?.();
      signOut();
      return;
    }

    // Session expiring soon
    if (minutesLeft <= warningThreshold) {
      onSessionWarning?.();
      
      // Auto-refresh if enabled
      if (autoRefresh) {
        refreshSession();
      }
    }
  }, [sessionExpiry, isSessionValid, warningThreshold, onSessionWarning, onSessionExpired, autoRefresh, refreshSession, signOut]);

  useEffect(() => {
    if (!sessionExpiry) return;

    // Check immediately
    checkSessionStatus();

    // Set up periodic checks
    const interval = setInterval(checkSessionStatus, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [checkSessionStatus, sessionExpiry]);

  return {
    checkSessionStatus,
    refreshSession,
    isSessionValid
  };
}