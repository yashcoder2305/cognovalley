export type ZoneStatus = 'pristine' | 'warning' | 'critical';

export interface Zone {
  id: string;
  name: string;
  code: string;
  cleanlinessScore: number; // 0 - 100%
  status: ZoneStatus;
  litterDensity: number; // e.g. items per 100 sq meters or % density
  activeIncidents: number;
  lastInspection: string;
  cameraIds: string[];
  areaType: 'Food Court' | 'Corridor' | 'Restroom' | 'Entry Concourse' | 'Outdoor Plaza';
}

export type DetectionType = 'overflowing_bin' | 'litter_debris' | 'garbage_bag' | 'liquid_spill';

export interface BoundingBox {
  id: string;
  type: DetectionType;
  label: string;
  confidence: number; // e.g. 0.94
  coordinates: { x: number; y: number; width: number; height: number }; // normalized 0-100%
  persistenceSeconds: number;
  thresholdSeconds: number; // SLA threshold
  status: 'monitoring' | 'breached' | 'cleared';
  color: string;
}

export type TicketState = 'OPEN' | 'ASSIGNED' | 'CLEANED';
export type TicketPriority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export interface HousekeepingTicket {
  id: string;
  code: string;
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
    avatar: string;
    badgeId: string;
    etaMinutes?: number;
  };
  beforeImageUrl: string;
  afterImageUrl?: string;
  resolvedAt?: string;
  resolutionTimeMinutes?: number;
}

export interface VerificationPair {
  id: string;
  ticketId: string;
  zoneName: string;
  detectedAt: string;
  cleanedAt: string;
  beforeImage: string;
  afterImage: string;
  wasteTypesFound: string[];
  cleanlinessDelta: {
    beforeScore: number;
    afterScore: number;
  };
}

