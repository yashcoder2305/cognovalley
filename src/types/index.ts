export type ZoneStatus = 'optimal' | 'warning' | 'critical';

export interface Zone {
  id: string;
  name: string;
  code: string;
  cleanlinessScore: number; // 0 - 100
  history: number[]; // Last 6 recorded readings for mini sparkline
  status: ZoneStatus;
  litterDensity: number; // percentage
  activeIncidents: number;
  lastInspection: string;
  cameraId: string;
  areaType: string;
}

export type DetectionType = 'overflowing_bin' | 'litter_debris' | 'garbage_bag' | 'liquid_spill';

export interface BoundingBox {
  id: string;
  type: DetectionType;
  label: string;
  confidence: number; // 0 - 1
  coordinates: { x: number; y: number; width: number; height: number }; // percentage
  persistenceSeconds: number;
  thresholdSeconds: number;
  detectedAt: string;
  status: 'monitoring' | 'breached';
}

export type TicketState = 'open' | 'assigned' | 'resolved';
export type TicketPriority = 'critical' | 'high' | 'medium' | 'low';

export interface HousekeepingTicket {
  id: string;
  ticketNumber: string;
  title: string;
  zoneId: string;
  zoneName: string;
  type: DetectionType;
  priority: TicketPriority;
  status: TicketState;
  createdAt: string;
  elapsedSeconds: number;
  slaLimitSeconds: number;
  assignedStaff?: {
    name: string;
    role: string;
    badgeId: string;
    etaMinutes?: number;
  };
  beforeImageUrl: string;
  afterImageUrl?: string;
  resolvedAt?: string;
}

export interface VerificationPair {
  id: string;
  ticketNumber: string;
  zoneName: string;
  detectedAt: string;
  cleanedAt: string;
  beforeImage: string;
  afterImage: string;
  litterTypes: string[];
  cleanlinessBefore: number;
  cleanlinessAfter: number;
}
