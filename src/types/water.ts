// Types pour l'application de simulation du prix de l'eau

export type UserCategory = 'domestique' | 'agricole' | 'industriel' | 'commercial';

export type ServiceType = 'eau_potable' | 'eau_potable_assainissement';

export interface ConsumptionBracket {
  min: number; // en m³
  max: number; // en m³
  label: string;
}

export interface TariffBracket {
  min: number; // en m³
  max: number | null; // null = illimité
  pricePerM3: number; // €/m³
}

export interface TariffGrid {
  id: string;
  name: string;
  category: UserCategory;
  serviceType: ServiceType;
  fixedFee: number; // Part fixe annuelle en €
  brackets: TariffBracket[]; // Tarification par tranches
  delegataireRate: number; // % du tarif pour le délégataire
  officeEauRate: number; // % du tarif pour l'Office de l'eau
  collectiviteRate: number; // % du tarif pour la collectivité
  tvaRate: number; // Taux de TVA en %
}

export interface UserData {
  id: string;
  category: UserCategory;
  commune: string;
  epci: string;
  serviceType: ServiceType;
  consumption: number; // en m³/an
}

export interface ConsumptionDistribution {
  bracket: ConsumptionBracket;
  userCount: number; // Nombre d'abonnés dans cette tranche
  totalConsumption: number; // Volume total consommé en m³
  totalRevenue: number; // Recettes totales en €
  revenueBreakdown: RevenueBreakdown;
}

export interface RevenueBreakdown {
  collectivite: number; // €
  delegataire: number; // €
  officeEau: number; // €
  tva: number; // €
  total: number; // €
}

export interface BillSimulation {
  consumption: number; // m³
  fixedFee: number; // €
  variableFee: number; // €
  subtotal: number; // €
  collectivitePart: number; // €
  delegatairePart: number; // €
  officeEauPart: number; // €
  tva: number; // €
  total: number; // €
  pricePerM3: number; // €/m³
}

export interface Statistics {
  commune: string;
  epci: string;
  category: UserCategory;
  serviceType: ServiceType;
  subscriberCount: number;
  totalConsumption: number; // m³
  averageConsumption: number; // m³
  totalRevenue: number; // €
  distributionByBracket: ConsumptionDistribution[];
}

export interface Commune {
  name: string;
  epci: string;
}

export interface EPCI {
  name: string;
  communes: string[];
}
