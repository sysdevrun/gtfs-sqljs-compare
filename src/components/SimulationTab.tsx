import { useState, useMemo } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Calculator, TrendingUp } from 'lucide-react';
import type { TariffGrid, UserCategory, ServiceType } from '../types/water';
import { calculateBill, compareTariffs } from '../utils/calculations';

interface SimulationTabProps {
  tariffGrids: TariffGrid[];
}

const categoryLabels: Record<UserCategory, string> = {
  domestique: 'Domestique',
  agricole: 'Agricole',
  industriel: 'Industriel',
  commercial: 'Commercial',
};

const serviceLabels: Record<ServiceType, string> = {
  eau_potable: 'Eau Potable',
  eau_potable_assainissement: 'Eau Potable + Assainissement',
};

export default function SimulationTab({ tariffGrids }: SimulationTabProps) {
  const [category, setCategory] = useState<UserCategory>('domestique');
  const [serviceType, setServiceType] = useState<ServiceType>('eau_potable_assainissement');
  const [consumption, setConsumption] = useState<number>(100);
  const [comparisonTariffId, setComparisonTariffId] = useState<string>('');

  // Grille tarifaire sélectionnée
  const selectedTariff = useMemo(() => {
    return tariffGrids.find((t) => t.category === category && t.serviceType === serviceType);
  }, [tariffGrids, category, serviceType]);

  // Grille tarifaire de comparaison
  const comparisonTariff = useMemo(() => {
    return tariffGrids.find((t) => t.id === comparisonTariffId);
  }, [tariffGrids, comparisonTariffId]);

  // Calcul de la facture
  const bill = useMemo(() => {
    if (!selectedTariff) return null;
    return calculateBill(consumption, selectedTariff);
  }, [consumption, selectedTariff]);

  // Comparaison de tarifs
  const comparison = useMemo(() => {
    if (!selectedTariff || !comparisonTariff) return null;
    return compareTariffs(consumption, selectedTariff, comparisonTariff);
  }, [consumption, selectedTariff, comparisonTariff]);

  // Évolution du coût selon la consommation
  const costEvolution = useMemo(() => {
    if (!selectedTariff) return [];

    const data = [];
    const maxConsumption = category === 'domestique' ? 200 : category === 'commercial' ? 500 : 1000;
    const step = maxConsumption / 20;

    for (let c = 0; c <= maxConsumption; c += step) {
      const billData = calculateBill(c, selectedTariff);
      const dataPoint: any = {
        consumption: Math.round(c),
        'Facture totale': Math.round(billData.total),
        'Prix au m³': c > 0 ? parseFloat(billData.pricePerM3.toFixed(2)) : 0,
      };

      if (comparisonTariff) {
        const compBill = calculateBill(c, comparisonTariff);
        dataPoint['Facture (comparaison)'] = Math.round(compBill.total);
      }

      data.push(dataPoint);
    }

    return data;
  }, [selectedTariff, comparisonTariff, category]);

  if (!selectedTariff) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <p className="text-yellow-800">
          Aucune grille tarifaire disponible pour cette catégorie et ce type de service.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Paramètres de simulation */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center gap-2 mb-6">
          <Calculator className="w-6 h-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">Simulation de facture</h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Catégorie d'usager
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as UserCategory)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="domestique">Domestique</option>
              <option value="commercial">Commercial</option>
              <option value="agricole">Agricole</option>
              <option value="industriel">Industriel</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Type de service</label>
            <select
              value={serviceType}
              onChange={(e) => setServiceType(e.target.value as ServiceType)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="eau_potable">Eau Potable</option>
              <option value="eau_potable_assainissement">Eau Potable + Assainissement</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Consommation annuelle (m³)
            </label>
            <input
              type="number"
              value={consumption}
              onChange={(e) => setConsumption(parseFloat(e.target.value) || 0)}
              min="0"
              step="1"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <input
              type="range"
              value={consumption}
              onChange={(e) => setConsumption(parseFloat(e.target.value))}
              min="0"
              max={category === 'domestique' ? 200 : category === 'commercial' ? 500 : 1000}
              step="1"
              className="w-full mt-2"
            />
          </div>
        </div>

        {/* Comparaison avec une autre grille */}
        <div className="mt-6 pt-6 border-t">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Comparer avec une autre grille (optionnel)
          </label>
          <select
            value={comparisonTariffId}
            onChange={(e) => setComparisonTariffId(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Aucune comparaison</option>
            {tariffGrids
              .filter((t) => t.id !== selectedTariff.id)
              .map((tariff) => (
                <option key={tariff.id} value={tariff.id}>
                  {tariff.name}
                </option>
              ))}
          </select>
        </div>
      </div>

      {/* Résultats de la simulation */}
      {bill && (
        <div className="grid md:grid-cols-2 gap-6">
          {/* Facture détaillée */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Détail de la facture - {selectedTariff.name}
            </h3>

            <div className="space-y-4">
              <div className="flex justify-between items-center pb-3 border-b">
                <span className="text-gray-600">Consommation</span>
                <span className="font-semibold text-lg">{consumption} m³</span>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Part fixe (abonnement)</span>
                  <span className="font-medium">{bill.fixedFee.toFixed(2)} €</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Part variable (consommation)</span>
                  <span className="font-medium">{bill.variableFee.toFixed(2)} €</span>
                </div>
              </div>

              <div className="flex justify-between items-center py-3 border-t border-b font-semibold">
                <span>Sous-total HT</span>
                <span>{bill.subtotal.toFixed(2)} €</span>
              </div>

              <div className="space-y-2 text-sm">
                <h4 className="font-semibold text-gray-700 mt-4">Répartition des recettes :</h4>
                <div className="flex justify-between">
                  <span className="text-gray-600">• Collectivité</span>
                  <span className="font-medium">{bill.collectivitePart.toFixed(2)} €</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">• Délégataire</span>
                  <span className="font-medium">{bill.delegatairePart.toFixed(2)} €</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">• Office de l'Eau</span>
                  <span className="font-medium">{bill.officeEauPart.toFixed(2)} €</span>
                </div>
              </div>

              <div className="flex justify-between items-center pt-3 border-t">
                <span className="text-gray-600">TVA ({selectedTariff.tvaRate}%)</span>
                <span className="font-medium">{bill.tva.toFixed(2)} €</span>
              </div>

              <div className="flex justify-between items-center pt-3 border-t-2 border-gray-800">
                <span className="text-xl font-bold">Total TTC</span>
                <span className="text-2xl font-bold text-blue-600">{bill.total.toFixed(2)} €</span>
              </div>

              <div className="bg-blue-50 rounded-lg p-4 mt-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700 font-medium">Prix moyen au m³</span>
                  <span className="text-xl font-bold text-blue-600">
                    {bill.pricePerM3.toFixed(2)} €/m³
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Comparaison */}
          {comparison && comparisonTariff && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Comparaison - {comparisonTariff.name}
              </h3>

              <div className="space-y-4">
                <div className="flex justify-between items-center pb-3 border-b">
                  <span className="text-gray-600">Consommation</span>
                  <span className="font-semibold text-lg">{consumption} m³</span>
                </div>

                <div className="space-y-3">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Grille actuelle</span>
                      <span className="font-semibold">{comparison.tariff1.total.toFixed(2)} €</span>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Grille de comparaison</span>
                      <span className="font-semibold">{comparison.tariff2.total.toFixed(2)} €</span>
                    </div>
                  </div>
                </div>

                <div
                  className={`rounded-lg p-4 ${
                    comparison.difference > 0
                      ? 'bg-red-50 border border-red-200'
                      : comparison.difference < 0
                      ? 'bg-green-50 border border-green-200'
                      : 'bg-gray-50 border border-gray-200'
                  }`}
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold text-gray-700">Différence</span>
                    <span
                      className={`text-xl font-bold ${
                        comparison.difference > 0
                          ? 'text-red-600'
                          : comparison.difference < 0
                          ? 'text-green-600'
                          : 'text-gray-600'
                      }`}
                    >
                      {comparison.difference > 0 ? '+' : ''}
                      {comparison.difference.toFixed(2)} €
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Variation</span>
                    <span
                      className={`text-lg font-semibold ${
                        comparison.percentDifference > 0
                          ? 'text-red-600'
                          : comparison.percentDifference < 0
                          ? 'text-green-600'
                          : 'text-gray-600'
                      }`}
                    >
                      {comparison.percentDifference > 0 ? '+' : ''}
                      {comparison.percentDifference.toFixed(1)}%
                    </span>
                  </div>
                </div>

                <div className="pt-4 border-t space-y-2 text-sm">
                  <h4 className="font-semibold text-gray-700">Détail comparaison :</h4>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Part fixe</span>
                    <span>
                      {comparison.tariff2.fixedFee.toFixed(2)} € vs{' '}
                      {comparison.tariff1.fixedFee.toFixed(2)} €
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Part variable</span>
                    <span>
                      {comparison.tariff2.variableFee.toFixed(2)} € vs{' '}
                      {comparison.tariff1.variableFee.toFixed(2)} €
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Prix moyen au m³</span>
                    <span>
                      {comparison.tariff2.pricePerM3.toFixed(2)} € vs{' '}
                      {comparison.tariff1.pricePerM3.toFixed(2)} €
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Répartition graphique si pas de comparaison */}
          {!comparison && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Répartition de la facture</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={[
                    { name: 'Collectivité', montant: Math.round(bill.collectivitePart) },
                    { name: 'Délégataire', montant: Math.round(bill.delegatairePart) },
                    { name: "Office de l'Eau", montant: Math.round(bill.officeEauPart) },
                    { name: 'TVA', montant: Math.round(bill.tva) },
                  ]}
                  layout="vertical"
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={120} />
                  <Tooltip formatter={(value: number) => `${value.toLocaleString()} €`} />
                  <Bar dataKey="montant" fill="#3B82F6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}

      {/* Évolution du coût */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp className="w-6 h-6 text-blue-600" />
          <h3 className="text-xl font-bold text-gray-900">
            Évolution du coût selon la consommation
          </h3>
        </div>

        <div className="mb-4">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={costEvolution}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="consumption" label={{ value: 'Consommation (m³)', position: 'insideBottom', offset: -5 }} />
              <YAxis label={{ value: 'Facture (€)', angle: -90, position: 'insideLeft' }} />
              <Tooltip formatter={(value: number) => value.toLocaleString()} />
              <Legend />
              <Line type="monotone" dataKey="Facture totale" stroke="#3B82F6" strokeWidth={2} />
              {comparisonTariff && (
                <Line
                  type="monotone"
                  dataKey="Facture (comparaison)"
                  stroke="#10B981"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-6">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={costEvolution}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="consumption" label={{ value: 'Consommation (m³)', position: 'insideBottom', offset: -5 }} />
              <YAxis label={{ value: 'Prix au m³ (€)', angle: -90, position: 'insideLeft' }} />
              <Tooltip formatter={(value: number) => `${value.toFixed(2)} €/m³`} />
              <Legend />
              <Line type="monotone" dataKey="Prix au m³" stroke="#F59E0B" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
