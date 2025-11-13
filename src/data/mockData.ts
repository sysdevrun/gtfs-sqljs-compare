import type {
  EPCI,
  Commune,
  TariffGrid,
  UserData,
  ConsumptionBracket,
  UserCategory,
  ServiceType,
} from '../types/water';

// EPCI et communes de La Réunion
export const epcis: EPCI[] = [
  {
    name: 'CINOR',
    communes: ['Saint-Denis', 'Sainte-Marie', 'Sainte-Suzanne'],
  },
  {
    name: 'TCO',
    communes: ['Saint-Paul', 'Le Port', 'La Possession'],
  },
  {
    name: 'CIREST',
    communes: ['Saint-Benoît', 'Sainte-Rose', 'Bras-Panon', 'Plaine-des-Palmistes'],
  },
  {
    name: 'CASUD',
    communes: ['Saint-Pierre', 'Saint-Louis', 'Le Tampon', 'Entre-Deux'],
  },
  {
    name: 'CIVIS',
    communes: ['Saint-Joseph', 'Petite-Île', 'Les Avirons'],
  },
];

export const communes: Commune[] = epcis.flatMap((epci) =>
  epci.communes.map((commune) => ({
    name: commune,
    epci: epci.name,
  }))
);

// Tranches de consommation standards
export const consumptionBrackets: ConsumptionBracket[] = [
  { min: 0, max: 30, label: '0-30 m³' },
  { min: 30, max: 60, label: '30-60 m³' },
  { min: 60, max: 90, label: '60-90 m³' },
  { min: 90, max: 120, label: '90-120 m³' },
  { min: 120, max: 150, label: '120-150 m³' },
  { min: 150, max: 200, label: '150-200 m³' },
  { min: 200, max: 300, label: '200-300 m³' },
  { min: 300, max: 500, label: '300-500 m³' },
  { min: 500, max: 1000, label: '500-1000 m³' },
  { min: 1000, max: Infinity, label: '> 1000 m³' },
];

// Grilles tarifaires fictives
export const defaultTariffGrids: TariffGrid[] = [
  // Tarif domestique - Eau potable seule
  {
    id: 'dom-ep-1',
    name: 'Tarif Domestique - Eau Potable',
    category: 'domestique',
    serviceType: 'eau_potable',
    fixedFee: 45.0, // € par an
    brackets: [
      { min: 0, max: 15, pricePerM3: 1.2 },
      { min: 15, max: 40, pricePerM3: 1.8 },
      { min: 40, max: null, pricePerM3: 2.5 },
    ],
    collectiviteRate: 45, // % de la facture
    delegataireRate: 35, // % de la facture
    officeEauRate: 15, // % de la facture
    tvaRate: 5.5, // TVA réduite
  },
  // Tarif domestique - Eau potable + Assainissement
  {
    id: 'dom-epa-1',
    name: 'Tarif Domestique - Eau Potable + Assainissement',
    category: 'domestique',
    serviceType: 'eau_potable_assainissement',
    fixedFee: 85.0,
    brackets: [
      { min: 0, max: 15, pricePerM3: 2.4 },
      { min: 15, max: 40, pricePerM3: 3.6 },
      { min: 40, max: null, pricePerM3: 5.0 },
    ],
    collectiviteRate: 48,
    delegataireRate: 32,
    officeEauRate: 15,
    tvaRate: 5.5,
  },
  // Tarif agricole - Eau potable seule
  {
    id: 'agr-ep-1',
    name: 'Tarif Agricole - Eau Potable',
    category: 'agricole',
    serviceType: 'eau_potable',
    fixedFee: 120.0,
    brackets: [
      { min: 0, max: 100, pricePerM3: 0.9 },
      { min: 100, max: 500, pricePerM3: 0.75 },
      { min: 500, max: null, pricePerM3: 0.65 },
    ],
    collectiviteRate: 40,
    delegataireRate: 40,
    officeEauRate: 15,
    tvaRate: 10,
  },
  // Tarif industriel - Eau potable + Assainissement
  {
    id: 'ind-epa-1',
    name: 'Tarif Industriel - Eau Potable + Assainissement',
    category: 'industriel',
    serviceType: 'eau_potable_assainissement',
    fixedFee: 450.0,
    brackets: [
      { min: 0, max: 200, pricePerM3: 3.2 },
      { min: 200, max: 1000, pricePerM3: 2.8 },
      { min: 1000, max: null, pricePerM3: 2.5 },
    ],
    collectiviteRate: 42,
    delegataireRate: 38,
    officeEauRate: 15,
    tvaRate: 20,
  },
  // Tarif commercial - Eau potable + Assainissement
  {
    id: 'com-epa-1',
    name: 'Tarif Commercial - Eau Potable + Assainissement',
    category: 'commercial',
    serviceType: 'eau_potable_assainissement',
    fixedFee: 180.0,
    brackets: [
      { min: 0, max: 50, pricePerM3: 2.8 },
      { min: 50, max: 200, pricePerM3: 3.2 },
      { min: 200, max: null, pricePerM3: 3.8 },
    ],
    collectiviteRate: 44,
    delegataireRate: 36,
    officeEauRate: 15,
    tvaRate: 20,
  },
];

// Fonction pour générer des données d'abonnés fictives
function generateRandomUsers(count: number): UserData[] {
  const users: UserData[] = [];
  const categories: UserCategory[] = ['domestique', 'agricole', 'industriel', 'commercial'];
  const serviceTypes: ServiceType[] = ['eau_potable', 'eau_potable_assainissement'];

  // Poids de distribution par catégorie
  const categoryWeights = {
    domestique: 0.75,
    commercial: 0.15,
    agricole: 0.07,
    industriel: 0.03,
  };

  for (let i = 0; i < count; i++) {
    // Sélection pondérée de la catégorie
    const rand = Math.random();
    let category: UserCategory;
    if (rand < categoryWeights.domestique) {
      category = 'domestique';
    } else if (rand < categoryWeights.domestique + categoryWeights.commercial) {
      category = 'commercial';
    } else if (rand < categoryWeights.domestique + categoryWeights.commercial + categoryWeights.agricole) {
      category = 'agricole';
    } else {
      category = 'industriel';
    }

    // Sélection aléatoire de la commune
    const commune = communes[Math.floor(Math.random() * communes.length)];

    // Service type: 70% avec assainissement
    const serviceType: ServiceType =
      Math.random() < 0.7 ? 'eau_potable_assainissement' : 'eau_potable';

    // Consommation basée sur la catégorie (distribution réaliste)
    let consumption: number;
    switch (category) {
      case 'domestique':
        // Distribution normale autour de 80 m³/an (écart type ~40)
        consumption = Math.max(10, Math.round(gaussianRandom(80, 40)));
        break;
      case 'commercial':
        // Distribution plus large: 50-400 m³/an
        consumption = Math.max(30, Math.round(gaussianRandom(150, 80)));
        break;
      case 'agricole':
        // Grande variation: 100-2000 m³/an
        consumption = Math.max(100, Math.round(gaussianRandom(600, 400)));
        break;
      case 'industriel':
        // Très grande variation: 500-5000 m³/an
        consumption = Math.max(500, Math.round(gaussianRandom(2000, 1000)));
        break;
    }

    users.push({
      id: `user-${i + 1}`,
      category,
      commune: commune.name,
      epci: commune.epci,
      serviceType,
      consumption,
    });
  }

  return users;
}

// Fonction pour générer une distribution gaussienne (Box-Muller)
function gaussianRandom(mean: number, stdDev: number): number {
  const u1 = Math.random();
  const u2 = Math.random();
  const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  return z0 * stdDev + mean;
}

// Génération de 5000 abonnés fictifs
export const mockUsers: UserData[] = generateRandomUsers(5000);
