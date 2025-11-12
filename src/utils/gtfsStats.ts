import type { GtfsStatistics, GtfsComparison } from '../types/gtfs';

export async function computeStatistics(gtfsInstance: any): Promise<GtfsStatistics> {
  try {
    const routes = await gtfsInstance.getRoutes();
    const stops = await gtfsInstance.getStops();
    const trips = await gtfsInstance.getTrips();
    const agencies = await gtfsInstance.getAgencies();

    // Count routes by type
    const routesByType: Record<number, number> = {};
    routes.forEach((route: any) => {
      const type = route.route_type || 0;
      routesByType[type] = (routesByType[type] || 0) + 1;
    });

    return {
      totalRoutes: routes.length,
      totalStops: stops.length,
      totalTrips: trips.length,
      totalAgencies: agencies.length,
      routesByType
    };
  } catch (error) {
    console.error('Error computing statistics:', error);
    throw error;
  }
}

export function compareStatistics(
  stats1: GtfsStatistics,
  stats2: GtfsStatistics
): GtfsComparison[] {
  const comparisons: GtfsComparison[] = [];

  // Compare basic metrics
  const metrics: Array<keyof Pick<GtfsStatistics, 'totalRoutes' | 'totalStops' | 'totalTrips' | 'totalAgencies'>> = [
    'totalRoutes',
    'totalStops',
    'totalTrips',
    'totalAgencies'
  ];

  metrics.forEach(metric => {
    const val1 = stats1[metric];
    const val2 = stats2[metric];
    const absoluteDiff = val2 - val1;
    const percentageDiff = val1 !== 0 ? ((val2 - val1) / val1) * 100 : 0;

    comparisons.push({
      metric: metric.replace('total', ''),
      dataset1: val1,
      dataset2: val2,
      absoluteDiff,
      percentageDiff
    });
  });

  return comparisons;
}

export function getRouteTypeName(type: number): string {
  const types: Record<number, string> = {
    0: 'Tram/Light Rail',
    1: 'Subway/Metro',
    2: 'Rail',
    3: 'Bus',
    4: 'Ferry',
    5: 'Cable Tram',
    6: 'Aerial Lift',
    7: 'Funicular',
    11: 'Trolleybus',
    12: 'Monorail'
  };
  return types[type] || `Type ${type}`;
}
