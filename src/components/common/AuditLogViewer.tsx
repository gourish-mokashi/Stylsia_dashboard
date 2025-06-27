import React, { useState, useEffect } from 'react';
import { Clock, User, FileText, Search, Filter, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import Button from '../ui/Button';
import { supabase } from '../../lib/supabase';

interface AuditLog {
  id: string;
  user_id: string;
  user_email: string;
  action: string;
  table_name: string;
  record_id: string;
  timestamp: string;
  details: any;
}

interface AuditLogViewerProps {
  tableName?: string;
  recordId?: string;
  limit?: number;
  showFilters?: boolean;
  title?: string;
  onClose?: () => void;
}

export default function AuditLogViewer({
  tableName,
  recordId,
  limit = 50,
  showFilters = true,
  title = 'Audit Logs',
  onClose
}: AuditLogViewerProps) {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(limit);
  
  // Filters
  const [filters, setFilters] = useState({
    startDate: tableName ? null : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    userId: null as string | null,
    action: null as string | null,
    table: tableName || null,
  });

  const fetchLogs = async () => {
    setLoading(true);
    setError(null);
    
    try {
      let query;
      
      if (tableName && recordId) {
        // Fetch logs for a specific record
        const { data, error } = await supabase.rpc('get_record_audit_history', {
          table_name: tableName,
          record_id: recordId,
          limit_count: pageSize
        });
        
        if (error) throw error;
        query = { data, count: data.length };
      } else {
        // Fetch filtered logs
        const offset = (page - 1) * pageSize;
        
        const { data, error } = await supabase.rpc('get_audit_logs', {
          start_date: filters.startDate ? new Date(filters.startDate).toISOString() : null,
          end_date: filters.endDate ? new Date(filters.endDate + 'T23:59:59').toISOString() : null,
          user_id: filters.userId,
          action_filter: filters.action,
          table_filter: filters.table,
          limit_count: pageSize,
          offset_count: offset
        });
        
        if (error) throw error;
        
        // Get total count from the first row
        const totalCount = data.length > 0 ? data[0].total_count : 0;
        setTotalCount(totalCount);
        
        query = { data, count: totalCount };
      }
      
      setLogs(query.data || []);
    } catch (err) {
      console.error('Error fetching audit logs:', err);
      setError('Failed to load audit logs. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [tableName, recordId, page, pageSize, filters]);

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
    setPage(1); // Reset to first page when filters change
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'INSERT':
        return 'bg-green-100 text-green-800';
      case 'UPDATE':
        return 'bg-blue-100 text-blue-800';
      case 'DELETE':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const renderDetails = (details: any) => {
    if (!details) return null;
    
    try {
      // For updates, show changes
      if (typeof details === 'object' && Object.keys(details).length > 0) {
        return (
          <div className="mt-2 text-xs">
            <div className="bg-gray-50 p-2 rounded-lg max-h-32 overflow-y-auto">
              {Object.entries(details).map(([key, value]: [string, any]) => (
                <div key={key} className="mb-1">
                  <span className="font-medium">{key}:</span>{' '}
                  {value.old !== undefined && value.new !== undefined ? (
                    <>
                      <span className="line-through text-red-600">{JSON.stringify(value.old)}</span>
                      {' → '}
                      <span className="text-green-600">{JSON.stringify(value.new)}</span>
                    </>
                  ) : (
                    <span>{JSON.stringify(value)}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      }
    } catch (e) {
      return <div className="text-xs text-gray-500">Unable to display details</div>;
    }
    
    return null;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        {onClose && (
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
        )}
      </div>
      
      {/* Filters */}
      {showFilters && (
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
              <div className="flex space-x-2">
                <input
                  type="date"
                  value={filters.startDate || ''}
                  onChange={(e) => handleFilterChange('startDate', e.target.value || null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
                <span className="self-center">to</span>
                <input
                  type="date"
                  value={filters.endDate || ''}
                  onChange={(e) => handleFilterChange('endDate', e.target.value || null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Action</label>
              <select
                value={filters.action || ''}
                onChange={(e) => handleFilterChange('action', e.target.value || null)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="">All Actions</option>
                <option value="INSERT">Insert</option>
                <option value="UPDATE">Update</option>
                <option value="DELETE">Delete</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Table</label>
              <select
                value={filters.table || ''}
                onChange={(e) => handleFilterChange('table', e.target.value || null)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                disabled={!!tableName}
              >
                <option value="">All Tables</option>
                <option value="brands">Brands</option>
                <option value="products">Products</option>
                <option value="support_requests">Support Requests</option>
              </select>
            </div>
          </div>
          
          <div className="mt-3 flex justify-end">
            <Button
              size="sm"
              icon={RefreshCw}
              onClick={fetchLogs}
              loading={loading}
            >
              Refresh
            </Button>
          </div>
        </div>
      )}
      
      {/* Error message */}
      {error && (
        <div className="p-4 bg-red-50 border-b border-red-200">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}
      
      {/* Logs list */}
      <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin h-8 w-8 border-2 border-primary-500 border-t-transparent rounded-full mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading audit logs...</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="p-8 text-center">
            <FileText className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600">No audit logs found</p>
            {showFilters && (
              <p className="text-sm text-gray-500 mt-1">Try adjusting your filters</p>
            )}
          </div>
        ) : (
          logs.map((log) => (
            <div key={log.id} className="p-4 hover:bg-gray-50">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getActionColor(log.action)}`}>
                      {log.action}
                    </span>
                    <span className="text-sm font-medium text-gray-900">
                      {log.table_name}
                    </span>
                    <span className="text-xs text-gray-500">
                      ID: {log.record_id.substring(0, 8)}...
                    </span>
                  </div>
                  
                  <div className="mt-1 flex items-center text-xs text-gray-500 space-x-3">
                    <div className="flex items-center">
                      <User className="h-3 w-3 mr-1" />
                      <span>{log.user_email || 'Unknown user'}</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      <span>{formatTimestamp(log.timestamp)}</span>
                    </div>
                  </div>
                  
                  {renderDetails(log.details)}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      
      {/* Pagination */}
      {!tableName && !recordId && totalCount > pageSize && (
        <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, totalCount)} of {totalCount} logs
          </div>
          
          <div className="flex space-x-2">
            <Button
              size="sm"
              variant="outline"
              disabled={page === 1}
              onClick={() => setPage(p => Math.max(1, p - 1))}
              icon={ChevronLeft}
            >
              Previous
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={page * pageSize >= totalCount}
              onClick={() => setPage(p => p + 1)}
              icon={ChevronRight}
              iconPosition="right"
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}