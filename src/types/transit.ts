export type TransitMode = 'bus' | 'metro' | 'light_rail' | 'rapid';

export type RouteColor = 'emerald' | 'blue' | 'amber' | 'crimson';

export interface TransitStop {
  id: string;
  name: string;
  code: string;
  zone: string;
  transfers: string[];
  lat: number;
  lng: number;
  platforms: string[];
  accessible: boolean;
  shelter: boolean;
  digitalSign: boolean;
}

export interface TransitRoute {
  id: string;
  number: string;
  name: string;
  color: RouteColor;
  colorHex: string;
  mode: TransitMode;
  direction: string;
  via: string;
  frequencyMinutes: number;
  stops: TransitStop[];
}

export interface VehicleTelemetry {
  id: string;
  routeId: string;
  currentStopIndex: number;
  progressBetweenStops: number; // 0.0 to 1.0
  speedKmh: number;
  heading: number;
  occupancyPercent: number;
  occupancyStatus: 'seats_available' | 'standing_room' | 'crowded';
  doorStatus: 'open' | 'closed';
  acStatus: 'nominal' | 'cooling' | 'ventilation';
  wheelchairAccessible: boolean;
  headwayDeltaMinutes: number; // e.g. 0 = on time, +3 = delayed 3 min, -1 = 1 min early
  lastPingSecondsAgo: number;
  nextStopEtaSeconds: number;
}

export interface LiveDeparture {
  id: string;
  routeId: string;
  routeNumber: string;
  routeName: string;
  routeColorHex: string;
  direction: string;
  via: string;
  destination: string;
  stopId: string;
  platform: string;
  scheduledTime: string; // e.g. "14:32"
  countdownSeconds: number;
  isDelayed: boolean;
  delayMinutes: number;
  occupancy: 'light' | 'moderate' | 'heavy';
  occupancyPercent: number;
  vehicleId: string;
  accessible: boolean;
  electric: boolean;
}

export interface ServiceBulletin {
  id: string;
  routeIds: string[];
  severity: 'minor' | 'moderate' | 'critical';
  title: string;
  summary: string;
  detail: string;
  affectedStops: string[];
  effectivePeriod: string;
  detourMapAvailable: boolean;
}

export interface TripItinerary {
  id: string;
  origin: string;
  destination: string;
  totalDurationMin: number;
  walkDurationMin: number;
  departureTime: string;
  arrivalTime: string;
  fare: string;
  legs: {
    mode: 'walk' | 'transit';
    routeNumber?: string;
    routeColorHex?: string;
    instruction: string;
    fromStop: string;
    toStop: string;
    durationMin: number;
    stopsCount?: number;
  }[];
}
