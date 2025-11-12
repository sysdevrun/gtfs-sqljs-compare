export interface RouteStatistics {
  routeId: string;
  routeName: string;
  routeType: number;
  totalTrips: number;
  earliestDeparture: string; // HH:MM:SS format
  latestDeparture: string; // HH:MM:SS format
  minHeadwayMinutes: number | null; // null if only one trip
}

export interface GtfsStatistics {
  totalRoutes: number;
  totalStops: number;
  totalTrips: number;
  totalAgencies: number;
  routesByType: Record<number, number>;

  // Date-specific statistics
  singleDay: {
    date: string;
    totalTrips: number;
    routeStats: RouteStatistics[];
    earliestDeparture: string;
    latestDeparture: string;
  } | null;

  weekRange: {
    startDate: string;
    endDate: string;
    totalTrips: number;
    routeStats: RouteStatistics[];
    earliestDeparture: string;
    latestDeparture: string;
  } | null;
}

export interface RouteComparison {
  routeId: string;
  routeName: string;
  routeType: number;
  trips1: number;
  trips2: number;
  tripsDiff: number;
  tripsPercent: number;
  earliest1: string;
  earliest2: string;
  latest1: string;
  latest2: string;
  headway1: number | null;
  headway2: number | null;
}

export interface GtfsComparison {
  metric: string;
  dataset1: number | string;
  dataset2: number | string;
  absoluteDiff: number | string;
  percentageDiff: number | string;
}

export interface GtfsData {
  name: string;
  instance: any;
  statistics: GtfsStatistics | null;
}
