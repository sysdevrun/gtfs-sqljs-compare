import { useState } from 'react';
import { Settings, BarChart3, Calculator } from 'lucide-react';
import ParametersTab from './ParametersTab';
import VisualizationTab from './VisualizationTab';
import SimulationTab from './SimulationTab';
import { defaultTariffGrids } from '../data/mockData';
import type { TariffGrid } from '../types/water';

type TabType = 'parameters' | 'visualization' | 'simulation';

export default function WaterPriceApp() {
  const [activeTab, setActiveTab] = useState<TabType>('visualization');
  const [tariffGrids, setTariffGrids] = useState<TariffGrid[]>(defaultTariffGrids);

  const tabs = [
    { id: 'visualization' as const, label: 'Visualisation', icon: BarChart3 },
    { id: 'simulation' as const, label: 'Simulation', icon: Calculator },
    { id: 'parameters' as const, label: 'Paramètres', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-blue-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold">
            Outil de Simulation du Prix de l'Eau - La Réunion
          </h1>
          <p className="mt-2 text-blue-100">
            Visualisation et simulation des tarifs de l'eau potable et de l'assainissement
          </p>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4">
          <nav className="flex space-x-8" aria-label="Tabs">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center gap-2 py-4 px-3 border-b-2 font-medium text-sm
                    transition-colors duration-200
                    ${
                      isActive
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }
                  `}
                >
                  <Icon className="w-5 h-5" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {activeTab === 'parameters' && (
          <ParametersTab tariffGrids={tariffGrids} setTariffGrids={setTariffGrids} />
        )}
        {activeTab === 'visualization' && <VisualizationTab tariffGrids={tariffGrids} />}
        {activeTab === 'simulation' && <SimulationTab tariffGrids={tariffGrids} />}
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-gray-300 mt-16">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <p className="text-center text-sm">
            Office de l'Eau de La Réunion - Outil de simulation tarifaire © 2024
          </p>
        </div>
      </footer>
    </div>
  );
}
