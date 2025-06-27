import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { SupportRequestRepository, DatabaseError } from '../lib/database';
import type { DatabaseSupportRequest, SupportRequestWithBrand } from '../types/database';

interface UseSupportRequestsReturn {
  supportRequests: SupportRequestWithBrand[];
  loading: boolean;
  error: string | null;
  createSupportRequest: (request: {
    subject: string;
    description: string;
    priority: 'low' | 'medium' | 'high';
    has_attachment: boolean;
    attachment_url?: string;
  }) => Promise<DatabaseSupportRequest>;
  refreshData: () => Promise<void>;
}

export function useSupportRequests(): UseSupportRequestsReturn {
  const { user } = useAuth();
  const [supportRequests, setSupportRequests] = useState<SupportRequestWithBrand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSupportRequests = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      setError(null);
      
      const requests = await SupportRequestRepository.getByBrandId(user.id);
      setSupportRequests(requests);
    } catch (err) {
      console.error('Failed to fetch support requests:', err);
      
      if (err instanceof DatabaseError) {
        setError(err.message);
      } else {
        setError('Failed to load support requests. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  const createSupportRequest = useCallback(async (request: {
    subject: string;
    description: string;
    priority: 'low' | 'medium' | 'high';
    has_attachment: boolean;
    attachment_url?: string;
  }): Promise<DatabaseSupportRequest> => {
    if (!user?.id) {
      throw new Error('User not authenticated');
    }

    try {
      const newRequest = await SupportRequestRepository.create({
        brand_id: user.id,
        subject: request.subject,
        description: request.description,
        priority: request.priority,
        status: 'new',
        has_attachment: request.has_attachment,
        attachment_url: request.attachment_url,
      });
      
      // Refresh the list after creating a new request
      fetchSupportRequests();
      
      return newRequest;
    } catch (err) {
      console.error('Failed to create support request:', err);
      
      if (err instanceof DatabaseError) {
        throw new Error(err.message);
      } else {
        throw new Error('Failed to create support request. Please try again.');
      }
    }
  }, [user?.id, fetchSupportRequests]);

  const refreshData = useCallback(async () => {
    setLoading(true);
    await fetchSupportRequests();
  }, [fetchSupportRequests]);

  useEffect(() => {
    fetchSupportRequests();
  }, [fetchSupportRequests]);

  return {
    supportRequests,
    loading,
    error,
    createSupportRequest,
    refreshData,
  };
}