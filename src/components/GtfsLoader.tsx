import { useState } from 'react';

interface GtfsLoaderProps {
  onLoad: (instance: any, name: string) => void;
  datasetNumber: number;
  disabled?: boolean;
}

export default function GtfsLoader({ onLoad, datasetNumber, disabled }: GtfsLoaderProps) {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const handleLoadFromUrl = async () => {
    if (!url.trim()) {
      setError('Please enter a valid URL');
      return;
    }

    setLoading(true);
    setError(null);
    setProgress(0);

    try {
      // Dynamic import to avoid SSR issues
      const { GtfsSqlJs } = await import('gtfs-sqljs');
      const { initializeSqlJs } = await import('../utils/sqlConfig');

      // Initialize SQL.js with proper WASM path
      const SQL = await initializeSqlJs();

      const gtfs = await GtfsSqlJs.fromZip(url, {
        SQL,
        onProgress: (progressInfo: any) => {
          setProgress(progressInfo.percentComplete || 0);
        }
      });

      onLoad(gtfs, `Dataset ${datasetNumber}`);
      setUrl('');
      setProgress(0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load GTFS data');
      console.error('Error loading GTFS:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError(null);
    setProgress(0);

    try {
      const { GtfsSqlJs } = await import('gtfs-sqljs');
      const { initializeSqlJs } = await import('../utils/sqlConfig');

      // Initialize SQL.js with proper WASM path
      const SQL = await initializeSqlJs();

      const arrayBuffer = await file.arrayBuffer();
      const gtfs = await GtfsSqlJs.fromZip(new Uint8Array(arrayBuffer) as any, {
        SQL,
        onProgress: (progressInfo: any) => {
          setProgress(progressInfo.percentComplete || 0);
        }
      });

      onLoad(gtfs, file.name);
      event.target.value = '';
      setProgress(0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load GTFS file');
      console.error('Error loading GTFS:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="gtfs-loader">
      <h3>Load GTFS Dataset {datasetNumber}</h3>

      <div className="loader-section">
        <div className="url-input-group">
          <input
            type="text"
            placeholder="Enter GTFS ZIP URL"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            disabled={loading || disabled}
            onKeyPress={(e) => e.key === 'Enter' && handleLoadFromUrl()}
          />
          <button
            onClick={handleLoadFromUrl}
            disabled={loading || disabled || !url.trim()}
          >
            {loading ? 'Loading...' : 'Load from URL'}
          </button>
        </div>

        <div className="file-input-group">
          <label htmlFor={`file-input-${datasetNumber}`} className="file-label">
            Or upload GTFS ZIP file
          </label>
          <input
            id={`file-input-${datasetNumber}`}
            type="file"
            accept=".zip"
            onChange={handleFileUpload}
            disabled={loading || disabled}
          />
        </div>
      </div>

      {loading && (
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progress}%` }}>
            {progress.toFixed(0)}%
          </div>
        </div>
      )}

      {error && <div className="error-message">{error}</div>}
    </div>
  );
}
