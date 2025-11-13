import type {
  TariffGrid,
  UserData,
  BillSimulation,
  Statistics,
  ConsumptionDistribution,
  RevenueBreakdown,
  ConsumptionBracket,
} from '../types/water';

// Calcule la facture pour une consommation donnée selon une grille tarifaire
export function calculateBill(consumption: number, tariff: TariffGrid): BillSimulation {
  let variableFee = 0;

  // Calcul de la part variable par tranches
  let remainingConsumption = consumption;
  for (const bracket of tariff.brackets) {
    if (remainingConsumption <= 0) break;

    const bracketMin = bracket.min;
    const bracketMax = bracket.max ?? Infinity;
    const bracketSize = bracketMax - bracketMin;

    const consumptionInBracket = Math.min(remainingConsumption, bracketSize);
    variableFee += consumptionInBracket * bracket.pricePerM3;

    remainingConsumption -= consumptionInBracket;
  }

  const subtotal = tariff.fixedFee + variableFee;

  // Répartition des recettes
  const collectivitePart = (subtotal * tariff.collectiviteRate) / 100;
  const delegatairePart = (subtotal * tariff.delegataireRate) / 100;
  const officeEauPart = (subtotal * tariff.officeEauRate) / 100;

  // Calcul de la TVA
  const tva = (subtotal * tariff.tvaRate) / 100;
  const total = subtotal + tva;

  // Prix moyen au m³
  const pricePerM3 = consumption > 0 ? total / consumption : 0;

  return {
    consumption,
    fixedFee: tariff.fixedFee,
    variableFee,
    subtotal,
    collectivitePart,
    delegatairePart,
    officeEauPart,
    tva,
    total,
    pricePerM3,
  };
}

// Calcule les statistiques pour un ensemble d'usagers
export function calculateStatistics(
  users: UserData[],
  tariffGrids: TariffGrid[],
  brackets: ConsumptionBracket[],
  filters?: {
    commune?: string;
    epci?: string;
    category?: string;
    serviceType?: string;
  }
): Statistics[] {
  // Filtrage des usagers
  let filteredUsers = users;
  if (filters) {
    if (filters.commune) {
      filteredUsers = filteredUsers.filter((u) => u.commune === filters.commune);
    }
    if (filters.epci) {
      filteredUsers = filteredUsers.filter((u) => u.epci === filters.epci);
    }
    if (filters.category) {
      filteredUsers = filteredUsers.filter((u) => u.category === filters.category);
    }
    if (filters.serviceType) {
      filteredUsers = filteredUsers.filter((u) => u.serviceType === filters.serviceType);
    }
  }

  // Regrouper par catégorie, type de service, commune et EPCI
  const groups = new Map<string, UserData[]>();

  filteredUsers.forEach((user) => {
    const key = `${user.commune}|${user.epci}|${user.category}|${user.serviceType}`;
    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key)!.push(user);
  });

  // Calculer les statistiques pour chaque groupe
  const statistics: Statistics[] = [];

  groups.forEach((groupUsers, key) => {
    const [commune, epci, category, serviceType] = key.split('|');

    // Trouver la grille tarifaire correspondante
    const tariff = tariffGrids.find(
      (t) => t.category === category && t.serviceType === serviceType
    );

    if (!tariff) return;

    // Calculer les distributions par tranche
    const distributionByBracket: ConsumptionDistribution[] = brackets.map((bracket) => {
      const usersInBracket = groupUsers.filter(
        (u) => u.consumption >= bracket.min && u.consumption < bracket.max
      );

      const totalConsumption = usersInBracket.reduce((sum, u) => sum + u.consumption, 0);

      // Calculer les recettes pour cette tranche
      let totalRevenue = 0;
      let collectiviteTotal = 0;
      let delegataireTotal = 0;
      let officeEauTotal = 0;
      let tvaTotal = 0;

      usersInBracket.forEach((user) => {
        const bill = calculateBill(user.consumption, tariff);
        totalRevenue += bill.total;
        collectiviteTotal += bill.collectivitePart;
        delegataireTotal += bill.delegatairePart;
        officeEauTotal += bill.officeEauPart;
        tvaTotal += bill.tva;
      });

      return {
        bracket,
        userCount: usersInBracket.length,
        totalConsumption,
        totalRevenue,
        revenueBreakdown: {
          collectivite: collectiviteTotal,
          delegataire: delegataireTotal,
          officeEau: officeEauTotal,
          tva: tvaTotal,
          total: totalRevenue,
        },
      };
    });

    // Statistiques globales du groupe
    const totalConsumption = groupUsers.reduce((sum, u) => sum + u.consumption, 0);
    const totalRevenue = distributionByBracket.reduce((sum, d) => sum + d.totalRevenue, 0);

    statistics.push({
      commune,
      epci,
      category: category as any,
      serviceType: serviceType as any,
      subscriberCount: groupUsers.length,
      totalConsumption,
      averageConsumption: totalConsumption / groupUsers.length,
      totalRevenue,
      distributionByBracket,
    });
  });

  return statistics;
}

// Agrège les statistiques par niveau (commune, EPCI, ou région)
export function aggregateStatistics(statistics: Statistics[], level: 'commune' | 'epci' | 'region'): any[] {
  const aggregated = new Map<string, any>();

  statistics.forEach((stat) => {
    let key: string;
    if (level === 'commune') {
      key = stat.commune;
    } else if (level === 'epci') {
      key = stat.epci;
    } else {
      key = 'La Réunion';
    }

    if (!aggregated.has(key)) {
      aggregated.set(key, {
        name: key,
        subscriberCount: 0,
        totalConsumption: 0,
        totalRevenue: 0,
        byCategory: {} as any,
      });
    }

    const agg = aggregated.get(key)!;
    agg.subscriberCount += stat.subscriberCount;
    agg.totalConsumption += stat.totalConsumption;
    agg.totalRevenue += stat.totalRevenue;

    if (!agg.byCategory[stat.category]) {
      agg.byCategory[stat.category] = {
        subscriberCount: 0,
        totalConsumption: 0,
        totalRevenue: 0,
      };
    }

    agg.byCategory[stat.category].subscriberCount += stat.subscriberCount;
    agg.byCategory[stat.category].totalConsumption += stat.totalConsumption;
    agg.byCategory[stat.category].totalRevenue += stat.totalRevenue;
  });

  return Array.from(aggregated.values());
}

// Compare deux grilles tarifaires pour une consommation donnée
export function compareTariffs(
  consumption: number,
  tariff1: TariffGrid,
  tariff2: TariffGrid
): {
  tariff1: BillSimulation;
  tariff2: BillSimulation;
  difference: number;
  percentDifference: number;
} {
  const bill1 = calculateBill(consumption, tariff1);
  const bill2 = calculateBill(consumption, tariff2);

  const difference = bill2.total - bill1.total;
  const percentDifference = bill1.total > 0 ? (difference / bill1.total) * 100 : 0;

  return {
    tariff1: bill1,
    tariff2: bill2,
    difference,
    percentDifference,
  };
}
