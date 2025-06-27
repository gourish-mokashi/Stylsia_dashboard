import React, { useState, useEffect } from 'react';
import { Clock, AlertTriangle, RefreshCw, LogOut } from 'lucide-react';
import { useAdminAuth } from '../../contexts/AdminAuthContext';
import Button from '../ui/Button';

interface SessionWarningModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExtend: () => void;
  onSignOut: () => void;
  timeLeft: number; // in milliseconds
}

export default function SessionWarningModal({
  isOpen,
  onClose,
  onExtend,
  onSignOut,
  timeLeft
}: SessionWarningModalProps) {
  const [countdown, setCountdown] = useState(timeLeft);
  const [extending, setExtending] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    setCountdown(timeLeft);
    
    const interval = setInterval(() => {
      setCountdown(prev => {
        const newTime = prev - 1000;
        if (newTime <= 0) {
          onSignOut();
          return 0;
        }
        return newTime;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, timeLeft, onSignOut]);

  const handleExtend = async () => {
    setExtending(true);
    try {
      await onExtend();
      onClose();
    } catch (error) {
      console.error('Failed to extend session:', error);
    } finally {
      setExtending(false);
    }
  };

  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / (1000 * 60));
    const seconds = Math.floor((ms % (1000 * 60)) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-amber-100 sm:mx-0 sm:h-10 sm:w-10">
                <AlertTriangle className="h-6 w-6 text-amber-600" />
              </div>
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Session Expiring Soon
                </h3>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">
                    Your admin session will expire in{' '}
                    <span className="font-mono font-bold text-amber-600">
                      {formatTime(countdown)}
                    </span>
                    . Would you like to extend your session?
                  </p>
                </div>
                
                <div className="mt-4 bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Clock className="h-4 w-4" />
                    <span>For security, sessions automatically expire after periods of inactivity.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <Button
              onClick={handleExtend}
              loading={extending}
              icon={RefreshCw}
              className="w-full sm:w-auto sm:ml-3"
            >
              {extending ? 'Extending...' : 'Extend Session'}
            </Button>
            <Button
              variant="outline"
              onClick={onSignOut}
              icon={LogOut}
              className="mt-3 w-full sm:mt-0 sm:w-auto text-red-600 border-red-300 hover:bg-red-50"
            >
              Sign Out Now
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}