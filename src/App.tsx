import { useState, useEffect } from 'react';
import GtfsLoader from './components/GtfsLoader';
import StatisticsDisplay from './components/StatisticsDisplay';
import ComparisonTable from './components/ComparisonTable';
import { computeStatistics, compareStatistics } from './utils/gtfsStats';
import type { GtfsData, GtfsComparison } from './types/gtfs';
import './App.css';

// Default GTFS dataset URLs
const DEFAULT_DATASET_1_URL = 'https://dsp2025.transdev.re/CJ-2025-09-23-offre-2025-aout.zip';
const DEFAULT_DATASET_2_URL = 'https://dsp2025.transdev.re/2025-11-04-car-jaune-1er-dec-pysae-08h51.zip';

function App() {
  const [dataset1, setDataset1] = useState<GtfsData | null>(null);
  const [dataset2, setDataset2] = useState<GtfsData | null>(null);
  const [comparisons, setComparisons] = useState<GtfsComparison[] | null>(null);
  const [computing, setComputing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState({ dataset1: 0, dataset2: 0 });
  const [loadingStatus, setLoadingStatus] = useState({ dataset1: '', dataset2: '' });

  const handleLoadDataset = async (instance: any, name: string, datasetNum: 1 | 2) => {
    setComputing(true);
    try {
      const statistics = await computeStatistics(instance);
      const data: GtfsData = { name, instance, statistics };

      if (datasetNum === 1) {
        setDataset1(data);
        // If dataset 2 exists, recompute comparison
        if (dataset2?.statistics) {
          const comps = compareStatistics(statistics, dataset2.statistics);
          setComparisons(comps);
        }
      } else {
        setDataset2(data);
        // If dataset 1 exists, compute comparison
        if (dataset1?.statistics) {
          const comps = compareStatistics(dataset1.statistics, statistics);
          setComparisons(comps);
        }
      }
    } catch (error) {
      console.error('Error computing statistics:', error);
      alert('Failed to compute statistics. Please try again.');
    } finally {
      setComputing(false);
    }
  };

  const handleClearDataset = (datasetNum: 1 | 2) => {
    if (datasetNum === 1) {
      setDataset1(null);
    } else {
      setDataset2(null);
    }
    setComparisons(null);
  };

  // Function to load GTFS from URL
  const loadGtfsFromUrl = async (url: string, name: string, datasetNum: 1 | 2) => {
    try {
      const statusKey = datasetNum === 1 ? 'dataset1' : 'dataset2';
      setLoadingStatus(prev => ({ ...prev, [statusKey]: `Loading ${name}...` }));

      const { GtfsSqlJs } = await import('gtfs-sqljs');

      const gtfs = await GtfsSqlJs.fromZip(url, {
        onProgress: (progressInfo: any) => {
          setLoadingProgress(prev => ({
            ...prev,
            [statusKey]: progressInfo.percentComplete || 0
          }));
        }
      });

      setLoadingStatus(prev => ({ ...prev, [statusKey]: `Computing statistics for ${name}...` }));
      setComputing(true);

      const statistics = await computeStatistics(gtfs);
      const data: GtfsData = { name, instance: gtfs, statistics };

      if (datasetNum === 1) {
        setDataset1(data);
      } else {
        setDataset2(data);
      }

      setLoadingStatus(prev => ({ ...prev, [statusKey]: `${name} loaded successfully` }));
      setComputing(false);

      return data;
    } catch (error) {
      const statusKey = datasetNum === 1 ? 'dataset1' : 'dataset2';
      setLoadingStatus(prev => ({
        ...prev,
        [statusKey]: `Error loading ${name}: ${error instanceof Error ? error.message : 'Unknown error'}`
      }));
      console.error(`Error loading dataset ${datasetNum}:`, error);
      setComputing(false);
      throw error;
    }
  };

  // Auto-load datasets on mount
  useEffect(() => {
    const loadDefaultDatasets = async () => {
      setLoading(true);

      try {
        // Load both datasets in parallel
        const [data1, data2] = await Promise.all([
          loadGtfsFromUrl(DEFAULT_DATASET_1_URL, 'Car Jaune - September 2025', 1),
          loadGtfsFromUrl(DEFAULT_DATASET_2_URL, 'Car Jaune - December 2025', 2)
        ]);

        // Compute comparison
        if (data1?.statistics && data2?.statistics) {
          const comps = compareStatistics(data1.statistics, data2.statistics);
          setComparisons(comps);
        }
      } catch (error) {
        console.error('Error loading default datasets:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDefaultDatasets();
  }, []);

  return (
    <div className="app">
      <header className="app-header">
        <h1>GTFS Comparison Tool</h1>
        <p>Load two GTFS datasets to compare transit statistics</p>
      </header>

      <main className="app-main">
        {loading && (
          <div className="auto-loading-overlay">
            <div className="auto-loading-container">
              <h2>Loading GTFS Datasets...</h2>
              <div className="loading-dataset">
                <p>{loadingStatus.dataset1}</p>
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{ width: `${loadingProgress.dataset1}%` }}
                  >
                    {loadingProgress.dataset1.toFixed(0)}%
                  </div>
                </div>
              </div>
              <div className="loading-dataset">
                <p>{loadingStatus.dataset2}</p>
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{ width: `${loadingProgress.dataset2}%` }}
                  >
                    {loadingProgress.dataset2.toFixed(0)}%
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="loaders-container">
          <div className="loader-wrapper">
            {!dataset1 ? (
              <GtfsLoader
                onLoad={(instance, name) => handleLoadDataset(instance, name, 1)}
                datasetNumber={1}
                disabled={computing || loading}
              />
            ) : (
              <div className="loaded-dataset">
                <div className="dataset-header">
                  <h3>Dataset 1: {dataset1.name}</h3>
                  <button
                    className="clear-button"
                    onClick={() => handleClearDataset(1)}
                    disabled={computing || loading}
                  >
                    Clear
                  </button>
                </div>
                {dataset1.statistics && (
                  <StatisticsDisplay
                    name={dataset1.name}
                    statistics={dataset1.statistics}
                  />
                )}
              </div>
            )}
          </div>

          <div className="loader-wrapper">
            {!dataset2 ? (
              <GtfsLoader
                onLoad={(instance, name) => handleLoadDataset(instance, name, 2)}
                datasetNumber={2}
                disabled={computing || loading}
              />
            ) : (
              <div className="loaded-dataset">
                <div className="dataset-header">
                  <h3>Dataset 2: {dataset2.name}</h3>
                  <button
                    className="clear-button"
                    onClick={() => handleClearDataset(2)}
                    disabled={computing || loading}
                  >
                    Clear
                  </button>
                </div>
                {dataset2.statistics && (
                  <StatisticsDisplay
                    name={dataset2.name}
                    statistics={dataset2.statistics}
                  />
                )}
              </div>
            )}
          </div>
        </div>

        {computing && (
          <div className="computing-message">
            Computing statistics...
          </div>
        )}

        {comparisons && dataset1 && dataset2 && (
          <ComparisonTable
            comparisons={comparisons}
            name1={dataset1.name}
            name2={dataset2.name}
          />
        )}

        {!dataset1 && !dataset2 && (
          <div className="welcome-message">
            <h2>Welcome to GTFS Comparison Tool</h2>
            <p>
              This tool allows you to compare two GTFS (General Transit Feed Specification) datasets.
              You can load GTFS data from a URL or upload a local ZIP file.
            </p>
            <p>
              After loading both datasets, the tool will automatically compute and display:
            </p>
            <ul>
              <li>Number of agencies, routes, stops, and trips in each dataset</li>
              <li>Route type distribution</li>
              <li>Comparison between the two datasets (absolute and percentage differences)</li>
            </ul>
            <p className="get-started">Get started by loading your first dataset above!</p>
          </div>
        )}
      </main>

      <footer className="app-footer">
        <p>
          Powered by{' '}
          <a
            href="https://github.com/SysDevRun/gtfs-sqljs"
            target="_blank"
            rel="noopener noreferrer"
          >
            gtfs-sqljs
          </a>
        </p>
      </footer>
    </div>
  );
}

export default App;
