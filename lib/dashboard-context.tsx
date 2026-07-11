'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Camera, Person, Alert, FootfallDataPoint, AnalyticsSummary } from './types';

interface DashboardContextType {
  cameras: Camera[];
  people: Person[];
  alerts: Alert[];
  footfallData: FootfallDataPoint[];
  summary: AnalyticsSummary;
  addCamera: (camera: Omit<Camera, 'id' | 'status' | 'personCount' | 'order'>) => void;
  editCamera: (id: string, camera: Partial<Camera>) => void;
  deleteCamera: (id: string) => void;
  enrollPerson: (person: Omit<Person, 'id' | 'enrolledAt' | 'matchCount' | 'alertsMuted' | 'matchThreshold'>) => void;
  deletePerson: (id: string) => void;
  toggleMutePerson: (id: string) => void;
  markAlertRead: (id: string) => void;
  markAllAlertsRead: () => void;
  dismissAlert: (id: string) => void;
  purgeAllData: () => void;
  activeToast: Alert | null;
  clearToast: () => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

// Base hours for analytics
const HOURS_AXIS = Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, '0')}:00`);

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [people, setPeople] = useState<Person[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [footfallData, setFootfallData] = useState<FootfallDataPoint[]>([]);
  const [activeToast, setActiveToast] = useState<Alert | null>(null);

  // 1. Initial Load from LocalStorage
  useEffect(() => {
    const isInitialized = localStorage.getItem('cctv-initialized-fresh-v2');
    if (!isInitialized) {
      localStorage.removeItem('cctv-cameras');
      localStorage.removeItem('cctv-people');
      localStorage.removeItem('cctv-alerts');
      localStorage.removeItem('cctv-footfall');
      localStorage.setItem('cctv-initialized-fresh-v2', 'true');
    }

    const savedCams = localStorage.getItem('cctv-cameras');
    const savedPeople = localStorage.getItem('cctv-people');
    const savedAlerts = localStorage.getItem('cctv-alerts');
    const savedFootfall = localStorage.getItem('cctv-footfall');

    if (savedCams) setCameras(JSON.parse(savedCams));
    if (savedPeople) setPeople(JSON.parse(savedPeople));
    if (savedAlerts) setAlerts(JSON.parse(savedAlerts));
    
    if (savedFootfall) {
      setFootfallData(JSON.parse(savedFootfall));
    } else {
      // Initialize empty footfall dataset for 24 hours
      const initialData: FootfallDataPoint[] = HOURS_AXIS.map((hour, idx) => ({
        hour,
        timestamp: idx,
      }));
      setFootfallData(initialData);
    }
  }, []);

  // 2. Persist to LocalStorage helper
  const save = (key: string, data: any) => {
    localStorage.setItem(key, JSON.stringify(data));
  };

  // 3. Actions
  const addCamera = (data: Omit<Camera, 'id' | 'status' | 'personCount' | 'order'>) => {
    const newCam: Camera = {
      ...data,
      id: `cam-${Date.now()}`,
      status: 'online',
      personCount: 0,
      order: cameras.length,
    };
    const next = [...cameras, newCam];
    setCameras(next);
    save('cctv-cameras', next);

    // Update footfall data structure to include this camera
    const nextFootfall = footfallData.map(dp => ({
      ...dp,
      [newCam.name]: 0,
    }));
    setFootfallData(nextFootfall);
    save('cctv-footfall', nextFootfall);
  };

  const editCamera = (id: string, data: Partial<Camera>) => {
    const next = cameras.map((c) => (c.id === id ? { ...c, ...data } : c));
    setCameras(next);
    save('cctv-cameras', next);
  };

  const deleteCamera = (id: string) => {
    const next = cameras.filter((c) => c.id !== id);
    setCameras(next);
    save('cctv-cameras', next);
  };

  const enrollPerson = (data: Omit<Person, 'id' | 'enrolledAt' | 'matchCount' | 'alertsMuted' | 'matchThreshold'>) => {
    const newPerson: Person = {
      ...data,
      id: `person-${Date.now()}`,
      enrolledAt: new Date().toISOString(),
      matchCount: 0,
      alertsMuted: false,
      matchThreshold: 0.75,
    };
    const next = [...people, newPerson];
    setPeople(next);
    save('cctv-people', next);
  };

  const deletePerson = (id: string) => {
    const next = people.filter((p) => p.id !== id);
    setPeople(next);
    save('cctv-people', next);
  };

  const toggleMutePerson = (id: string) => {
    const next = people.map((p) => (p.id === id ? { ...p, alertsMuted: !p.alertsMuted } : p));
    setPeople(next);
    save('cctv-people', next);
  };

  const markAlertRead = (id: string) => {
    const next = alerts.map((a) => (a.id === id ? { ...a, read: true } : a));
    setAlerts(next);
    save('cctv-alerts', next);
  };

  const markAllAlertsRead = () => {
    const next = alerts.map((a) => ({ ...a, read: true }));
    setAlerts(next);
    save('cctv-alerts', next);
  };

  const dismissAlert = (id: string) => {
    const next = alerts.filter((a) => a.id !== id);
    setAlerts(next);
    save('cctv-alerts', next);
  };

  const purgeAllData = () => {
    setCameras([]);
    setPeople([]);
    setAlerts([]);
    const freshFootfall = HOURS_AXIS.map((hour, idx) => ({ hour, timestamp: idx }));
    setFootfallData(freshFootfall);

    localStorage.removeItem('cctv-cameras');
    localStorage.removeItem('cctv-people');
    localStorage.removeItem('cctv-alerts');
    localStorage.removeItem('cctv-footfall');
  };

  const clearToast = () => setActiveToast(null);

  // 4. Real-time Event Simulation
  useEffect(() => {
    if (cameras.length === 0) return;

    // Simulate detection updates and random alerts every 10 seconds
    const interval = setInterval(() => {
      // Pick random camera
      const randomCamIndex = Math.floor(Math.random() * cameras.length);
      const targetCam = cameras[randomCamIndex];
      if (targetCam.status !== 'online') return;

      // Update person count randomly for this camera (0 to 8)
      const count = Math.floor(Math.random() * 9);
      setCameras(prev => {
        const next = prev.map(c => c.id === targetCam.id ? { ...c, personCount: count } : c);
        save('cctv-cameras', next);
        return next;
      });

      // Update footfall analytics data for the current hour
      const currentHour = new Date().getHours();
      setFootfallData(prev => {
        const next = prev.map(dp => {
          if (dp.timestamp === currentHour) {
            const currentVal = (dp[targetCam.name] as number) || 0;
            return {
              ...dp,
              [targetCam.name]: Math.max(currentVal, count),
            };
          }
          return dp;
        });
        save('cctv-footfall', next);
        return next;
      });

      // 30% chance to generate a watchlist alert if there are enrolled people
      if (people.length > 0 && Math.random() < 0.35) {
        const randomPerson = people[Math.floor(Math.random() * people.length)];
        
        // Skip if muted
        if (randomPerson.alertsMuted) return;

        const newAlert: Alert = {
          id: `alert-${Date.now()}`,
          personId: randomPerson.id,
          personName: randomPerson.name,
          personPhoto: randomPerson.photos[0],
          cameraId: targetCam.id,
          cameraName: targetCam.name,
          timestamp: new Date().toISOString(),
          confidence: 0.76 + Math.random() * 0.22,
          read: false,
        };

        // Prepend alert
        setAlerts(prev => {
          const next = [newAlert, ...prev].slice(0, 100); // Keep last 100 alerts
          save('cctv-alerts', next);
          return next;
        });

        // Increment person match count
        setPeople(prev => {
          const next = prev.map(p => p.id === randomPerson.id ? { ...p, matchCount: p.matchCount + 1 } : p);
          save('cctv-people', next);
          return next;
        });

        // Trigger real-time Toast Notification
        setActiveToast(newAlert);
      }
    }, 12000);

    return () => clearInterval(interval);
  }, [cameras, people]);

  // 5. Compute dynamic analytics summaries
  const onlineCams = cameras.filter((c) => c.status === 'online').length;
  const currentHour = new Date().getHours();
  const totalFootfall = footfallData.reduce((acc, dp) => {
    let sum = 0;
    cameras.forEach(c => {
      sum += (dp[c.name] as number) || 0;
    });
    return acc + sum;
  }, 0);

  const summary: AnalyticsSummary = {
    totalFootfall,
    footfallChange: cameras.length > 0 ? 5.8 : 0,
    peakHour: `${currentHour.toString().padStart(2, '0')}:00 – ${(currentHour + 1).toString().padStart(2, '0')}:00`,
    activeCameras: onlineCams,
    totalAlerts: alerts.length,
    alertsChange: alerts.length > 0 ? 12.2 : 0,
  };

  return (
    <DashboardContext.Provider
      value={{
        cameras,
        people,
        alerts,
        footfallData,
        summary,
        addCamera,
        editCamera,
        deleteCamera,
        enrollPerson,
        deletePerson,
        toggleMutePerson,
        markAlertRead,
        markAllAlertsRead,
        dismissAlert,
        purgeAllData,
        activeToast,
        clearToast,
      }}
    >
      {children}
      {/* Toast Notification Container */}
      {activeToast && (
        <ToastNotification alert={activeToast} onClose={clearToast} />
      )}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (!context) throw new Error('useDashboard must be used within a DashboardProvider');
  return context;
}

// ─── Toast Notification Component ─────────────────────
import { BellRing, X } from 'lucide-react';

function ToastNotification({ alert, onClose }: { alert: Alert; onClose: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [alert, onClose]);

  return (
    <div
      className="fixed bottom-6 right-6 z-[99999] toast-enter max-w-sm w-full"
      onClick={onClose}
    >
      <div 
        className="glass-panel p-4 flex items-start gap-3 cursor-pointer"
        style={{
          borderLeft: '4px solid var(--accent-lime)',
          background: 'rgba(20, 20, 28, 0.95)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-elevated)',
        }}
      >
        <div className="w-8 h-8 rounded-full bg-[var(--accent-lime)]/10 flex items-center justify-center text-[var(--accent-lime)] shrink-0">
          <BellRing size={16} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold uppercase tracking-wider text-[var(--accent-lime)] mb-0.5">
            Watchlist Match Alert
          </p>
          <p className="text-xs text-white">
            <span className="font-semibold">{alert.personName}</span> detected at{' '}
            <span className="font-semibold text-[var(--accent-cyan)]">{alert.cameraName}</span>
          </p>
          <span className="text-[10px] text-[var(--text-muted)]">
            {new Date(alert.timestamp).toLocaleTimeString()} · Confidence {Math.round(alert.confidence * 100)}%
          </span>
        </div>
        <button className="btn-ghost p-1 text-[var(--text-muted)] hover:text-white" onClick={onClose}>
          <X size={12} />
        </button>
      </div>
      <div className="toast-progress mt-1.5" style={{ animationDuration: '5000ms' }} />
    </div>
  );
}
