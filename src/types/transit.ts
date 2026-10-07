export type LtaLoad = 'SEA' | 'SDA' | 'LSD';
export type LtaBusType = 'SD' | 'DD' | 'BD';
export type LtaFeature = 'WAB' | string;

export interface LtaBusPrediction {
  OriginCode: string;
  DestinationCode: string;
  EstimatedArrival: string;
  Latitude: string;
  Longitude: string;
  VisitNumber: string;
  Load: LtaLoad | string;
  Feature: LtaFeature;
  Type: LtaBusType | string;
}

export interface LtaBusService {
  ServiceNo: string;
  Operator: string;
  NextBus?: LtaBusPrediction;
  NextBus2?: LtaBusPrediction;
  NextBus3?: LtaBusPrediction;
}

export interface LtaApiResponse {
  success: boolean;
  source: string;
  busStopCode: string;
  serviceNo?: string | null;
  fetchedAt: string;
  notice?: string;
  error?: string;
  Services: LtaBusService[];
}

export interface ApiHealthResponse {
  status: string;
  service: string;
  timestamp: string;
  environment: string;
  ltaConfigured: boolean;
  ltaApiStatus: string;
  supportedEndpoints: string[];
}
