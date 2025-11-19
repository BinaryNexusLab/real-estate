'use client';

import { useState, useEffect } from 'react';
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
import {
  MapPin,
  DollarSign,
  TrendingUp,
  Home,
  Filter,
  SortAsc,
} from 'lucide-react';
import Link from 'next/link';
import { type Property } from '@/lib/property-types';
import { calculateInvestmentAnalysis } from '@/lib/investment-calculator';
import { realData } from '@/app/data/real_data';

export default function PropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState<string>('price-asc');
  const [filters, setFilters] = useState({
    state: 'All',
    propertyType: 'All',
    minPrice: 0,
    maxPrice: 0,
    minBedrooms: 0,
    searchQuery: '',
  });

  useEffect(() => {
    const agent = localStorage.getItem('agent');
    if (!agent) {
      window.location.href = '/';
      return;
    }

    // Map real data to Property type
    const mapped = realData.map((p: any) => ({
      id: String(p.id ?? ''),
      price: Number(p['Price (AUD)'] ?? 0),
      address: String(p['Full Address'] ?? ''),
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
    setIsLoading(false);
  }, []);

  useEffect(() => {
    let results = properties;

    // Apply filters
    if (filters.state !== 'All') {
      results = results.filter((p) => p.state === filters.state);
    }

    if (filters.propertyType !== 'All') {
      results = results.filter((p) => p.propertyType === filters.propertyType);
    }

    if (filters.minPrice > 0) {
      results = results.filter((p) => p.price >= filters.minPrice);
    }

    if (filters.maxPrice > 0) {
      results = results.filter((p) => p.price <= filters.maxPrice);
    }

    if (filters.minBedrooms > 0) {
      results = results.filter((p) => p.bedrooms >= filters.minBedrooms);
    }

    if (filters.searchQuery.trim()) {
      const query = filters.searchQuery.toLowerCase();
      results = results.filter(
        (p) =>
          p.address.toLowerCase().includes(query) ||
          p.suburb.toLowerCase().includes(query) ||
          p.state.toLowerCase().includes(query) ||
          p.postcode.toString().includes(query)
      );
    }

    // Apply sorting
    results = [...results].sort((a, b) => {
      const analysisA = calculateInvestmentAnalysis(
        a.price,
        a.estimatedRentalValueWeekly,
        a.maintenanceCostAnnual,
        0.065,
        25,
        0.04,
        0.8
      );
      const analysisB = calculateInvestmentAnalysis(
        b.price,
        b.estimatedRentalValueWeekly,
        b.maintenanceCostAnnual,
        0.065,
        25,
        0.04,
        0.8
      );

      switch (sortBy) {
        case 'price-asc':
          return a.price - b.price;
        case 'price-desc':
          return b.price - a.price;
        case 'yield-desc':
          return analysisB.grossYield - analysisA.grossYield;
        case 'yield-asc':
          return analysisA.grossYield - analysisB.grossYield;
        case 'roi-desc':
          return analysisB.roiYear5 - analysisA.roiYear5;
        case 'roi-asc':
          return analysisA.roiYear5 - analysisB.roiYear5;
        case 'score-desc':
          return analysisB.investmentScore - analysisA.investmentScore;
        case 'suburb':
          return a.suburb.localeCompare(b.suburb);
        default:
          return 0;
      }
    });

    setFilteredProperties(results);
  }, [filters, properties, sortBy]);

  const handleFilterChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]:
        name === 'minPrice' || name === 'maxPrice' || name === 'minBedrooms'
          ? Number.parseInt(value) || 0
          : value,
    }));
  };

  const resetFilters = () => {
    setFilters({
      state: 'All',
      propertyType: 'All',
      minPrice: 0,
      maxPrice: 0,
      minBedrooms: 0,
      searchQuery: '',
    });
    setSortBy('price-asc');
  };

  // Get unique states and property types for filters
  const states = [
    'All',
    ...Array.from(new Set(properties.map((p) => p.state))),
  ];
  const propertyTypes = [
    'All',
    ...Array.from(new Set(properties.map((p) => p.propertyType))),
  ];

  if (isLoading) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        Loading...
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-background'>
      {/* Header */}
      <header className='bg-card border-b border-border sticky top-0 z-50'>
        <div className='max-w-7xl mx-auto px-4 py-4'>
          <div className='flex items-center justify-between'>
            <div>
              <h1 className='text-2xl font-bold text-foreground'>
                All Properties
              </h1>
              <p className='text-sm text-muted-foreground mt-1'>
                Browse and analyze all available properties
              </p>
            </div>
            <Link href='/dashboard'>
              <Button variant='outline'>Back to Dashboard</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className='max-w-7xl mx-auto px-4 py-8'>
        {/* Filters Section */}
        <Card className='bg-card border-border mb-8'>
          <CardHeader className='border-b border-border'>
            <CardTitle className='text-foreground flex items-center gap-2'>
              <Filter className='w-5 h-5' />
              Search & Filter
            </CardTitle>
          </CardHeader>
          <CardContent className='pt-6'>
            {/* Search Bar */}
            <div className='mb-6'>
              <Label
                htmlFor='searchQuery'
                className='text-foreground font-medium text-sm mb-2'
              >
                Search
              </Label>
              <Input
                id='searchQuery'
                name='searchQuery'
                type='text'
                placeholder='Search by address, suburb, state, or postcode...'
                value={filters.searchQuery}
                onChange={handleFilterChange}
                className='bg-input border-border text-foreground placeholder:text-muted-foreground'
              />
            </div>

            <div className='grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-4'>
              {/* State Filter */}
              <div className='space-y-2'>
                <Label
                  htmlFor='state'
                  className='text-foreground font-medium text-sm'
                >
                  State
                </Label>
                <select
                  id='state'
                  name='state'
                  value={filters.state}
                  onChange={handleFilterChange}
                  className='w-full px-3 py-2 bg-input border border-border text-foreground rounded-md'
                >
                  {states.map((state) => (
                    <option key={state} value={state}>
                      {state}
                    </option>
                  ))}
                </select>
              </div>

              {/* Property Type Filter */}
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
                  {propertyTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              {/* Min Price */}
              <div className='space-y-2'>
                <Label
                  htmlFor='minPrice'
                  className='text-foreground font-medium text-sm'
                >
                  Min Price
                </Label>
                <Input
                  id='minPrice'
                  name='minPrice'
                  type='number'
                  placeholder='0'
                  value={filters.minPrice || ''}
                  onChange={handleFilterChange}
                  className='bg-input border-border text-foreground placeholder:text-muted-foreground'
                />
              </div>

              {/* Max Price */}
              <div className='space-y-2'>
                <Label
                  htmlFor='maxPrice'
                  className='text-foreground font-medium text-sm'
                >
                  Max Price
                </Label>
                <Input
                  id='maxPrice'
                  name='maxPrice'
                  type='number'
                  placeholder='0'
                  value={filters.maxPrice || ''}
                  onChange={handleFilterChange}
                  className='bg-input border-border text-foreground placeholder:text-muted-foreground'
                />
              </div>

              {/* Min Bedrooms */}
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
                  <option value={5}>5+</option>
                </select>
              </div>
            </div>

            {/* Sort and Reset */}
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label
                  htmlFor='sortBy'
                  className='text-foreground font-medium text-sm flex items-center gap-2'
                >
                  <SortAsc className='w-4 h-4' />
                  Sort By
                </Label>
                <select
                  id='sortBy'
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className='w-full px-3 py-2 bg-input border border-border text-foreground rounded-md'
                >
                  <option value='price-asc'>Price (Low to High)</option>
                  <option value='price-desc'>Price (High to Low)</option>
                  <option value='yield-desc'>Yield (High to Low)</option>
                  <option value='yield-asc'>Yield (Low to High)</option>
                  <option value='roi-desc'>ROI (High to Low)</option>
                  <option value='roi-asc'>ROI (Low to High)</option>
                  <option value='score-desc'>
                    Investment Score (High to Low)
                  </option>
                  <option value='suburb'>Suburb (A-Z)</option>
                </select>
              </div>

              <div className='flex items-end'>
                <Button
                  onClick={resetFilters}
                  variant='outline'
                  className='w-full border-border text-foreground hover:bg-muted'
                >
                  Reset All Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results Summary */}
        <div className='mb-6'>
          <h2 className='text-xl font-bold text-foreground'>
            {filteredProperties.length} Properties Found
          </h2>
          <p className='text-sm text-muted-foreground'>
            Showing {filteredProperties.length} of {properties.length} total
            properties
          </p>
        </div>

        {/* Properties Grid */}
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
          {filteredProperties.map((property) => {
            const analysis = calculateInvestmentAnalysis(
              property.price,
              property.estimatedRentalValueWeekly,
              property.maintenanceCostAnnual,
              0.065,
              25,
              0.04,
              0.8
            );

            return (
              <Card
                key={property.id}
                className='bg-card border-border hover:shadow-lg transition-shadow cursor-pointer h-full'
              >
                <CardHeader className='border-b border-border'>
                  <div className='flex items-start justify-between'>
                    <div className='flex-1'>
                      <CardTitle className='text-foreground text-lg'>
                        {property.address}
                      </CardTitle>
                      <CardDescription className='flex items-center gap-1 mt-1'>
                        <MapPin className='w-4 h-4' />
                        {property.suburb}, {property.state} {property.postcode}
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
                      <p className='text-xs text-muted-foreground'>Bedrooms</p>
                      <p className='text-lg font-bold text-foreground'>
                        {property.bedrooms}
                      </p>
                    </div>
                    <div>
                      <p className='text-xs text-muted-foreground'>Bathrooms</p>
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
                        Weekly Rent
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
                        5-Year ROI
                      </span>
                      <span className='font-semibold text-accent'>
                        {analysis.roiYear5.toFixed(1)}%
                      </span>
                    </div>
                    <div className='flex items-center justify-between border-t border-border pt-2'>
                      <span className='text-sm font-semibold text-muted-foreground'>
                        Investment Score
                      </span>
                      <span className='font-bold text-primary text-lg'>
                        {analysis.investmentScore}
                      </span>
                    </div>
                  </div>

                  {/* Agent Info */}
                  <div className='text-xs text-muted-foreground mb-4'>
                    <p>
                      Agent: {property.agentName} - {property.agency}
                    </p>
                  </div>

                  <Link href={`/dashboard/clients/1/properties/${property.id}`}>
                    <Button className='w-full bg-primary hover:bg-primary/90 text-primary-foreground text-sm'>
                      <TrendingUp className='w-4 h-4 mr-2' />
                      View Analysis
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredProperties.length === 0 && (
          <Card className='bg-card border-border'>
            <CardContent className='pt-10 pb-10'>
              <div className='flex flex-col items-center text-center gap-4'>
                <Home className='w-12 h-12 text-muted-foreground opacity-60' />
                <div>
                  <p className='text-lg font-semibold text-foreground'>
                    No properties found
                  </p>
                  <p className='text-sm text-muted-foreground mt-1'>
                    Try adjusting your filters or search criteria
                  </p>
                </div>
                <Button onClick={resetFilters} variant='outline'>
                  Clear Filters
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
