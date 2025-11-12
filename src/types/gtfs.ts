export interface GtfsStatistics {
  totalRoutes: number;
  totalStops: number;
  totalTrips: number;
  totalAgencies: number;
  routesByType: Record<number, number>;
}

export interface GtfsComparison {
  metric: string;
  dataset1: number;
  dataset2: number;
  absoluteDiff: number;
  percentageDiff: number;
}

export interface GtfsData {
  name: string;
  instance: any;
  statistics: GtfsStatistics | null;
}
