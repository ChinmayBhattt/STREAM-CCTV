import { Camera, Person, Alert, FootfallDataPoint, AnalyticsSummary, DetectionEvent } from './types';

// ─── Cameras ──────────────────────────────────────────────
export const mockCameras: Camera[] = [
  {
    id: 'cam-1',
    name: 'Main Gate',
    location: 'Building A - North Entrance',
    streamUrl: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
    status: 'online',
    personCount: 3,
    order: 0,
  },
  {
    id: 'cam-2',
    name: 'Library Entrance',
    location: 'Building B - Ground Floor',
    streamUrl: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
    status: 'online',
    personCount: 7,
    order: 1,
  },
  {
    id: 'cam-3',
    name: 'Parking Lot',
    location: 'Outdoor - West Wing',
    streamUrl: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
    status: 'offline',
    personCount: 0,
    order: 2,
  },
  {
    id: 'cam-4',
    name: 'Cafeteria',
    location: 'Building C - 2nd Floor',
    streamUrl: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
    status: 'online',
    personCount: 12,
    order: 3,
  },
  {
    id: 'cam-5',
    name: 'Server Room',
    location: 'Building A - Basement',
    streamUrl: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
    status: 'reconnecting',
    personCount: 1,
    order: 4,
  },
  {
    id: 'cam-6',
    name: 'Reception',
    location: 'Building A - Lobby',
    streamUrl: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
    status: 'online',
    personCount: 5,
    order: 5,
  },
];

// ─── Enrolled People ─────────────────────────────────────
export const mockPeople: Person[] = [
  {
    id: 'person-1',
    name: 'Rahul Sharma',
    role: 'Security Head',
    category: 'staff',
    notes: 'Day shift supervisor. Authorized for all zones.',
    photos: ['/avatars/person1.jpg'],
    enrolledAt: '2025-11-15T09:00:00Z',
    matchCount: 47,
    alertsMuted: false,
    matchThreshold: 0.75,
  },
  {
    id: 'person-2',
    name: 'Priya Patel',
    role: 'Faculty - CS Dept',
    category: 'staff',
    notes: 'Access to Building B and labs.',
    photos: ['/avatars/person2.jpg'],
    enrolledAt: '2025-12-01T10:30:00Z',
    matchCount: 32,
    alertsMuted: false,
    matchThreshold: 0.75,
  },
  {
    id: 'person-3',
    name: 'Amit Verma',
    role: 'Student - Final Year',
    category: 'student',
    notes: 'Hostel Block D resident. Lab access till 10 PM.',
    photos: ['/avatars/person3.jpg'],
    enrolledAt: '2026-01-10T14:00:00Z',
    matchCount: 18,
    alertsMuted: true,
    matchThreshold: 0.80,
  },
  {
    id: 'person-4',
    name: 'Sneha Gupta',
    role: 'Library Staff',
    category: 'staff',
    notes: 'Works afternoon shifts.',
    photos: ['/avatars/person4.jpg'],
    enrolledAt: '2026-02-20T08:15:00Z',
    matchCount: 56,
    alertsMuted: false,
    matchThreshold: 0.70,
  },
  {
    id: 'person-5',
    name: 'Vikram Singh',
    role: 'Maintenance',
    category: 'staff',
    notes: 'Full campus access for repairs.',
    photos: ['/avatars/person5.jpg'],
    enrolledAt: '2026-03-05T11:45:00Z',
    matchCount: 23,
    alertsMuted: false,
    matchThreshold: 0.75,
  },
  {
    id: 'person-6',
    name: 'Deepika Reddy',
    role: 'Visitor - Contractor',
    category: 'watchlist',
    notes: 'Authorized for Building C renovation project only. Valid till March 2026.',
    photos: ['/avatars/person6.jpg'],
    enrolledAt: '2026-04-01T16:00:00Z',
    matchCount: 8,
    alertsMuted: false,
    matchThreshold: 0.85,
  },
];

// ─── Alerts ──────────────────────────────────────────────
function generateAlerts(): Alert[] {
  const alerts: Alert[] = [];
  const cams = [
    { id: 'cam-1', name: 'Main Gate' },
    { id: 'cam-2', name: 'Library Entrance' },
    { id: 'cam-4', name: 'Cafeteria' },
    { id: 'cam-6', name: 'Reception' },
  ];

  const now = Date.now();
  for (let i = 0; i < 20; i++) {
    const person = mockPeople[Math.floor(Math.random() * mockPeople.length)];
    const cam = cams[Math.floor(Math.random() * cams.length)];
    alerts.push({
      id: `alert-${i + 1}`,
      personId: person.id,
      personName: person.name,
      personPhoto: person.photos[0],
      cameraId: cam.id,
      cameraName: cam.name,
      timestamp: new Date(now - i * 12 * 60000).toISOString(),
      confidence: 0.72 + Math.random() * 0.26,
      read: i > 5,
    });
  }
  return alerts;
}

export const mockAlerts: Alert[] = generateAlerts();

// ─── Footfall Data ───────────────────────────────────────
function generateFootfallData(): FootfallDataPoint[] {
  const data: FootfallDataPoint[] = [];
  const baseValues: Record<string, number[]> = {
    'Main Gate':         [2, 1, 0, 0, 1, 5, 18, 35, 42, 38, 30, 25, 28, 32, 35, 40, 38, 30, 22, 15, 10, 8, 5, 3],
    'Library Entrance':  [0, 0, 0, 0, 0, 1,  5, 12, 20, 25, 30, 28, 15, 22, 28, 32, 30, 25, 18, 10,  5, 2, 1, 0],
    'Cafeteria':         [0, 0, 0, 0, 0, 2,  8, 15, 10,  8, 12, 35, 42, 38, 12, 10,  8, 20, 35, 28, 15,  8, 3, 1],
    'Reception':         [1, 0, 0, 0, 0, 3, 10, 22, 28, 25, 20, 18, 15, 18, 22, 25, 28, 22, 15,  8,  5, 3, 2, 1],
  };

  for (let h = 0; h < 24; h++) {
    const point: FootfallDataPoint = {
      hour: `${h.toString().padStart(2, '0')}:00`,
      timestamp: h,
    };
    for (const [cam, values] of Object.entries(baseValues)) {
      point[cam] = values[h] + Math.floor(Math.random() * 5);
    }
    data.push(point);
  }
  return data;
}

export const mockFootfallData: FootfallDataPoint[] = generateFootfallData();

// ─── Analytics Summary ───────────────────────────────────
export const mockAnalyticsSummary: AnalyticsSummary = {
  totalFootfall: 1247,
  footfallChange: 12.5,
  peakHour: '08:00 – 09:00',
  activeCameras: 4,
  totalAlerts: 20,
  alertsChange: -8.3,
};

// ─── Detection Events (for bounding boxes) ──────────────
export const mockDetections: DetectionEvent[] = [
  {
    id: 'det-1',
    cameraId: 'cam-1',
    cameraName: 'Main Gate',
    personId: 'person-1',
    personName: 'Rahul Sharma',
    timestamp: new Date().toISOString(),
    confidence: 0.92,
    boundingBox: { x: 0.3, y: 0.2, w: 0.15, h: 0.5 },
    type: 'face_match',
  },
  {
    id: 'det-2',
    cameraId: 'cam-1',
    cameraName: 'Main Gate',
    personId: null,
    personName: null,
    timestamp: new Date().toISOString(),
    confidence: 0.88,
    boundingBox: { x: 0.6, y: 0.25, w: 0.12, h: 0.45 },
    type: 'person',
  },
  {
    id: 'det-3',
    cameraId: 'cam-2',
    cameraName: 'Library Entrance',
    personId: 'person-2',
    personName: 'Priya Patel',
    timestamp: new Date().toISOString(),
    confidence: 0.85,
    boundingBox: { x: 0.45, y: 0.15, w: 0.14, h: 0.55 },
    type: 'face_match',
  },
  {
    id: 'det-4',
    cameraId: 'cam-4',
    cameraName: 'Cafeteria',
    personId: null,
    personName: null,
    timestamp: new Date().toISOString(),
    confidence: 0.91,
    boundingBox: { x: 0.2, y: 0.3, w: 0.1, h: 0.4 },
    type: 'person',
  },
  {
    id: 'det-5',
    cameraId: 'cam-4',
    cameraName: 'Cafeteria',
    personId: 'person-4',
    personName: 'Sneha Gupta',
    timestamp: new Date().toISOString(),
    confidence: 0.79,
    boundingBox: { x: 0.7, y: 0.2, w: 0.13, h: 0.48 },
    type: 'face_match',
  },
];

// ─── Utility: generate initials avatar color ─────────────
const avatarColors = [
  '#6366f1', '#8b5cf6', '#a855f7', '#d946ef',
  '#ec4899', '#f43f5e', '#ef4444', '#f97316',
  '#eab308', '#84cc16', '#22c55e', '#14b8a6',
  '#06b6d4', '#3b82f6', '#6366f1',
];

export function getAvatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return avatarColors[Math.abs(hash) % avatarColors.length];
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}
