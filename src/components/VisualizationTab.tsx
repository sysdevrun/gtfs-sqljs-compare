import { useState, useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from 'recharts';
import { Filter } from 'lucide-react';
import type { TariffGrid, UserCategory, ServiceType } from '../types/water';
import { mockUsers, consumptionBrackets, communes, epcis } from '../data/mockData';
import { calculateStatistics, aggregateStatistics } from '../utils/calculations';

interface VisualizationTabProps {
  tariffGrids: TariffGrid[];
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

const categoryLabels: Record<UserCategory, string> = {
  domestique: 'Domestique',
  agricole: 'Agricole',
  industriel: 'Industriel',
  commercial: 'Commercial',
};

export default function VisualizationTab({ tariffGrids }: VisualizationTabProps) {
  const [filters, setFilters] = useState<{
    commune?: string;
    epci?: string;
    category?: UserCategory;
    serviceType?: ServiceType;
  }>({});

  // Calcul des statistiques
  const statistics = useMemo(() => {
    return calculateStatistics(mockUsers, tariffGrids, consumptionBrackets, filters);
  }, [tariffGrids, filters]);

  // Agrégation par EPCI
  const epciStats = useMemo(() => {
    return aggregateStatistics(statistics, 'epci');
  }, [statistics]);

  // Distribution par tranche de consommation (agrégée)
  const consumptionDistribution = useMemo(() => {
    const distribution = consumptionBrackets.map((bracket) => {
      let userCount = 0;
      let totalConsumption = 0;
      let totalRevenue = 0;

      statistics.forEach((stat) => {
        const dist = stat.distributionByBracket.find(
          (d) => d.bracket.label === bracket.label
        );
        if (dist) {
          userCount += dist.userCount;
          totalConsumption += dist.totalConsumption;
          totalRevenue += dist.totalRevenue;
        }
      });

      return {
        bracket: bracket.label,
        'Nombre d\'abonnés': userCount,
        'Consommation (m³)': Math.round(totalConsumption),
        'Recettes (€)': Math.round(totalRevenue),
      };
    });

    return distribution.filter((d) => d["Nombre d'abonnés"] > 0);
  }, [statistics]);

  // Distribution par catégorie d'usagers
  const categoryDistribution = useMemo(() => {
    const byCategory = new Map<UserCategory, { count: number; consumption: number; revenue: number }>();

    statistics.forEach((stat) => {
      if (!byCategory.has(stat.category)) {
        byCategory.set(stat.category, { count: 0, consumption: 0, revenue: 0 });
      }
      const data = byCategory.get(stat.category)!;
      data.count += stat.subscriberCount;
      data.consumption += stat.totalConsumption;
      data.revenue += stat.totalRevenue;
    });

    return Array.from(byCategory.entries()).map(([category, data]) => ({
      name: categoryLabels[category],
      'Nombre d\'abonnés': data.count,
      'Consommation (m³)': Math.round(data.consumption),
      'Recettes (€)': Math.round(data.revenue),
    }));
  }, [statistics]);

  // Distribution des recettes par acteur (agrégée)
  const revenueBreakdown = useMemo(() => {
    let collectiviteTotal = 0;
    let delegataireTotal = 0;
    let officeEauTotal = 0;
    let tvaTotal = 0;

    statistics.forEach((stat) => {
      stat.distributionByBracket.forEach((dist) => {
        collectiviteTotal += dist.revenueBreakdown.collectivite;
        delegataireTotal += dist.revenueBreakdown.delegataire;
        officeEauTotal += dist.revenueBreakdown.officeEau;
        tvaTotal += dist.revenueBreakdown.tva;
      });
    });

    return [
      { name: 'Collectivité', value: Math.round(collectiviteTotal) },
      { name: 'Délégataire', value: Math.round(delegataireTotal) },
      { name: 'Office de l\'Eau', value: Math.round(officeEauTotal) },
      { name: 'TVA', value: Math.round(tvaTotal) },
    ];
  }, [statistics]);

  // Statistiques globales
  const globalStats = useMemo(() => {
    const totalSubscribers = statistics.reduce((sum, s) => sum + s.subscriberCount, 0);
    const totalConsumption = statistics.reduce((sum, s) => sum + s.totalConsumption, 0);
    const totalRevenue = statistics.reduce((sum, s) => sum + s.totalRevenue, 0);

    return {
      subscribers: totalSubscribers,
      consumption: totalConsumption,
      revenue: totalRevenue,
      avgConsumption: totalSubscribers > 0 ? totalConsumption / totalSubscribers : 0,
    };
  }, [statistics]);

  return (
    <div className="space-y-6">
      {/* Filtres */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-gray-600" />
          <h2 className="text-xl font-bold text-gray-900">Filtres</h2>
        </div>

        <div className="grid md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">EPCI</label>
            <select
              value={filters.epci ?? ''}
              onChange={(e) =>
                setFilters({ ...filters, epci: e.target.value || undefined, commune: undefined })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Tous les EPCI</option>
              {epcis.map((epci) => (
                <option key={epci.name} value={epci.name}>
                  {epci.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Commune</label>
            <select
              value={filters.commune ?? ''}
              onChange={(e) => setFilters({ ...filters, commune: e.target.value || undefined })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={!filters.epci}
            >
              <option value="">Toutes les communes</option>
              {communes
                .filter((c) => !filters.epci || c.epci === filters.epci)
                .map((commune) => (
                  <option key={commune.name} value={commune.name}>
                    {commune.name}
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
            <select
              value={filters.category ?? ''}
              onChange={(e) =>
                setFilters({ ...filters, category: (e.target.value as UserCategory) || undefined })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Toutes les catégories</option>
              <option value="domestique">Domestique</option>
              <option value="commercial">Commercial</option>
              <option value="agricole">Agricole</option>
              <option value="industriel">Industriel</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Service</label>
            <select
              value={filters.serviceType ?? ''}
              onChange={(e) =>
                setFilters({ ...filters, serviceType: (e.target.value as ServiceType) || undefined })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Tous les services</option>
              <option value="eau_potable">Eau Potable</option>
              <option value="eau_potable_assainissement">Eau Potable + Assainissement</option>
            </select>
          </div>
        </div>

        {(filters.epci || filters.commune || filters.category || filters.serviceType) && (
          <button
            onClick={() => setFilters({})}
            className="mt-4 text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Réinitialiser les filtres
          </button>
        )}
      </div>

      {/* Statistiques globales */}
      <div className="grid md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Nombre d'abonnés</h3>
          <p className="text-3xl font-bold text-blue-600">{globalStats.subscribers.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Consommation totale</h3>
          <p className="text-3xl font-bold text-green-600">
            {Math.round(globalStats.consumption).toLocaleString()} m³
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Consommation moyenne</h3>
          <p className="text-3xl font-bold text-orange-600">
            {Math.round(globalStats.avgConsumption)} m³
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Recettes totales</h3>
          <p className="text-3xl font-bold text-purple-600">
            {Math.round(globalStats.revenue).toLocaleString()} €
          </p>
        </div>
      </div>

      {/* Distribution par catégorie */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">
          Distribution par catégorie d'usagers
        </h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={categoryDistribution}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip formatter={(value: number) => value.toLocaleString()} />
            <Legend />
            <Bar yAxisId="left" dataKey="Nombre d'abonnés" fill="#3B82F6" />
            <Bar yAxisId="right" dataKey="Recettes (€)" fill="#10B981" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Distribution par tranche de consommation */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">
          Distribution par tranche de consommation
        </h2>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={consumptionDistribution}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="bracket" angle={-45} textAnchor="end" height={100} />
            <YAxis />
            <Tooltip formatter={(value: number) => value.toLocaleString()} />
            <Legend />
            <Bar dataKey="Nombre d'abonnés" fill="#3B82F6" />
            <Bar dataKey="Consommation (m³)" fill="#10B981" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Répartition des recettes */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Répartition des recettes</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={revenueBreakdown}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {revenueBreakdown.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => `${value.toLocaleString()} €`} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Détail des recettes</h2>
          <div className="space-y-4">
            {revenueBreakdown.map((item, index) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="text-gray-700">{item.name}</span>
                </div>
                <span className="font-semibold text-gray-900">
                  {item.value.toLocaleString()} €
                </span>
              </div>
            ))}
            <div className="border-t pt-4 flex items-center justify-between">
              <span className="font-bold text-gray-900">Total</span>
              <span className="font-bold text-gray-900 text-lg">
                {revenueBreakdown.reduce((sum, item) => sum + item.value, 0).toLocaleString()} €
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Statistiques par EPCI */}
      {!filters.commune && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Statistiques par EPCI</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    EPCI
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Abonnés
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Consommation (m³)
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Recettes (€)
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {epciStats.map((epci) => (
                  <tr key={epci.name} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {epci.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-500">
                      {epci.subscriberCount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-500">
                      {Math.round(epci.totalConsumption).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-500">
                      {Math.round(epci.totalRevenue).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
