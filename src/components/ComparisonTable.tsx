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
            {comparisons.map((comp, index) => {
              const absNum = typeof comp.absoluteDiff === 'number' ? comp.absoluteDiff : 0;
              const pctNum = typeof comp.percentageDiff === 'number' ? comp.percentageDiff : 0;

              return (
                <tr key={index}>
                  <td className="metric-name">{comp.metric}</td>
                  <td className="value">
                    {typeof comp.dataset1 === 'number' ? comp.dataset1.toLocaleString() : comp.dataset1}
                  </td>
                  <td className="value">
                    {typeof comp.dataset2 === 'number' ? comp.dataset2.toLocaleString() : comp.dataset2}
                  </td>
                  <td className={`value ${absNum > 0 ? 'positive' : absNum < 0 ? 'negative' : ''}`}>
                    {typeof comp.absoluteDiff === 'number'
                      ? `${absNum > 0 ? '+' : ''}${comp.absoluteDiff.toLocaleString()}`
                      : comp.absoluteDiff
                    }
                  </td>
                  <td className={`value ${pctNum > 0 ? 'positive' : pctNum < 0 ? 'negative' : ''}`}>
                    {typeof comp.percentageDiff === 'number'
                      ? `${pctNum > 0 ? '+' : ''}${comp.percentageDiff.toFixed(2)}%`
                      : comp.percentageDiff
                    }
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
