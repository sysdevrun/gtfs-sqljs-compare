import type { GtfsStatistics, GtfsComparison, RouteStatistics, RouteComparison } from '../types/gtfs';

// Helper function to convert time string to minutes since midnight
function timeToMinutes(timeStr: string): number {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
}

// Helper function to get date range
function getDateRange(startDate: string, endDate: string): string[] {
  const dates: string[] = [];
  const start = new Date(
    parseInt(startDate.substring(0, 4)),
    parseInt(startDate.substring(4, 6)) - 1,
    parseInt(startDate.substring(6, 8))
  );
  const end = new Date(
    parseInt(endDate.substring(0, 4)),
    parseInt(endDate.substring(4, 6)) - 1,
    parseInt(endDate.substring(6, 8))
  );

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    dates.push(`${year}${month}${day}`);
  }

  return dates;
}

// Calculate route statistics for a specific date or date range
async function calculateRouteStats(
  gtfsInstance: any,
  dates: string[]
): Promise<{ routeStats: RouteStatistics[], totalTrips: number, earliest: string, latest: string }> {
  const routes = await gtfsInstance.getRoutes();
  const routeStatsMap = new Map<string, RouteStatistics>();
  let globalEarliest = '99:99:99';
  let globalLatest = '00:00:00';
  let totalTrips = 0;

  for (const date of dates) {
    // Get trips for this date
    const trips = await gtfsInstance.getTrips({ date });
    totalTrips += trips.length;

    for (const trip of trips) {
      const routeId = trip.route_id;

      // Find the route details
      const route = routes.find((r: any) => r.route_id === routeId);
      if (!route) continue;

      // Get stop times for this trip
      const stopTimes = await gtfsInstance.getStopTimes({ tripId: trip.trip_id });
      if (stopTimes.length === 0) continue;

      // Get first stop time (departure)
      const firstStop = stopTimes.sort((a: any, b: any) => a.stop_sequence - b.stop_sequence)[0];
      const departureTime = firstStop.departure_time;

      // Update global earliest/latest
      if (departureTime < globalEarliest) globalEarliest = departureTime;
      if (departureTime > globalLatest) globalLatest = departureTime;

      // Initialize or update route stats
      if (!routeStatsMap.has(routeId)) {
        routeStatsMap.set(routeId, {
          routeId,
          routeName: route.route_short_name || route.route_long_name || routeId,
          routeType: route.route_type,
          totalTrips: 0,
          earliestDeparture: '99:99:99',
          latestDeparture: '00:00:00',
          minHeadwayMinutes: null
        });
      }

      const stats = routeStatsMap.get(routeId)!;
      stats.totalTrips++;
      if (departureTime < stats.earliestDeparture) stats.earliestDeparture = departureTime;
      if (departureTime > stats.latestDeparture) stats.latestDeparture = departureTime;
    }
  }

  // Calculate minimum headway for each route
  for (const [routeId, stats] of routeStatsMap.entries()) {
    const departureTimes: number[] = [];

    for (const date of dates) {
      const trips = await gtfsInstance.getTrips({ routeId, date });

      for (const trip of trips) {
        const stopTimes = await gtfsInstance.getStopTimes({ tripId: trip.trip_id });
        if (stopTimes.length > 0) {
          const firstStop = stopTimes.sort((a: any, b: any) => a.stop_sequence - b.stop_sequence)[0];
          departureTimes.push(timeToMinutes(firstStop.departure_time));
        }
      }
    }

    if (departureTimes.length > 1) {
      departureTimes.sort((a, b) => a - b);
      let minHeadway = Infinity;
      for (let i = 1; i < departureTimes.length; i++) {
        const headway = departureTimes[i] - departureTimes[i - 1];
        if (headway > 0 && headway < minHeadway) {
          minHeadway = headway;
        }
      }
      stats.minHeadwayMinutes = minHeadway === Infinity ? null : minHeadway;
    }
  }

  const routeStats = Array.from(routeStatsMap.values()).sort((a, b) =>
    a.routeName.localeCompare(b.routeName)
  );

  return {
    routeStats,
    totalTrips,
    earliest: globalEarliest,
    latest: globalLatest
  };
}

export async function computeStatistics(
  gtfsInstance: any,
  singleDayDate?: string,
  weekStartDate?: string,
  weekEndDate?: string
): Promise<GtfsStatistics> {
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

    // Calculate single day statistics if date provided
    let singleDay = null;
    if (singleDayDate) {
      const singleDayStats = await calculateRouteStats(gtfsInstance, [singleDayDate]);
      singleDay = {
        date: singleDayDate,
        totalTrips: singleDayStats.totalTrips,
        routeStats: singleDayStats.routeStats,
        earliestDeparture: singleDayStats.earliest,
        latestDeparture: singleDayStats.latest
      };
    }

    // Calculate week range statistics if dates provided
    let weekRange = null;
    if (weekStartDate && weekEndDate) {
      const dates = getDateRange(weekStartDate, weekEndDate);
      const weekStats = await calculateRouteStats(gtfsInstance, dates);
      weekRange = {
        startDate: weekStartDate,
        endDate: weekEndDate,
        totalTrips: weekStats.totalTrips,
        routeStats: weekStats.routeStats,
        earliestDeparture: weekStats.earliest,
        latestDeparture: weekStats.latest
      };
    }

    return {
      totalRoutes: routes.length,
      totalStops: stops.length,
      totalTrips: trips.length,
      totalAgencies: agencies.length,
      routesByType,
      singleDay,
      weekRange
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
    const val1 = stats1[metric] as number;
    const val2 = stats2[metric] as number;
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

export function compareRouteStatistics(
  stats1: RouteStatistics[],
  stats2: RouteStatistics[]
): RouteComparison[] {
  const comparisons: RouteComparison[] = [];
  const routeMap1 = new Map(stats1.map(s => [s.routeId, s]));
  const routeMap2 = new Map(stats2.map(s => [s.routeId, s]));

  // Get all unique route IDs
  const allRouteIds = new Set([...routeMap1.keys(), ...routeMap2.keys()]);

  for (const routeId of allRouteIds) {
    const route1 = routeMap1.get(routeId);
    const route2 = routeMap2.get(routeId);

    const trips1 = route1?.totalTrips || 0;
    const trips2 = route2?.totalTrips || 0;
    const tripsDiff = trips2 - trips1;
    const tripsPercent = trips1 !== 0 ? ((trips2 - trips1) / trips1) * 100 : (trips2 > 0 ? 100 : 0);

    comparisons.push({
      routeId,
      routeName: route1?.routeName || route2?.routeName || routeId,
      routeType: route1?.routeType || route2?.routeType || 0,
      trips1,
      trips2,
      tripsDiff,
      tripsPercent,
      earliest1: route1?.earliestDeparture || 'N/A',
      earliest2: route2?.earliestDeparture || 'N/A',
      latest1: route1?.latestDeparture || 'N/A',
      latest2: route2?.latestDeparture || 'N/A',
      headway1: route1?.minHeadwayMinutes || null,
      headway2: route2?.minHeadwayMinutes || null
    });
  }

  return comparisons.sort((a, b) => a.routeName.localeCompare(b.routeName));
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
