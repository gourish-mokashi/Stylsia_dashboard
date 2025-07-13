import React, { createContext, useContext, useEffect, useState } from 'react';

interface MaintenanceContextType {
  maintenanceMode: boolean;
  setMaintenanceMode: (enabled: boolean) => void;
  loading: boolean;
}

const MaintenanceContext = createContext<MaintenanceContextType | undefined>(undefined);

export function MaintenanceProvider({ children }: { children: React.ReactNode }) {
  const [maintenanceMode, setMaintenanceModeState] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchMaintenanceStatus = () => {
    try {
      // Get from localStorage only
      const localMaintenance = localStorage.getItem('maintenance_mode');
      setMaintenanceModeState(localMaintenance === 'true');
    } catch (error) {
      console.error('Error fetching maintenance status:', error);
      setMaintenanceModeState(false);
    } finally {
      setLoading(false);
    }
  };

  const setMaintenanceMode = (enabled: boolean) => {
    try {
      setMaintenanceModeState(enabled);
      
      // Save to localStorage only
      localStorage.setItem('maintenance_mode', enabled.toString());
      
      console.log(`Maintenance mode ${enabled ? 'enabled' : 'disabled'}`);
    } catch (error) {
      console.error('Error setting maintenance mode:', error);
    }
  };

  useEffect(() => {
    fetchMaintenanceStatus();
  }, []);

  return (
    <MaintenanceContext.Provider 
      value={{ 
        maintenanceMode, 
        setMaintenanceMode, 
        loading
      }}
    >
      {children}
    </MaintenanceContext.Provider>
  );
}

export function useMaintenanceMode() {
  const context = useContext(MaintenanceContext);
  if (context === undefined) {
    throw new Error('useMaintenanceMode must be used within a MaintenanceProvider');
  }
  return context;
}
