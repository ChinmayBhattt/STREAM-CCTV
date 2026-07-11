export interface Camera {
  id: string;
  name: string;
  location: string;
  streamUrl: string;
  status: 'online' | 'offline' | 'reconnecting';
  personCount: number;
  order: number;
}

export interface Person {
  id: string;
  name: string;
  role: string;
  category: 'staff' | 'student' | 'member' | 'watchlist';
  notes: string;
  photos: string[];
  enrolledAt: string;
  matchCount: number;
  alertsMuted: boolean;
  matchThreshold: number;
}

export interface DetectionEvent {
  id: string;
  cameraId: string;
  cameraName: string;
  personId: string | null;
  personName: string | null;
  timestamp: string;
  confidence: number;
  boundingBox: { x: number; y: number; w: number; h: number };
  type: 'person' | 'face_match';
}

export interface Alert {
  id: string;
  personId: string;
  personName: string;
  personPhoto: string;
  cameraId: string;
  cameraName: string;
  timestamp: string;
  confidence: number;
  read: boolean;
}

export interface FootfallDataPoint {
  hour: string;
  timestamp: number;
  [cameraName: string]: string | number;
}

export interface AnalyticsSummary {
  totalFootfall: number;
  footfallChange: number;
  peakHour: string;
  activeCameras: number;
  totalAlerts: number;
  alertsChange: number;
}

export interface Settings {
  matchThreshold: number;
  retentionDays: number;
  soundAlerts: boolean;
  desktopNotifications: boolean;
  autoReconnect: boolean;
  overlayBboxes: boolean;
}
