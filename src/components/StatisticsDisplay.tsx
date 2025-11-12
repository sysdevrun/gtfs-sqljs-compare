import type { GtfsStatistics } from '../types/gtfs';
import { getRouteTypeName } from '../utils/gtfsStats';

interface StatisticsDisplayProps {
  name: string;
  statistics: GtfsStatistics;
}

export default function StatisticsDisplay({ name, statistics }: StatisticsDisplayProps) {
  return (
    <div className="statistics-card">
      <h3>{name}</h3>
      <div className="stats-grid">
        <div className="stat-item">
          <span className="stat-label">Agencies:</span>
          <span className="stat-value">{statistics.totalAgencies.toLocaleString()}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Routes:</span>
          <span className="stat-value">{statistics.totalRoutes.toLocaleString()}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Stops:</span>
          <span className="stat-value">{statistics.totalStops.toLocaleString()}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Trips:</span>
          <span className="stat-value">{statistics.totalTrips.toLocaleString()}</span>
        </div>
      </div>

      {Object.keys(statistics.routesByType).length > 0 && (
        <div className="route-types">
          <h4>Routes by Type</h4>
          <div className="route-type-list">
            {Object.entries(statistics.routesByType)
              .sort(([, a], [, b]) => b - a)
              .map(([type, count]) => (
                <div key={type} className="route-type-item">
                  <span className="route-type-name">{getRouteTypeName(Number(type))}</span>
                  <span className="route-type-count">{count}</span>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
