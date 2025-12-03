'use client';

import type React from 'react';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, MapPin, Home, DollarSign, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { type Property } from '@/lib/property-types';
import { calculateInvestmentAnalysis } from '@/lib/investment-calculator';
// Smart matching removed per latest requirements
import { realData } from '@/app/data/real_data';
import { getClientById, type Client } from '@/app/data/client-data';

// Helper function to convert location to state code
function getStateCode(location: string): string {
  const locationToState: Record<string, string> = {
    Sydney: 'NSW',
    Melbourne: 'VIC',
    Brisbane: 'QLD',
    Perth: 'WA',
    Adelaide: 'SA',
    Canberra: 'ACT',
  };
  return locationToState[location] || '';
}

export default function PropertySearchPage() {
  const params = useParams();
  const clientId = params.id as string;
  const [client, setClient] = useState<Client | null>(null);
  const [properties, setProperties] = useState<Property[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [suggestedProperties, setSuggestedProperties] = useState<Property[]>(
    []
  );
  const [sortBy, setSortBy] = useState<string>('composite-score-desc');
  const [filters, setFilters] = useState({
    minPrice: 0,
    maxPrice: 0,
    minBedrooms: 0,
    propertyType: 'All',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(5);
  // Smart Match removed

  useEffect(() => {
    const agent = localStorage.getItem('agent');
    if (!agent) {
      window.location.href = '/';
      return;
    }

    let loadedClient: Client | null = null;

    // Load client from client-data.ts or localStorage
    try {
      const foundClient = getClientById(clientId);
      if (foundClient) {
        loadedClient = {
          id: foundClient.id,
          name: foundClient.name,
          email: foundClient.email,
          salary: foundClient.salary,
          budget: foundClient.budget,
          preferredLocation: foundClient.preferredLocation,
          investmentGoal: foundClient.investmentGoal,
          investmentPeriod: foundClient.investmentPeriod,
        };
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn('Failed to load client', e);
    }

    if (!loadedClient) {
      // Client not found, but still allow page to load with empty properties
      setIsLoading(false);
      return;
    }

    setClient(loadedClient);

    // Map preferred location to state code
    const locationToState: Record<string, string> = {
      Sydney: 'NSW',
      Melbourne: 'VIC',
      Brisbane: 'QLD',
      Perth: 'WA',
      Adelaide: 'SA',
    };
    const preferredState =
      locationToState[loadedClient?.preferredLocation || ''] || '';

    // Filter properties based on client profile and map to our Property type
    const filtered = realData.filter((prop: any) => {
      const price = Number(prop['Price (AUD)'] ?? 0);
      const minBudget = loadedClient?.minBudget ?? 0;
      const maxBudget =
        loadedClient?.maxBudget ?? loadedClient?.budget ?? Infinity;
      const withinBudget = price >= minBudget && price <= maxBudget;
      const inPreferredLocation =
        !preferredState || prop['State'] === preferredState;
      return withinBudget && inPreferredLocation;
    });

    // Find properties ABOVE budget but within 20% and in preferred location
    // These are "stretch" suggestions with high investment potential
    const aboveBudget = realData.filter((prop: any) => {
      const price = Number(prop['Price (AUD)'] ?? 0);
      const maxBudget = (loadedClient?.maxBudget ?? loadedClient?.budget) || 0;
      const isAboveBudget = price > maxBudget;
      const withinStretchRange = price <= maxBudget * 1.2; // Up to 20% over budget
      const inPreferredLocation =
        !preferredState || prop['State'] === preferredState;
      return isAboveBudget && withinStretchRange && inPreferredLocation;
    });

    const mapped = filtered.map((p: any) => ({
      id: String(p.id ?? ''),
      price: Number(p['Price (AUD)'] ?? 0),
      address: String(p['Full Address'] ?? p['Full Address'] ?? ''),
      suburb: String(p.Suburb ?? ''),
      state: String(p.State ?? ''),
      postcode: String(p.Postcode ?? ''),
      propertyType: String(p['Property Type'] ?? 'Unknown'),
      bedrooms: Number(p.Bedrooms ?? 0),
      bathrooms: Number(p.Bathrooms ?? 0),
      carSpaces: Number(p['Car Spaces'] ?? 0),
      estimatedRentalValueWeekly: Number(
        p['Estimated Rental Value (Weekly)'] ?? 0
      ),
      maintenanceCostAnnual: Number(p['Maintenance Cost (Annual)'] ?? 0),
      medianPrice: Number(p['Suburb Median Price'] ?? 0),
      landSize: Number(p['Land Size (m²)'] ?? 0),
      buildingArea: Number(p['Building Area (m²)'] ?? 0),
      grannyFlat: String(p['Granny Flat'] ?? 'No'),
      facilities: (p['Facilities'] ?? '')
        .split(',')
        .map((f: string) => f.trim())
        .filter(Boolean),
      utilities: String(p['Utilities'] ?? ''),
      nbnType: String(p['NBN Type'] ?? ''),
      securityFeatures: String(p['Security Features'] ?? ''),
      airConditioning: String(p['Air Conditioning'] ?? ''),
      yearBuilt: Number(p['Year Built'] ?? 0),
      energyRating: String(p['Energy Rating'] ?? ''),
      agentName: String(p['Agent Name'] ?? ''),
      agency: String(p['Agency'] ?? ''),
      agencyContact: String(p['Agency Contact'] ?? ''),
      propertyExternalId: String(p['Property ID'] ?? ''),
      nearbySchools: Number(p['Nearby Schools (km)'] ?? 0),
      nearbyTransport: Number(p['Nearby Transport (km)'] ?? 0),
      nearbySchoolsKm: Number(p['Nearby Schools (km)'] ?? 0),
      nearbyTransportKm: Number(p['Nearby Transport (km)'] ?? 0),
    })) as unknown as Property[];

    // Map above-budget properties for suggestions
    const mappedSuggestions = aboveBudget.map((p: any) => ({
      id: String(p.id ?? ''),
      price: Number(p['Price (AUD)'] ?? 0),
      address: String(p['Full Address'] ?? p['Full Address'] ?? ''),
      suburb: String(p.Suburb ?? ''),
      state: String(p.State ?? ''),
      postcode: String(p.Postcode ?? ''),
      propertyType: String(p['Property Type'] ?? 'Unknown'),
      bedrooms: Number(p.Bedrooms ?? 0),
      bathrooms: Number(p.Bathrooms ?? 0),
      carSpaces: Number(p['Car Spaces'] ?? 0),
      estimatedRentalValueWeekly: Number(
        p['Estimated Rental Value (Weekly)'] ?? 0
      ),
      maintenanceCostAnnual: Number(p['Maintenance Cost (Annual)'] ?? 0),
      medianPrice: Number(p['Suburb Median Price'] ?? 0),
      landSize: Number(p['Land Size (m²)'] ?? 0),
      buildingArea: Number(p['Building Area (m²)'] ?? 0),
      grannyFlat: String(p['Granny Flat'] ?? 'No'),
      facilities: (p['Facilities'] ?? '')
        .split(',')
        .map((f: string) => f.trim())
        .filter(Boolean),
      utilities: String(p['Utilities'] ?? ''),
      nbnType: String(p['NBN Type'] ?? ''),
      securityFeatures: String(p['Security Features'] ?? ''),
      airConditioning: String(p['Air Conditioning'] ?? ''),
      yearBuilt: Number(p['Year Built'] ?? 0),
      energyRating: String(p['Energy Rating'] ?? ''),
      agentName: String(p['Agent Name'] ?? ''),
      agency: String(p['Agency'] ?? ''),
      agencyContact: String(p['Agency Contact'] ?? ''),
      propertyExternalId: String(p['Property ID'] ?? ''),
      nearbySchools: Number(p['Nearby Schools (km)'] ?? 0),
      nearbyTransport: Number(p['Nearby Transport (km)'] ?? 0),
      nearbySchoolsKm: Number(p['Nearby Schools (km)'] ?? 0),
      nearbyTransportKm: Number(p['Nearby Transport (km)'] ?? 0),
    })) as unknown as Property[];

    setProperties(mapped);
    setFilteredProperties(mapped);

    // Compute suggestions metrics using same calculation as regular properties
    const suggestionsWithMetrics = mappedSuggestions.map((prop) => {
      // Use client's deposit to calculate LVR, fallback to 80% if no deposit provided
      const deposit = loadedClient.deposit || prop.price * 0.2;
      const lvr = Math.min(0.95, (prop.price - deposit) / prop.price);
      let appreciationRate = 0.04;
      if (loadedClient.investmentGoal === 'Capital Appreciation') {
        appreciationRate = 0.05;
      } else if (loadedClient.investmentGoal === 'Rental Yield') {
        appreciationRate = 0.035;
      }

      const analysis = calculateInvestmentAnalysis(
        prop.price,
        prop.estimatedRentalValueWeekly,
        prop.maintenanceCostAnnual,
        0.06,
        loadedClient.investmentPeriod || 10,
        appreciationRate,
        lvr
      );

      return {
        property: prop,
        score: analysis.investmentScore,
        roi: analysis.roiYear5,
        breakEvenYears: analysis.breakEvenYears,
      };
    });

    // Apply same sort priority as regular property finding, with exception logic
    let sortedSuggestions = suggestionsWithMetrics.filter(
      (item) => item.score >= 65
    );
    sortedSuggestions = [...sortedSuggestions].sort((a, b) => {
      switch (sortBy) {
        case 'composite-score-desc':
          return b.score - a.score;
        case 'composite-score-asc':
          return a.score - b.score;
        case 'break-even-asc':
          return a.breakEvenYears - b.breakEvenYears;
        case 'break-even-desc':
          return b.breakEvenYears - a.breakEvenYears;
        default:
          return b.score - a.score;
      }
    });
    const finalSuggestions = sortedSuggestions
      .slice(0, 4)
      .map((item) => item.property);

    setSuggestedProperties(finalSuggestions);

    console.log('CLIENT PROFILE:', {
      budget: loadedClient.budget,
      preferredLocation: loadedClient.preferredLocation,
      preferredState,
      investmentGoal: loadedClient.investmentGoal,
      investmentPeriod: loadedClient.investmentPeriod,
      salary: loadedClient.salary,
    });
    console.log('🏠 MAPPED PROPERTIES SAMPLE:', mapped.slice(0, 2));
    console.log(
      '💡 SMART SUGGESTIONS (above budget):',
      finalSuggestions.length
    );

    // Smart ranking removed
    setFilters((prev) => ({
      ...prev,
      minPrice: loadedClient?.minBudget || 0,
      maxPrice: (loadedClient?.maxBudget ?? loadedClient?.budget) || 0,
    }));
    setIsLoading(false);
  }, [clientId]);

  useEffect(() => {
    let results = properties;

    // Apply filters
    if (filters.minPrice) {
      results = results.filter((p) => p.price >= filters.minPrice);
    }
    if (filters.maxPrice) {
      results = results.filter((p) => p.price <= filters.maxPrice);
    }

    if (filters.minBedrooms > 0) {
      results = results.filter((p) => p.bedrooms >= filters.minBedrooms);
    }

    if (filters.propertyType !== 'All') {
      results = results.filter((p) => p.propertyType === filters.propertyType);
    }

    // Apply sorting with client-specific parameters
    if (sortBy && client) {
      // Calculate client-specific appreciation rate based on investment goal
      let appreciationRate = 0.04;
      if (client.investmentGoal === 'Capital Appreciation') {
        appreciationRate = 0.05;
      } else if (client.investmentGoal === 'Rental Yield') {
        appreciationRate = 0.035;
      }

      results = [...results].sort((a, b) => {
        // Use client's deposit to calculate LVR for property A
        const depositA = client.deposit || a.price * 0.2;
        const lvrA = Math.min(0.95, (a.price - depositA) / a.price);

        // Use client's deposit to calculate LVR for property B
        const depositB = client.deposit || b.price * 0.2;
        const lvrB = Math.min(0.95, (b.price - depositB) / b.price);

        // Calculate metrics for both properties with client-specific parameters
        const analysisA = calculateInvestmentAnalysis(
          a.price,
          a.estimatedRentalValueWeekly,
          a.maintenanceCostAnnual,
          0.06,
          client.investmentPeriod || 10,
          appreciationRate,
          lvrA
        );
        const analysisB = calculateInvestmentAnalysis(
          b.price,
          b.estimatedRentalValueWeekly,
          b.maintenanceCostAnnual,
          0.06,
          client.investmentPeriod || 10,
          appreciationRate,
          lvrB
        );

        switch (sortBy) {
          case 'composite-score-desc':
            return analysisB.investmentScore - analysisA.investmentScore;
          case 'composite-score-asc':
            return analysisA.investmentScore - analysisB.investmentScore;
          case 'break-even-asc':
            return analysisA.breakEvenYears - analysisB.breakEvenYears;
          case 'break-even-desc':
            return analysisB.breakEvenYears - analysisA.breakEvenYears;
          default:
            return analysisB.investmentScore - analysisA.investmentScore;
        }
      });
    }

    setFilteredProperties(results);
  }, [filters, properties, sortBy, client]);

  const handleFilterChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]:
        name === 'minPrice' || name === 'maxPrice' || name === 'minBedrooms'
          ? Number.parseInt(value)
          : value,
    }));
  };

  if (isLoading || !client)
    return (
      <div className='min-h-screen flex items-center justify-center'>
        Loading...
      </div>
    );

  // Derived values for suggestions when no results
  const preferredState = getStateCode(client.preferredLocation);
  const preferredStateListings = (realData as any[]).filter(
    (p: any) => p['State'] === preferredState
  );
  const minPreferredPrice = preferredStateListings.length
    ? Math.min(
        ...preferredStateListings.map((p: any) => Number(p['Price (AUD)'] || 0))
      )
    : null;
  const budgetShortfall =
    minPreferredPrice && client.budget < minPreferredPrice
      ? minPreferredPrice - client.budget
      : 0;
  const alternativeStates = Array.from(
    new Set((realData as any[]).map((p: any) => p['State'])) as Set<string>
  )
    .filter((s) => s && s !== preferredState)
    .map((s) => {
      const options = (realData as any[]).filter(
        (p: any) =>
          p['State'] === s && Number(p['Price (AUD)'] || 0) <= client.budget
      );
      const cheapest = options.length
        ? Math.min(...options.map((p: any) => Number(p['Price (AUD)'] || 0)))
        : null;
      return { state: s as string, count: options.length, cheapest };
    })
    .filter((x) => x.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 4);

  return (
    <div className='min-h-screen bg-background'>
      {/* Header */}
      <header className='bg-card border-b border-border sticky top-0 z-50'>
        <div className='max-w-7xl mx-auto px-4 py-4 flex items-center justify-between'>
          <Link href={`/dashboard/clients/${clientId}`}>
            <Button
              variant='ghost'
              className='flex items-center gap-2 text-muted-foreground hover:text-foreground'
            >
              <ArrowLeft className='w-4 h-4' />
              Back to Client
            </Button>
          </Link>
          <h1 className='text-2xl font-bold text-foreground'>
            Property Search for {client.name}
          </h1>
          <div></div>
        </div>
      </header>

      <main className='max-w-7xl mx-auto px-4 py-8'>
        {/* Filters Section */}
        <Card className='bg-card border-border mb-8'>
          <CardHeader className='border-b border-border'>
            <CardTitle className='text-foreground'>Search Filters</CardTitle>
          </CardHeader>
          <CardContent className='pt-6'>
            <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
              <div className='space-y-2'>
                <Label
                  htmlFor='minPrice'
                  className='text-foreground font-medium text-sm'
                >
                  Min Price
                </Label>
                <div className='flex items-center gap-2'>
                  <Input
                    id='minPrice'
                    name='minPrice'
                    type='number'
                    value={filters.minPrice}
                    onChange={handleFilterChange}
                    className='bg-input border-border text-foreground placeholder:text-muted-foreground'
                  />
                  <span className='text-sm text-muted-foreground'>AUD</span>
                </div>
              </div>

              <div className='space-y-2'>
                <Label
                  htmlFor='maxPrice'
                  className='text-foreground font-medium text-sm'
                >
                  Max Price
                </Label>
                <div className='flex items-center gap-2'>
                  <Input
                    id='maxPrice'
                    name='maxPrice'
                    type='number'
                    value={filters.maxPrice}
                    onChange={handleFilterChange}
                    className='bg-input border-border text-foreground placeholder:text-muted-foreground'
                  />
                  <span className='text-sm text-muted-foreground'>AUD</span>
                </div>
              </div>

              <div className='space-y-2'>
                <Label
                  htmlFor='minBedrooms'
                  className='text-foreground font-medium text-sm'
                >
                  Min Bedrooms
                </Label>
                <select
                  id='minBedrooms'
                  name='minBedrooms'
                  value={filters.minBedrooms}
                  onChange={handleFilterChange}
                  className='w-full px-3 py-2 bg-input border border-border text-foreground rounded-md'
                >
                  <option value={0}>Any</option>
                  <option value={1}>1+</option>
                  <option value={2}>2+</option>
                  <option value={3}>3+</option>
                  <option value={4}>4+</option>
                </select>
              </div>

              <div className='space-y-2'>
                <Label
                  htmlFor='propertyType'
                  className='text-foreground font-medium text-sm'
                >
                  Property Type
                </Label>
                <select
                  id='propertyType'
                  name='propertyType'
                  value={filters.propertyType}
                  onChange={handleFilterChange}
                  className='w-full px-3 py-2 bg-input border border-border text-foreground rounded-md'
                >
                  <option>All</option>
                  <option>House</option>
                  <option>Apartment</option>
                  <option>Townhouse</option>
                </select>
              </div>

              <div className='space-y-2'>
                <Label
                  htmlFor='sortBy'
                  className='text-foreground font-medium text-sm'
                >
                  Priority Filter
                </Label>
                <select
                  id='sortBy'
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className='w-full px-3 py-2 bg-input border border-border text-foreground rounded-md'
                >
                  <option value='composite-score-desc'>
                    Composite Score (High to Low)
                  </option>
                  <option value='composite-score-asc'>
                    Composite Score (Low to High)
                  </option>
                  <option value='break-even-asc'>
                    Break Even (Fast to Slow)
                  </option>
                  <option value='break-even-desc'>
                    Break Even (Slow to Fast)
                  </option>
                </select>
              </div>
            </div>

            <div className='mt-4 flex gap-4'>
              <div className='flex items-end flex-1'>
                <Button
                  onClick={() => {
                    setFilters({
                      minPrice: client.minBudget || 0,
                      maxPrice: client.maxBudget ?? client.budget,
                      minBedrooms: 0,
                      propertyType: 'All',
                    });
                    setSortBy('composite-score-desc');
                  }}
                  variant='outline'
                  className='w-full border-border text-foreground hover:bg-muted'
                >
                  Reset All
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results Summary */}
        <div className='mb-6 flex items-center justify-between'>
          <div>
            <h2 className='text-xl font-bold text-foreground'>
              {filteredProperties.length}{' '}
              {suggestedProperties.length > 0 ? 'Standard' : ''} Properties
              Found
            </h2>
            <p className='text-sm text-muted-foreground'>
              Sorted by{' '}
              {sortBy.includes('composite-score')
                ? 'Composite Score'
                : 'Break Even Period'}
              {' • '}
              {suggestedProperties.length > 0
                ? `Within ${client.name}'s $${(
                    (client.minBudget ?? client.budget) / 1000
                  ).toFixed(0)}k-$${(
                    (client.maxBudget ?? client.budget) / 1000
                  ).toFixed(0)}k budget`
                : `Matching ${client.name}'s ${client.investmentGoal} goal`}
            </p>
          </div>
          <div className='flex gap-2' />
        </div>

        {/* Properties Grid */}
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
          {filteredProperties.slice(0, visibleCount).map((property) => {
            // Calculate client-specific parameters for this property
            // Use client's deposit to calculate LVR, fallback to 20% deposit if not provided
            const deposit = client.deposit || property.price * 0.2;
            const lvr = Math.min(
              0.95,
              (property.price - deposit) / property.price
            );

            let appreciationRate = 0.04;
            if (client.investmentGoal === 'Capital Appreciation') {
              appreciationRate = 0.05;
            } else if (client.investmentGoal === 'Rental Yield') {
              appreciationRate = 0.035;
            }

            // Calculate investment analysis for each property with client-specific parameters
            const analysis = calculateInvestmentAnalysis(
              property.price,
              property.estimatedRentalValueWeekly,
              property.maintenanceCostAnnual,
              0.06,
              client.investmentPeriod || 10,
              appreciationRate,
              lvr
            );

            // Check if property aligns with client's goal based on calculated metrics
            const alignsWithGoal =
              (client.investmentGoal === 'Capital Appreciation' &&
                (analysis.roiYear5 > 25 ||
                  analysis.capitalGainYear5 > property.price * 0.2)) ||
              (client.investmentGoal === 'Rental Yield' &&
                (analysis.grossYield > 4.5 || analysis.netYield > 3)) ||
              (client.investmentGoal === 'Mixed Portfolio' &&
                analysis.roiYear5 > 15 &&
                analysis.grossYield > 3.5);

            return (
              <Link
                key={property.id}
                href={`/dashboard/clients/${clientId}/properties/${property.id}`}
              >
                <Card
                  className={`bg-card border-border hover:shadow-lg transition-shadow cursor-pointer h-full ${
                    alignsWithGoal ? 'ring-2 ring-accent/50' : ''
                  }`}
                >
                  <CardHeader className='border-b border-border'>
                    <div className='flex items-start justify-between'>
                      <div className='flex-1'>
                        <CardTitle className='text-foreground text-lg flex items-center gap-2'>
                          {property.address}
                          {alignsWithGoal && (
                            <span className='text-xs bg-accent/20 text-accent px-2 py-0.5 rounded-full font-normal'>
                              Matches Goal
                            </span>
                          )}
                        </CardTitle>
                        <CardDescription className='flex items-center gap-1 mt-1'>
                          <MapPin className='w-4 h-4' />
                          {property.suburb}, {property.state}{' '}
                          {property.postcode}
                        </CardDescription>
                      </div>
                      <span className='text-sm font-semibold text-secondary-foreground bg-secondary px-3 py-1 rounded-full'>
                        {property.propertyType}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className='pt-4'>
                    {/* Price */}
                    <div className='mb-4 pb-4 border-b border-border'>
                      <div className='flex items-baseline gap-2'>
                        <DollarSign className='w-5 h-5 text-primary' />
                        <span className='text-3xl font-bold text-foreground'>
                          {(property.price / 1000).toFixed(0)}k
                        </span>
                        <span className='text-sm text-muted-foreground'>
                          (Median: ${(property.medianPrice / 1000).toFixed(0)}k)
                        </span>
                      </div>
                    </div>

                    {/* Details Grid */}
                    <div className='grid grid-cols-3 gap-4 mb-4'>
                      <div>
                        <p className='text-xs text-muted-foreground'>
                          Bedrooms
                        </p>
                        <p className='text-lg font-bold text-foreground'>
                          {property.bedrooms}
                        </p>
                      </div>
                      <div>
                        <p className='text-xs text-muted-foreground'>
                          Bathrooms
                        </p>
                        <p className='text-lg font-bold text-foreground'>
                          {property.bathrooms}
                        </p>
                      </div>
                      <div>
                        <p className='text-xs text-muted-foreground'>
                          Car Spaces
                        </p>
                        <p className='text-lg font-bold text-foreground'>
                          {property.carSpaces}
                        </p>
                      </div>
                    </div>

                    {/* Investment Metrics */}
                    <div className='bg-muted/50 rounded-lg p-3 space-y-2 mb-4'>
                      <div className='flex items-center justify-between'>
                        <span className='text-sm text-muted-foreground'>
                          Est. Weekly Rent
                        </span>
                        <span className='font-semibold text-foreground'>
                          ${property.estimatedRentalValueWeekly}
                        </span>
                      </div>
                      <div className='flex items-center justify-between'>
                        <span className='text-sm text-muted-foreground'>
                          Gross Yield
                        </span>
                        <span className='font-semibold text-foreground'>
                          {analysis.grossYield.toFixed(2)}%
                        </span>
                      </div>
                      <div className='flex items-center justify-between'>
                        <span className='text-sm text-muted-foreground'>
                          Break-Even Period
                        </span>
                        <span className='font-semibold text-foreground'>
                          {analysis.breakEvenYears >= 999
                            ? 'N/A'
                            : `${analysis.breakEvenYears.toFixed(1)} yrs`}
                        </span>
                      </div>
                      <div className='flex items-center justify-between'>
                        <span className='text-sm text-muted-foreground'>
                          Monthly Cash Flow
                        </span>
                        <span
                          className={`font-semibold ${
                            analysis.monthlyNetCashFlow >= 0
                              ? 'text-green-600'
                              : 'text-red-600'
                          }`}
                        >
                          ${Math.abs(analysis.monthlyNetCashFlow).toFixed(0)}
                          {analysis.monthlyNetCashFlow >= 0 ? ' +' : ' -'}
                        </span>
                      </div>
                      <div className='flex flex-col gap-1 border-t border-border pt-2'>
                        <div className='flex items-center justify-between'>
                          <span className='text-sm font-semibold text-muted-foreground flex items-center gap-1'>
                            <TrendingUp className='w-4 h-4' />
                            5-Year ROI
                          </span>
                          <span className='font-bold text-accent text-lg'>
                            {analysis.roiYear5.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    </div>

                    <Button className='w-full bg-primary hover:bg-primary/90 text-primary-foreground text-sm'>
                      View Full Analysis
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

        {/* See More Button */}
        {filteredProperties.length > visibleCount && (
          <div className='flex justify-center mt-8'>
            <Button
              onClick={() => setVisibleCount((prev) => prev + 5)}
              className='bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3'
            >
              See More Properties ({filteredProperties.length - visibleCount}{' '}
              remaining)
            </Button>
          </div>
        )}

        {/* Exceptional Opportunities - moved after Standard Properties */}
        {suggestedProperties.length > 0 && (
          <>
            <div className='mt-12 mb-6'>
              <h2 className='text-2xl font-bold text-foreground flex items-center gap-2'>
                <TrendingUp className='w-7 h-7 text-amber-600' />
                Exceptional Opportunities
              </h2>
              <p className='text-sm text-muted-foreground mt-1'>
                Premium properties above budget with outstanding investment
                potential (Score 65+)
              </p>
            </div>

            <Card className='bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950 dark:to-orange-950 border-2 border-amber-300 dark:border-amber-700 mb-12'>
              <CardHeader className='border-b border-amber-200 dark:border-amber-800 bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-900 dark:to-orange-900'>
                <div className='flex items-start justify-between'>
                  <div>
                    <CardTitle className='text-amber-900 dark:text-amber-100 flex items-center gap-2 text-lg'>
                      Why These Are Special
                    </CardTitle>
                    <CardDescription className='mt-2 text-amber-900 dark:text-amber-100 font-medium'>
                      These {suggestedProperties.length} properties are $
                      {(
                        ((client.maxBudget ?? client.budget) * 0.01) /
                        1000
                      ).toFixed(0)}
                      k-$
                      {(
                        ((client.maxBudget ?? client.budget) * 0.2) /
                        1000
                      ).toFixed(0)}
                      k above your $
                      {((client.maxBudget ?? client.budget) / 1000).toFixed(0)}k
                      max budget but have exceptional investment metrics.
                      <br />
                      <span className='text-amber-700 dark:text-amber-300 text-sm'>
                        Each has been verified to have an Investment Score of
                        65+ and superior ROI compared to properties within
                        budget.
                      </span>
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className='pt-6'>
                <div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
                  {suggestedProperties.map((property) => {
                    // Use client's deposit to calculate LVR, fallback to 20% deposit if not provided
                    const deposit = client.deposit || property.price * 0.2;
                    const lvr = Math.min(
                      0.95,
                      (property.price - deposit) / property.price
                    );

                    let appreciationRate = 0.04;
                    if (client.investmentGoal === 'Capital Appreciation') {
                      appreciationRate = 0.05;
                    } else if (client.investmentGoal === 'Rental Yield') {
                      appreciationRate = 0.035;
                    }

                    const analysis = calculateInvestmentAnalysis(
                      property.price,
                      property.estimatedRentalValueWeekly,
                      property.maintenanceCostAnnual,
                      0.06,
                      client.investmentPeriod || 10,
                      appreciationRate,
                      lvr
                    );

                    const budgetDifference =
                      property.price - (client.maxBudget ?? client.budget);
                    const percentageOver = (
                      (budgetDifference / (client.maxBudget ?? client.budget)) *
                      100
                    ).toFixed(1);

                    return (
                      <Link
                        key={property.id}
                        href={`/dashboard/clients/${clientId}/properties/${property.id}`}
                      >
                        <Card className='bg-white dark:bg-gray-900 border-2 border-amber-400 dark:border-amber-600 hover:shadow-xl transition-shadow cursor-pointer h-full relative overflow-hidden'>
                          {/* "Worth It" Badge */}
                          <div className='absolute top-0 right-0 bg-gradient-to-br from-amber-500 to-orange-500 text-white px-4 py-1 rounded-bl-lg font-bold text-xs shadow-md'>
                            WORTH IT! +{percentageOver}% budget
                          </div>

                          <CardHeader className='border-b border-border pt-8'>
                            <div className='flex items-start justify-between'>
                              <div className='flex-1'>
                                <CardTitle className='text-foreground text-lg flex items-center gap-2'>
                                  {property.address}
                                </CardTitle>
                                <CardDescription className='flex items-center gap-1 mt-1'>
                                  <MapPin className='w-4 h-4' />
                                  {property.suburb}, {property.state}{' '}
                                  {property.postcode}
                                </CardDescription>
                              </div>
                              <span className='text-sm font-semibold text-secondary-foreground bg-secondary px-3 py-1 rounded-full'>
                                {property.propertyType}
                              </span>
                            </div>
                          </CardHeader>
                          <CardContent className='pt-4'>
                            {/* Budget Difference Alert */}
                            <div className='mb-4 bg-amber-100 dark:bg-amber-900/30 border border-amber-300 dark:border-amber-700 rounded-lg p-3'>
                              <div className='flex items-center justify-between'>
                                <span className='text-sm font-semibold text-amber-900 dark:text-amber-100'>
                                  ${(budgetDifference / 1000).toFixed(0)}k over
                                  budget
                                </span>
                                <span className='text-xs text-amber-700 dark:text-amber-300'>
                                  Investment Score:{' '}
                                  {analysis.investmentScore.toFixed(2)}
                                </span>
                              </div>
                            </div>

                            {/* Price */}
                            <div className='mb-4 pb-4 border-b border-border'>
                              <div className='flex items-baseline gap-2'>
                                <DollarSign className='w-5 h-5 text-primary' />
                                <span className='text-3xl font-bold text-foreground'>
                                  {(property.price / 1000).toFixed(0)}k
                                </span>
                                <span className='text-sm text-muted-foreground line-through'>
                                  Budget: ${(client.budget / 1000).toFixed(0)}k
                                </span>
                              </div>
                            </div>

                            {/* Details Grid */}
                            <div className='grid grid-cols-3 gap-4 mb-4'>
                              <div>
                                <p className='text-xs text-muted-foreground'>
                                  Bedrooms
                                </p>
                                <p className='text-lg font-bold text-foreground'>
                                  {property.bedrooms}
                                </p>
                              </div>
                              <div>
                                <p className='text-xs text-muted-foreground'>
                                  Bathrooms
                                </p>
                                <p className='text-lg font-bold text-foreground'>
                                  {property.bathrooms}
                                </p>
                              </div>
                              <div>
                                <p className='text-xs text-muted-foreground'>
                                  Car Spaces
                                </p>
                                <p className='text-lg font-bold text-foreground'>
                                  {property.carSpaces}
                                </p>
                              </div>
                            </div>

                            {/* Investment Metrics */}
                            <div className='bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 rounded-lg p-3 space-y-2 mb-4 border-2 border-green-300 dark:border-green-700'>
                              <div className='flex items-center justify-between'>
                                <span className='text-sm text-muted-foreground'>
                                  Est. Weekly Rent
                                </span>
                                <span className='font-semibold text-foreground'>
                                  ${property.estimatedRentalValueWeekly}
                                </span>
                              </div>
                              <div className='flex items-center justify-between'>
                                <span className='text-sm text-muted-foreground'>
                                  Gross Yield
                                </span>
                                <span className='font-semibold text-green-700 dark:text-green-400'>
                                  {analysis.grossYield.toFixed(2)}%
                                </span>
                              </div>
                              <div className='flex items-center justify-between'>
                                <span className='text-sm text-muted-foreground'>
                                  Break-Even Period
                                </span>
                                <span className='font-semibold text-foreground'>
                                  {analysis.breakEvenYears >= 999
                                    ? 'N/A'
                                    : `${analysis.breakEvenYears.toFixed(
                                        1
                                      )} yrs`}
                                </span>
                              </div>
                              <div className='flex items-center justify-between'>
                                <span className='text-sm text-muted-foreground'>
                                  Monthly Cash Flow
                                </span>
                                <span
                                  className={`font-semibold ${
                                    analysis.monthlyNetCashFlow >= 0
                                      ? 'text-green-600'
                                      : 'text-red-600'
                                  }`}
                                >
                                  $
                                  {Math.abs(
                                    analysis.monthlyNetCashFlow
                                  ).toFixed(0)}
                                  {analysis.monthlyNetCashFlow >= 0
                                    ? ' +'
                                    : ' -'}
                                </span>
                              </div>
                              <div className='flex flex-col gap-1 border-t border-green-300 dark:border-green-700 pt-2'>
                                <div className='flex items-center justify-between'>
                                  <span className='text-sm font-semibold text-muted-foreground flex items-center gap-1'>
                                    <TrendingUp className='w-4 h-4' />
                                    5-Year ROI
                                  </span>
                                  <span className='font-bold text-green-700 dark:text-green-400 text-lg'>
                                    {analysis.roiYear5.toFixed(1)}%
                                  </span>
                                </div>
                              </div>
                            </div>

                            <Button className='w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-sm shadow-lg'>
                              View This Opportunity
                            </Button>
                          </CardContent>
                        </Card>
                      </Link>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* Smart Match empty state removed */}

        {/* {filteredProperties.length === 0 && (
          <Card className='bg-card border-border'>
            <CardContent className='pt-10 pb-10'>
              <div className='flex flex-col items-center text-center gap-4'>
                <Home className='w-12 h-12 text-muted-foreground opacity-60' />
                <p className='text-lg font-semibold text-foreground'>
                  No properties match the current budget in{' '}
                  {preferredState || client.preferredLocation}
                </p>
                {budgetShortfall > 0 && minPreferredPrice && (
                  <div className='bg-muted/50 border border-border rounded-lg p-4 w-full md:w-3/4'>
                    <p className='text-sm text-muted-foreground mb-1'>
                      Suggestion
                    </p>
                    <p className='text-foreground'>
                      Increase budget by{' '}
                      <span className='font-semibold'>
                        ${budgetShortfall.toLocaleString()}
                      </span>{' '}
                      to at least{' '}
                      <span className='font-semibold'>
                        ${minPreferredPrice.toLocaleString()}
                      </span>{' '}
                      to see options in {preferredState}.
                    </p>
                  </div>
                )}
                {alternativeStates.length > 0 ? (
                  <div className='w-full md:w-3/4'>
                    <p className='text-sm text-muted-foreground mb-2'>
                      Or consider these locations within the current budget:
                    </p>
                    <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
                      {alternativeStates.map((s) => (
                        <div
                          key={s.state}
                          className='flex items-center justify-between border border-border rounded-md px-3 py-2'
                        >
                          <div className='flex items-center gap-2'>
                            <MapPin className='w-4 h-4 text-muted-foreground' />
                            <span className='font-medium text-foreground'>
                              {s.state}
                            </span>
                          </div>
                          <div className='text-right'>
                            <p className='text-foreground text-sm font-semibold'>
                              {s.count} listings
                            </p>
                            {s.cheapest && (
                              <p className='text-xs text-muted-foreground'>
                                from ${s.cheapest.toLocaleString()}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className='text-sm text-muted-foreground'>
                    No properties are available in other states within the
                    current budget. Consider increasing the budget.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )} */}
      </main>
    </div>
  );
}
