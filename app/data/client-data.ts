export interface Client {
  id: string;
  name: string;
  email: string;
  budget: number;
  minBudget?: number;
  maxBudget?: number;
  salary: number;
  investmentGoal: string;
  preferredLocation: string;
  investmentPeriod: number;
  status?: string;
  deposit?: number;
  bedrooms?: string;
  notes?: string;
}

export const clientData: Client[] = [
  {
    id: '1',
    name: 'Minh',
    email: 'minh@example.com',
    status: 'Investment',
    budget: 700000,
    minBudget: 0,
    maxBudget: 700000,
    deposit: 100000,
    salary: 170000, // PAYG 100K + Wife 70K
    investmentGoal: 'Rental Yield',
    preferredLocation: 'Western Suburbs',
    investmentPeriod: 10,
    bedrooms: '2 bedrooms',
    notes: 'PAYG 100K a year. Wife: 70k a year',
  },
  {
    id: '2',
    name: 'John Hansen',
    email: 'john.hansen@example.com',
    status: 'First Home Buyer, Self-Occupied',
    budget: 675000, // Mid-range of 650k-700k
    minBudget: 650000,
    maxBudget: 700000,
    deposit: 125000, // Mid-range of 100k-150k
    salary: 100000, // PAYG
    investmentGoal: 'Capital Appreciation',
    preferredLocation: 'East Suburbs, Botany, Hillsdale, Mascot',
    investmentPeriod: 10,
    bedrooms: 'Big 1 bedroom',
    notes: 'PAYG 100K a year',
  },
  {
    id: '3',
    name: 'VM',
    email: 'vm@example.com',
    status: 'Investment',
    budget: 675000, // Mid-range of 650k-700k
    minBudget: 650000,
    maxBudget: 700000,
    deposit: 100000,
    salary: 110000, // Mid-range of 100K-120k, self-employment
    investmentGoal: 'Rental Yield',
    preferredLocation: 'East Suburbs, Botany, Hillsdale, Mascot',
    investmentPeriod: 10,
    bedrooms: 'Big 1 bedroom or 2 bedrooms',
    notes: 'Self-employment, 100K-120k, one house can do the refinance',
  },
  {
    id: '4',
    name: 'Tommy',
    email: 'tommy@example.com',
    status: 'Investment',
    budget: 675000, // Mid-range of 650k-700k
    minBudget: 650000,
    maxBudget: 700000,
    deposit: 175000, // Mid-range of 150k-200k
    salary: 225000, // Mid-range of 200K-250k, self-employment
    investmentGoal: 'Mixed Portfolio',
    preferredLocation: 'East Suburbs, Botany, Hillsdale, Mascot',
    investmentPeriod: 10,
    bedrooms: 'Big 1 bedroom or 2 bedrooms',
    notes:
      'Self-employment, 200K-250k, have one apartment and one off the plan',
  },
  {
    id: '5',
    name: 'Gansuku',
    email: 'gansuku@example.com',
    status: 'Self-Occupied',
    budget: 3000000, // Mid-range of 1M-5M
    minBudget: 1000000,
    maxBudget: 5000000,
    deposit: 150000, // Mid-range of 100k-200k
    salary: 300000, // Self-employment, 300K+
    investmentGoal: 'Capital Appreciation',
    preferredLocation: 'Anywhere',
    investmentPeriod: 15,
    bedrooms: '3-4 bedroom house',
    notes:
      'Self-employment, 300K+, have one apartment in Lidcombe, looking for big and new house for family',
  },
  {
    id: '6',
    name: 'Pradip',
    email: 'pradip@example.com',
    status: 'Investment',
    budget: 725000, // Mid-range of 650k-800k
    minBudget: 650000,
    maxBudget: 800000,
    deposit: 125000, // Mid-range of 100k-150k
    salary: 200000, // PAYG
    investmentGoal: 'Mixed Portfolio',
    preferredLocation: 'Anywhere',
    investmentPeriod: 12,
    bedrooms: '2-3 bedroom apartment or house',
    notes:
      'PAYG 200K a year, looking for good rental income and potential capital gain to grow',
  },
  {
    id: '7',
    name: 'Jiayi',
    email: 'jiayi@example.com',
    status: 'First Home Buyer, Self-Occupied',
    budget: 900000, // Mid-range of 800k-1M
    minBudget: 800000,
    maxBudget: 1000000,
    deposit: 175000, // Mid-range of 150k-200k, can get more
    salary: 200000, // Self-employment, 200K+
    investmentGoal: 'Capital Appreciation',
    preferredLocation: 'Merrylands and close areas',
    investmentPeriod: 10,
    bedrooms: '2 bedrooms',
    notes:
      'Self-employment, 200K+, needs to stay close to her mother, can get more deposit if needed',
  },
  {
    id: '8',
    name: 'Rosha',
    email: 'rosha@example.com',
    status: 'First Home Buyer, Self-Occupied',
    budget: 650000, // Mid-range of 600k-700k
    minBudget: 600000,
    maxBudget: 700000,
    deposit: 50000,
    salary: 70000, // PAYG
    investmentGoal: 'Capital Appreciation',
    preferredLocation: 'Western Suburbs',
    investmentPeriod: 10,
    bedrooms: 'Big 1 bedroom',
    notes: 'PAYG 70K a year',
  },
  {
    id: '9',
    name: 'Lina',
    email: 'lina@example.com',
    status: 'First Home Buyer, Self-Occupied',
    budget: 850000, // Mid-range of 800k-900k
    minBudget: 800000,
    maxBudget: 900000,
    deposit: 2250000, // Mid-range of 2M-2.5M
    salary: 0, // No income
    investmentGoal: 'Capital Appreciation',
    preferredLocation: 'East Suburbs, Botany, Hillsdale, Mascot',
    investmentPeriod: 10,
    bedrooms: 'Big 1 bedroom or 2 bedrooms',
    notes: 'No income, large deposit available (2M-2.5M)',
  },
  {
    id: '10',
    name: 'Ajay',
    email: 'ajay@example.com',
    status: 'Investment',
    budget: 1050000, // Mid-range of 800k-1.3M
    minBudget: 800000,
    maxBudget: 1300000,
    deposit: 300000,
    salary: 0, // No income
    investmentGoal: 'Rental Yield',
    preferredLocation: 'Western Suburbs from Tallawong',
    investmentPeriod: 15,
    bedrooms: 'House',
    notes: 'No income, looking for investment house',
  },
];

/**
 * Get all clients from both client-data.ts and localStorage
 * localStorage clients are appended to the base client data
 */
export function getAllClients(): Client[] {
  const baseClients = [...clientData];

  try {
    const stored = localStorage.getItem('clients');
    if (stored) {
      const localClients = JSON.parse(stored) as Client[];
      // Only add clients from localStorage that don't exist in base data
      const newClients = localClients.filter(
        (lc) => !baseClients.some((bc) => bc.id === lc.id)
      );
      return [...baseClients, ...newClients];
    }
  } catch (e) {
    console.warn('Failed to load clients from localStorage', e);
  }

  return baseClients;
}

/**
 * Get a single client by ID from either client-data.ts or localStorage
 */
export function getClientById(id: string): Client | null {
  const allClients = getAllClients();
  return allClients.find((c) => c.id === id) || null;
}
