import { useState } from 'react';
import type { RouteComparison } from '../types/gtfs';
import { getRouteTypeName } from '../utils/gtfsStats';

interface RouteComparisonTableProps {
  comparisons: RouteComparison[];
  name1: string;
  name2: string;
  title: string;
  totalTrips1: number;
  totalTrips2: number;
}

export default function RouteComparisonTable({
  comparisons,
  name1,
  name2,
  title,
  totalTrips1,
  totalTrips2
}: RouteComparisonTableProps) {
  const [sortField, setSortField] = useState<keyof RouteComparison>('routeName');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const handleSort = (field: keyof RouteComparison) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedComparisons = [...comparisons].sort((a, b) => {
    const aVal = a[sortField];
    const bVal = b[sortField];

    if (aVal === null) return 1;
    if (bVal === null) return -1;

    if (typeof aVal === 'string' && typeof bVal === 'string') {
      return sortDirection === 'asc'
        ? aVal.localeCompare(bVal)
        : bVal.localeCompare(aVal);
    }

    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
    }

    return 0;
  });

  // Calculate total row
  const totalDiff = totalTrips2 - totalTrips1;
  const totalPercent = totalTrips1 !== 0 ? ((totalTrips2 - totalTrips1) / totalTrips1) * 100 : 0;

  const formatHeadway = (minutes: number | null) => {
    if (minutes === null) return 'N/A';
    if (minutes < 60) return `${Math.round(minutes)}min`;
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return `${hours}h${mins > 0 ? mins + 'min' : ''}`;
  };

  return (
    <div className="route-comparison-section">
      <h3>{title}</h3>
      <div className="comparison-table-container">
        <table className="comparison-table route-comparison-table">
          <thead>
            <tr>
              <th onClick={() => handleSort('routeName')} className="sortable">
                Route {sortField === 'routeName' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th>Type</th>
              <th onClick={() => handleSort('trips1')} className="sortable">
                Trips {name1} {sortField === 'trips1' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('trips2')} className="sortable">
                Trips {name2} {sortField === 'trips2' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('tripsDiff')} className="sortable">
                Diff {sortField === 'tripsDiff' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('tripsPercent')} className="sortable">
                % {sortField === 'tripsPercent' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th>Earliest</th>
              <th>Latest</th>
              <th>Min Headway</th>
            </tr>
          </thead>
          <tbody>
            {sortedComparisons.map((comp, index) => (
              <tr key={index}>
                <td className="route-name">{comp.routeName}</td>
                <td className="route-type">{getRouteTypeName(comp.routeType)}</td>
                <td className="value">{comp.trips1.toLocaleString()}</td>
                <td className="value">{comp.trips2.toLocaleString()}</td>
                <td className={`value ${comp.tripsDiff > 0 ? 'positive' : comp.tripsDiff < 0 ? 'negative' : ''}`}>
                  {comp.tripsDiff > 0 ? '+' : ''}{comp.tripsDiff.toLocaleString()}
                </td>
                <td className={`value ${comp.tripsPercent > 0 ? 'positive' : comp.tripsPercent < 0 ? 'negative' : ''}`}>
                  {comp.tripsPercent > 0 ? '+' : ''}{comp.tripsPercent.toFixed(1)}%
                </td>
                <td className="time-cell">
                  <div>{comp.earliest1}</div>
                  <div className="time-comparison">{comp.earliest2}</div>
                </td>
                <td className="time-cell">
                  <div>{comp.latest1}</div>
                  <div className="time-comparison">{comp.latest2}</div>
                </td>
                <td className="headway-cell">
                  <div>{formatHeadway(comp.headway1)}</div>
                  <div className="time-comparison">{formatHeadway(comp.headway2)}</div>
                </td>
              </tr>
            ))}
            <tr className="total-row">
              <td colSpan={2}><strong>ALL ROUTES</strong></td>
              <td className="value"><strong>{totalTrips1.toLocaleString()}</strong></td>
              <td className="value"><strong>{totalTrips2.toLocaleString()}</strong></td>
              <td className={`value ${totalDiff > 0 ? 'positive' : totalDiff < 0 ? 'negative' : ''}`}>
                <strong>{totalDiff > 0 ? '+' : ''}{totalDiff.toLocaleString()}</strong>
              </td>
              <td className={`value ${totalPercent > 0 ? 'positive' : totalPercent < 0 ? 'negative' : ''}`}>
                <strong>{totalPercent > 0 ? '+' : ''}{totalPercent.toFixed(1)}%</strong>
              </td>
              <td colSpan={3}></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
