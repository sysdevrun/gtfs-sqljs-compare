import { useState } from 'react';
import { Edit2, Plus, Save, X } from 'lucide-react';
import type { TariffGrid } from '../types/water';

interface ParametersTabProps {
  tariffGrids: TariffGrid[];
  setTariffGrids: (grids: TariffGrid[]) => void;
}

export default function ParametersTab({ tariffGrids, setTariffGrids }: ParametersTabProps) {
  const [selectedGrid, setSelectedGrid] = useState<TariffGrid | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedGrid, setEditedGrid] = useState<TariffGrid | null>(null);

  const handleEdit = (grid: TariffGrid) => {
    setSelectedGrid(grid);
    setEditedGrid({ ...grid, brackets: [...grid.brackets] });
    setIsEditing(true);
  };

  const handleSave = () => {
    if (!editedGrid) return;

    setTariffGrids(
      tariffGrids.map((grid) => (grid.id === editedGrid.id ? editedGrid : grid))
    );
    setIsEditing(false);
    setSelectedGrid(editedGrid);
  };

  const handleCancel = () => {
    setEditedGrid(null);
    setIsEditing(false);
  };

  const categoryLabels = {
    domestique: 'Domestique',
    agricole: 'Agricole',
    industriel: 'Industriel',
    commercial: 'Commercial',
  };

  const serviceLabels = {
    eau_potable: 'Eau Potable',
    eau_potable_assainissement: 'Eau Potable + Assainissement',
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Grilles Tarifaires</h2>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Plus className="w-4 h-4" />
            Nouvelle grille
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Liste des grilles */}
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-700 mb-3">Grilles disponibles</h3>
            {tariffGrids.map((grid) => (
              <div
                key={grid.id}
                className={`
                  p-4 border rounded-lg cursor-pointer transition-all
                  ${
                    selectedGrid?.id === grid.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }
                `}
                onClick={() => {
                  setSelectedGrid(grid);
                  setIsEditing(false);
                }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{grid.name}</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      {categoryLabels[grid.category]} • {serviceLabels[grid.serviceType]}
                    </p>
                    <div className="mt-2 text-sm text-gray-500">
                      Part fixe : <span className="font-medium">{grid.fixedFee.toFixed(2)} €/an</span>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEdit(grid);
                    }}
                    className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Détails de la grille sélectionnée */}
          <div className="space-y-4">
            {selectedGrid && !isEditing && (
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="font-semibold text-gray-900 mb-4">{selectedGrid.name}</h3>

                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Catégorie :</span>
                      <p className="font-medium">{categoryLabels[selectedGrid.category]}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Service :</span>
                      <p className="font-medium">{serviceLabels[selectedGrid.serviceType]}</p>
                    </div>
                  </div>

                  <div className="border-t pt-3">
                    <span className="text-gray-600 text-sm">Part fixe :</span>
                    <p className="font-medium text-lg">{selectedGrid.fixedFee.toFixed(2)} € / an</p>
                  </div>

                  <div className="border-t pt-3">
                    <h4 className="font-medium text-gray-900 mb-2">Tranches tarifaires :</h4>
                    <div className="space-y-2">
                      {selectedGrid.brackets.map((bracket, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between bg-white p-3 rounded border border-gray-200"
                        >
                          <span className="text-sm text-gray-600">
                            {bracket.min} - {bracket.max ?? '∞'} m³
                          </span>
                          <span className="font-medium text-blue-600">
                            {bracket.pricePerM3.toFixed(2)} € / m³
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="border-t pt-3">
                    <h4 className="font-medium text-gray-900 mb-2">Répartition des recettes :</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Collectivité :</span>
                        <span className="font-medium">{selectedGrid.collectiviteRate}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Délégataire :</span>
                        <span className="font-medium">{selectedGrid.delegataireRate}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Office de l'Eau :</span>
                        <span className="font-medium">{selectedGrid.officeEauRate}%</span>
                      </div>
                      <div className="flex justify-between border-t pt-1 mt-2">
                        <span className="text-gray-600">TVA :</span>
                        <span className="font-medium">{selectedGrid.tvaRate}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {isEditing && editedGrid && (
              <div className="bg-white rounded-lg border-2 border-blue-500 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">Modification de la grille</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={handleSave}
                      className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                    >
                      <Save className="w-4 h-4" />
                      Enregistrer
                    </button>
                    <button
                      onClick={handleCancel}
                      className="flex items-center gap-2 px-3 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 text-sm"
                    >
                      <X className="w-4 h-4" />
                      Annuler
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Part fixe (€/an)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={editedGrid.fixedFee}
                      onChange={(e) =>
                        setEditedGrid({ ...editedGrid, fixedFee: parseFloat(e.target.value) })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Tranches tarifaires</h4>
                    <div className="space-y-2">
                      {editedGrid.brackets.map((bracket, index) => (
                        <div key={index} className="flex gap-2 items-center">
                          <input
                            type="number"
                            value={bracket.min}
                            disabled
                            className="w-20 px-2 py-1 border border-gray-300 rounded text-sm bg-gray-50"
                          />
                          <span className="text-gray-500">-</span>
                          <input
                            type="number"
                            value={bracket.max ?? ''}
                            disabled
                            placeholder="∞"
                            className="w-20 px-2 py-1 border border-gray-300 rounded text-sm bg-gray-50"
                          />
                          <span className="text-gray-500">m³ :</span>
                          <input
                            type="number"
                            step="0.01"
                            value={bracket.pricePerM3}
                            onChange={(e) => {
                              const newBrackets = [...editedGrid.brackets];
                              newBrackets[index].pricePerM3 = parseFloat(e.target.value);
                              setEditedGrid({ ...editedGrid, brackets: newBrackets });
                            }}
                            className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                          <span className="text-gray-500 text-sm">€/m³</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Collectivité (%)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={editedGrid.collectiviteRate}
                        onChange={(e) =>
                          setEditedGrid({
                            ...editedGrid,
                            collectiviteRate: parseFloat(e.target.value),
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Délégataire (%)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={editedGrid.delegataireRate}
                        onChange={(e) =>
                          setEditedGrid({
                            ...editedGrid,
                            delegataireRate: parseFloat(e.target.value),
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Office de l'Eau (%)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={editedGrid.officeEauRate}
                        onChange={(e) =>
                          setEditedGrid({
                            ...editedGrid,
                            officeEauRate: parseFloat(e.target.value),
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        TVA (%)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={editedGrid.tvaRate}
                        onChange={(e) =>
                          setEditedGrid({ ...editedGrid, tvaRate: parseFloat(e.target.value) })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {!selectedGrid && !isEditing && (
              <div className="bg-gray-50 rounded-lg p-12 text-center">
                <p className="text-gray-500">
                  Sélectionnez une grille tarifaire pour voir les détails
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
