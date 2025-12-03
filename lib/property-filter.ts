import { getSydneyData, SYDNEY_STATE } from './data-normalizer';
import {
  calculateInvestmentAnalysis,
  PropertyAnalysis,
} from './investment-calculator';

const realData = getSydneyData();
export type Property = (typeof realData)[number];

export type PropertyWithAnalysis = Property & {
  analysis: PropertyAnalysis;
};

export type PriorityType = 'composite-score' | 'break-even';
export type SortOrder = 'asc' | 'desc';

function tokenizePreferred(preferredLocation: string): string[] {
  return preferredLocation
    .toLowerCase()
    .split(/[,/]|\band\b|\bfrom\b/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

export function filterSydneyProperties(
  preferredLocation: string,
  opts?: { matchSuburbs?: boolean }
): Property[] {
  const tokens = tokenizePreferred(preferredLocation);
  const matchSuburbs = opts?.matchSuburbs ?? true;

  // Check for "Anywhere" or empty location
  const isAnywhere =
    preferredLocation.toLowerCase().includes('anywhere') ||
    !preferredLocation.trim();

  const isTokenMatch = (suburb: string): boolean => {
    if (isAnywhere || !matchSuburbs || tokens.length === 0) return true;
    const s = suburb.toLowerCase();
    return tokens.some((t) => s.includes(t));
  };

  // Prioritize suburb matching first; state is already normalized
  return realData.filter((p) => isTokenMatch(p.Suburb));
}

export function filterSydneyByBudget(
  preferredLocation: string,
  budget: number
): Property[] {
  return filterSydneyProperties(preferredLocation).filter(
    (p) => p['Price (AUD)'] <= budget
  );
}

export function filterWithPriority(
  preferredLocation: string,
  budget: number,
  priorityType: PriorityType,
  sortOrder: SortOrder = 'desc'
): PropertyWithAnalysis[] {
  const properties = filterSydneyByBudget(preferredLocation, budget);

  // Calculate analysis for each property
  const propertiesWithAnalysis: PropertyWithAnalysis[] = properties.map((p) => {
    const analysis = calculateInvestmentAnalysis(
      p['Price (AUD)'],
      p['Estimated Rental Value (Weekly)'],
      p['Maintenance Cost (Annual)']
    );
    return { ...p, analysis };
  });

  // Sort based on priority type
  const sorted = [...propertiesWithAnalysis].sort((a, b) => {
    let compareValue: number;

    if (priorityType === 'composite-score') {
      compareValue = b.analysis.investmentScore - a.analysis.investmentScore;
    } else {
      // break-even priority: lower is better
      compareValue = a.analysis.breakEvenYears - b.analysis.breakEvenYears;
    }

    return sortOrder === 'desc' ? compareValue : -compareValue;
  });

  return sorted;
}
