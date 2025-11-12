# GTFS Comparison Tool

A web application built with Vite, React, and TypeScript that allows you to load and compare two GTFS (General Transit Feed Specification) datasets. The app computes statistics on each dataset and displays both absolute and percentage differences.

## Features

- 📊 Load GTFS data from URLs or local ZIP files
- 🔍 Compute comprehensive statistics for each dataset:
  - Number of agencies, routes, stops, and trips
  - Route type distribution
- 📈 Compare two datasets side-by-side
- 🎯 View differences in both absolute numbers and percentages
- 🚀 Fast processing using [gtfs-sqljs](https://github.com/SysDevRun/gtfs-sqljs)
- 💻 Fully client-side processing (no server required)
- 🎨 Clean, responsive UI

## Tech Stack

- **Frontend**: React 18 with TypeScript
- **Build Tool**: Vite
- **GTFS Processing**: gtfs-sqljs + sql.js
- **Deployment**: GitHub Pages via GitHub Actions

## Getting Started

### Prerequisites

- Node.js 18 or higher
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/sysdevrun/gtfs-sqljs-compare.git
cd gtfs-sqljs-compare
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open your browser to `http://localhost:5173`

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

### Preview Production Build

```bash
npm run preview
```

## Usage

1. **Load First Dataset**:
   - Enter a URL to a GTFS ZIP file, or
   - Upload a local GTFS ZIP file

2. **Load Second Dataset**:
   - Repeat the process for the second dataset

3. **View Results**:
   - Statistics for each dataset are displayed automatically
   - Comparison table shows absolute and percentage differences
   - Positive differences are shown in green, negative in red

## Example GTFS Feeds

This repository includes two sample GTFS datasets in the `data/` directory:

1. **CJ-2025-09-23-offre-2025-aout.zip** - Car Jaune (September 2025 offer)
   - URL: `https://dsp2025.transdev.re/CJ-2025-09-23-offre-2025-aout.zip`

2. **2025-11-04-car-jaune-1er-dec-pysae-08h51.zip** - Car Jaune (December 2025 update)
   - URL: `https://dsp2025.transdev.re/2025-11-04-car-jaune-1er-dec-pysae-08h51.zip`

You can also test with other public GTFS feeds:

- [Sample GTFS Feed](https://gtfs.org/schedule/example/google_transit.zip)
- Check [TransitFeeds](https://transitfeeds.com/) for more real-world GTFS datasets

## Deployment

This project is configured to automatically deploy to GitHub Pages when changes are pushed to the `main` branch.

To enable GitHub Pages deployment:

1. Go to your repository Settings → Pages
2. Set Source to "GitHub Actions"
3. Push to the `main` branch to trigger deployment

## How It Works

The application uses the [gtfs-sqljs](https://github.com/SysDevRun/gtfs-sqljs) library, which:

- Loads GTFS ZIP files directly in the browser
- Uses SQL.js (SQLite compiled to WebAssembly) for efficient querying
- Provides a simple API for accessing GTFS data
- Includes automatic caching for faster subsequent loads

Statistics are computed by querying the GTFS database for:
- Routes, stops, trips, and agencies
- Route types and their distributions
- Custom metrics as needed

## Project Structure

```
gtfs-sqljs-compare/
├── .github/
│   └── workflows/
│       └── deploy.yml          # GitHub Actions deployment workflow
├── src/
│   ├── components/
│   │   ├── GtfsLoader.tsx      # File/URL loader component
│   │   ├── StatisticsDisplay.tsx   # Stats display component
│   │   └── ComparisonTable.tsx     # Comparison table component
│   ├── types/
│   │   └── gtfs.ts             # TypeScript type definitions
│   ├── utils/
│   │   └── gtfsStats.ts        # Statistics computation logic
│   ├── App.tsx                 # Main application component
│   ├── App.css                 # Application styles
│   ├── main.tsx                # Application entry point
│   └── index.css               # Global styles
├── index.html                  # HTML template
├── package.json                # Dependencies and scripts
├── tsconfig.json               # TypeScript configuration
├── vite.config.ts              # Vite configuration
└── README.md                   # This file
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT

## Acknowledgments

- [gtfs-sqljs](https://github.com/SysDevRun/gtfs-sqljs) for GTFS processing
- [GTFS Specification](https://gtfs.org/) for the data format
- [Vite](https://vitejs.dev/) for the blazing fast build tool
- [React](https://react.dev/) for the UI framework