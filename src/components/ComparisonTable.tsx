import type { GtfsComparison } from '../types/gtfs';

interface ComparisonTableProps {
  comparisons: GtfsComparison[];
  name1: string;
  name2: string;
}

export default function ComparisonTable({ comparisons, name1, name2 }: ComparisonTableProps) {
  return (
    <div className="comparison-section">
      <h2>Comparison Results</h2>
      <div className="comparison-table-container">
        <table className="comparison-table">
          <thead>
            <tr>
              <th>Metric</th>
              <th>{name1}</th>
              <th>{name2}</th>
              <th>Absolute Difference</th>
              <th>Percentage Change</th>
            </tr>
          </thead>
          <tbody>
            {comparisons.map((comp, index) => (
              <tr key={index}>
                <td className="metric-name">{comp.metric}</td>
                <td className="value">{comp.dataset1.toLocaleString()}</td>
                <td className="value">{comp.dataset2.toLocaleString()}</td>
                <td className={`value ${comp.absoluteDiff > 0 ? 'positive' : comp.absoluteDiff < 0 ? 'negative' : ''}`}>
                  {comp.absoluteDiff > 0 ? '+' : ''}{comp.absoluteDiff.toLocaleString()}
                </td>
                <td className={`value ${comp.percentageDiff > 0 ? 'positive' : comp.percentageDiff < 0 ? 'negative' : ''}`}>
                  {comp.percentageDiff > 0 ? '+' : ''}{comp.percentageDiff.toFixed(2)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
