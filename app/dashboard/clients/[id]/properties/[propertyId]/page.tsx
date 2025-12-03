'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ArrowLeft,
  Download,
  Share2,
  MapPin,
  Home,
  TrendingUp,
  DollarSign,
  Clock,
  AlertCircle,
} from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { type Property } from '@/lib/property-types';
import {
  calculateInvestmentAnalysis,
  calculateRemainingLoan,
  type PropertyAnalysis,
} from '@/lib/investment-calculator';
import {
  formatCurrency,
  formatPercent,
  getInvestmentRating,
  getYieldRating,
} from '@/lib/analysis-utils';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { realData } from '@/app/data/real_data';
import {
  getClientById,
  type Client as ClientType,
} from '@/app/data/client-data';

interface Client {
  id: string;
  name: string;
  email?: string;
  salary: number;
  budget?: number;
  deposit?: number;
  investmentPeriod?: number;
  investmentGoal?: string;
}

export default function PropertyDetailPage() {
  const params = useParams();
  const clientId = params.id as string;
  const propertyId = params.propertyId as string;
  const [client, setClient] = useState<Client | null>(null);
  const [property, setProperty] = useState<Property | null>(null);
  const [analysis, setAnalysis] = useState<PropertyAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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
          deposit: foundClient.deposit,
          investmentPeriod: foundClient.investmentPeriod,
          investmentGoal: foundClient.investmentGoal,
        };
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn('Failed to load client', e);
    }

    if (loadedClient) {
      setClient(loadedClient);
    }

    const foundProperty = realData.find((p) => p.id === Number(propertyId));
    if (foundProperty && loadedClient) {
      // Map the external realData shape to our internal Property shape
      const mappedProperty = {
        id: String((foundProperty as any).id),
        price:
          (foundProperty as any).price ??
          (foundProperty as any)['Price (AUD)'] ??
          (foundProperty as any)['Price'] ??
          0,
        address:
          (foundProperty as any).address ??
          (foundProperty as any)['Full Address'] ??
          (foundProperty as any)['Address'] ??
          '',
        suburb:
          (foundProperty as any).suburb ?? (foundProperty as any).Suburb ?? '',
        state:
          (foundProperty as any).state ?? (foundProperty as any).State ?? '',
        postcode:
          (foundProperty as any).postcode ??
          (foundProperty as any).Postcode ??
          (foundProperty as any)['Postcode'] ??
          '',
        propertyType:
          (foundProperty as any).propertyType ??
          (foundProperty as any)['Property Type'] ??
          '',
        yearBuilt:
          (foundProperty as any).yearBuilt ??
          (foundProperty as any)['Year Built'] ??
          null,
        bedrooms:
          (foundProperty as any).bedrooms ??
          (foundProperty as any).Bedrooms ??
          0,
        bathrooms:
          (foundProperty as any).bathrooms ??
          (foundProperty as any).Bathrooms ??
          0,
        carSpaces:
          (foundProperty as any).carSpaces ??
          (foundProperty as any)['Car Spaces'] ??
          0,
        energyRating:
          (foundProperty as any).energyRating ??
          (foundProperty as any)['Energy Rating'] ??
          '',
        estimatedRentalValueWeekly:
          (foundProperty as any).estimatedRentalValueWeekly ??
          (foundProperty as any)['Estimated Rental Value (Weekly)'] ??
          (foundProperty as any)['Estimated Rent Weekly'] ??
          (foundProperty as any)['Estimated Rental Value Weekly'] ??
          0,
        maintenanceCostAnnual:
          (foundProperty as any).maintenanceCostAnnual ??
          (foundProperty as any)['Maintenance Cost (Annual)'] ??
          (foundProperty as any)['Maintenance'] ??
          0,
      } as unknown as Property;

      setProperty(mappedProperty);

      // Calculate analysis with CLIENT-SPECIFIC parameters
      // Use client's investment period (or default to 25 years if not specified)
      const loanPeriod = loadedClient.investmentPeriod
        ? Math.max(loadedClient.investmentPeriod, 5) // Minimum 5 years
        : 25; // Default

      // Calculate LVR from client's actual deposit
      // If deposit is provided, use it; otherwise default to 20% of property price
      const clientDeposit = loadedClient.deposit || mappedProperty.price * 0.2;
      const loanToValueRatio = Math.min(
        0.95,
        (mappedProperty.price - clientDeposit) / mappedProperty.price
      );

      // Use realistic current interest rates (2025)
      const interestRate = 0.065; // 6.5% - typical 2025 home loan rate

      // Appreciation rate varies by investment goal
      let appreciationRate = 0.04; // Default 4% p.a.
      if (loadedClient.investmentGoal === 'Capital Appreciation') {
        appreciationRate = 0.05; // Optimistic for capital growth focused
      } else if (loadedClient.investmentGoal === 'Rental Yield') {
        appreciationRate = 0.035; // Conservative, focusing on rental income
      }

      console.log('📊 CLIENT-SPECIFIC ANALYSIS PARAMETERS:', {
        clientName: loadedClient.name,
        clientDeposit: clientDeposit,
        salary: loadedClient.salary,
        investmentPeriod: loanPeriod,
        investmentGoal: loadedClient.investmentGoal,
        loanToValueRatio: `${(loanToValueRatio * 100).toFixed(2)}%`,
        interestRate: `${(interestRate * 100).toFixed(2)}%`,
        appreciationRate: `${(appreciationRate * 100).toFixed(1)}%`,
        propertyPrice: mappedProperty.price,
      });

      const propertyAnalysis = calculateInvestmentAnalysis(
        mappedProperty.price,
        mappedProperty.estimatedRentalValueWeekly,
        mappedProperty.maintenanceCostAnnual,
        interestRate,
        loanPeriod,
        appreciationRate,
        loanToValueRatio
      );
      setAnalysis(propertyAnalysis);
    }

    setIsLoading(false);
  }, [clientId, propertyId]);

  if (isLoading || !property || !analysis || !client) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        Loading...
      </div>
    );
  }

  // Calculate accurate remaining debt for projection chart
  const monthlyRate = analysis.loanRate / 12;
  const totalPayments = analysis.loanPeriod * 12;
  const remainingDebtYear1 = calculateRemainingLoan(
    analysis.loanAmount,
    monthlyRate,
    totalPayments,
    12
  );
  const remainingDebtYear5 = calculateRemainingLoan(
    analysis.loanAmount,
    monthlyRate,
    totalPayments,
    60
  );
  const remainingDebtYear10 = calculateRemainingLoan(
    analysis.loanAmount,
    monthlyRate,
    totalPayments,
    120
  );

  const projectionData = [
    { year: 0, value: property.price, debt: analysis.loanAmount },
    {
      year: 1,
      value: property.price * Math.pow(1 + analysis.appreciationRate, 1),
      debt: remainingDebtYear1,
    },
    { year: 5, value: analysis.projectedValueYear5, debt: remainingDebtYear5 },
    {
      year: 10,
      value: analysis.projectedValueYear10,
      debt: remainingDebtYear10,
    },
  ];

  const cashFlowData = [
    ...[
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ].map((m) => ({
      month: m,
      income: analysis.annualRentalIncome / 12,
      expenses:
        (analysis.annualMaintenanceCost +
          analysis.annualRates +
          analysis.annualInsurance +
          analysis.annualBodyCorp +
          // monthlyMortgage is already monthly, but analysis.monthlyMortgage may be monthly payment
          // ensure we use monthlyMortgage here
          analysis.monthlyMortgage * 12) /
        12,
    })),
  ];

  const expenseBreakdown = [
    { name: 'Mortgage', value: analysis.monthlyMortgage * 12 },
    { name: 'Maintenance', value: analysis.annualMaintenanceCost },
    { name: 'Rates', value: analysis.annualRates },
    { name: 'Insurance', value: analysis.annualInsurance },
    { name: 'Body Corp', value: analysis.annualBodyCorp },
  ];

  // Dummy agency details (replace with real data if available)
  const agencyDetails = {
    name: (property as any).agencyName || 'Prime Realty Group',
    contact: (property as any).agencyContact || '+61 2 1234 5678',
    email: (property as any).agencyEmail || 'info@primerealty.com.au',
    address: (property as any).agencyAddress || '123 Main St, Sydney NSW',
    agent: (property as any).agentName || 'Sarah Lee',
  };

  const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6'];
  const investmentRating = getInvestmentRating(analysis.investmentScore);

  return (
    <div className='min-h-screen bg-background'>
      {/* Header */}
      <header className='bg-card border-b border-border sticky top-0 z-50'>
        <div className='max-w-7xl mx-auto px-4 py-4 flex items-center justify-between'>
          <Link href={`/dashboard/clients/${clientId}/search`}>
            <Button
              variant='ghost'
              className='flex items-center gap-2 text-muted-foreground hover:text-foreground'
            >
              <ArrowLeft className='w-4 h-4' />
              Back to Search
            </Button>
          </Link>
          <div className='text-center'>
            <p className='text-sm text-muted-foreground'>
              Investment Analysis for
            </p>
            <h2 className='text-lg font-bold text-foreground'>{client.name}</h2>
          </div>
          <div className='flex gap-2'>
            {/* <Button
              variant='outline'
              className='flex items-center gap-2 border-border text-foreground hover:bg-muted bg-transparent'
            >
              <Share2 className='w-4 h-4' />
              Share
            </Button> */}
            <Link
              href={`/dashboard/clients/${clientId}/properties/${propertyId}/report`}
            >
              <Button className='flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground'>
                <Download className='w-4 h-4' />
                Download Report
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className='max-w-7xl mx-auto px-4 py-8 space-y-8'>
        {/* Property Header */}
        <div className='space-y-4'>
          <div>
            <h1 className='text-4xl font-bold text-foreground'>
              {property.address}
            </h1>
            <div className='flex items-center gap-2 text-muted-foreground mt-2'>
              <MapPin className='w-5 h-5' />
              <span>
                {property.suburb}, {property.state} {property.postcode}
              </span>
            </div>
          </div>

          {/* Client-Specific Analysis Parameters */}
          <Card className='bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border-blue-200 dark:border-blue-800'>
            <CardContent className='pt-4 pb-4'>
              <p className='text-xs font-semibold text-blue-800 dark:text-blue-200 mb-2'>
                PERSONALIZED ANALYSIS
              </p>
              <div className='grid grid-cols-2 md:grid-cols-5 gap-3 text-sm'>
                <div>
                  <p className='text-xs text-muted-foreground'>Loan Period</p>
                  <p className='font-bold text-foreground'>
                    {analysis.loanPeriod} years
                  </p>
                </div>
                <div>
                  <p className='text-xs text-muted-foreground'>Interest Rate</p>
                  <p className='font-bold text-foreground'>
                    {formatPercent(analysis.loanRate * 100, 2)}
                  </p>
                </div>
                <div>
                  <p className='text-xs text-muted-foreground'>LVR</p>
                  <p className='font-bold text-foreground'>
                    {formatPercent(
                      (analysis.loanAmount / property.price) * 100,
                      0
                    )}
                  </p>
                </div>
                <div>
                  <p className='text-xs text-muted-foreground'>Growth Rate</p>
                  <p className='font-bold text-foreground'>
                    {formatPercent(analysis.appreciationRate * 100, 1)}
                  </p>
                </div>
                <div>
                  <p className='text-xs text-muted-foreground'>Strategy</p>
                  <p className='font-bold text-foreground text-xs'>
                    {client.investmentGoal || 'Balanced'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Key Metrics - Top Section */}
          <div className='grid grid-cols-1 md:grid-cols-5 gap-4'>
            <Card className='bg-card border-border'>
              <CardContent className='pt-6'>
                <p className='text-sm text-muted-foreground mb-1'>Price</p>
                <p className='text-3xl font-bold text-primary'>
                  {formatCurrency(property.price)}
                </p>
              </CardContent>
            </Card>

            <Card className='bg-card border-border'>
              <CardContent className='pt-6'>
                <p className='text-sm text-muted-foreground mb-1'>
                  Gross Yield
                </p>
                <p className='text-3xl font-bold text-accent'>
                  {formatPercent(analysis.grossYield)}
                </p>
                <p className='text-xs text-muted-foreground mt-1'>
                  {getYieldRating(analysis.grossYield)}
                </p>
              </CardContent>
            </Card>

            <Card className='bg-card border-border'>
              <CardContent className='pt-6'>
                <p className='text-sm text-muted-foreground mb-1'>Break-Even</p>
                <p className='text-3xl font-bold text-blue-600'>
                  {analysis.breakEvenYears >= 999
                    ? 'N/A'
                    : `${analysis.breakEvenYears.toFixed(1)}`}
                </p>
                <p className='text-xs text-muted-foreground mt-1'>
                  {analysis.breakEvenYears >= 999 ? 'Not achievable' : 'years'}
                </p>
              </CardContent>
            </Card>

            <Card className='bg-card border-border'>
              <CardContent className='pt-6'>
                <p className='text-sm text-muted-foreground mb-1'>5-Year ROI</p>
                <p className='text-3xl font-bold text-green-600'>
                  {formatPercent(analysis.roiYear5)}
                </p>
              </CardContent>
            </Card>

            <Card
              className={`bg-card border-border border-2`}
              style={{
                borderColor: investmentRating.color.includes('green-600')
                  ? '#059669'
                  : investmentRating.color.includes('green-500')
                  ? '#10b981'
                  : investmentRating.color.includes('blue')
                  ? '#3b82f6'
                  : investmentRating.color.includes('yellow')
                  ? '#ca8a04'
                  : '#dc2626',
              }}
            >
              <CardContent className='pt-6'>
                <p className='text-sm text-muted-foreground mb-1'>
                  Investment Score
                </p>
                <p className={`text-3xl font-bold ${investmentRating.color}`}>
                  {analysis.investmentScore}
                </p>
                <p className='text-xs text-muted-foreground mt-1'>
                  {investmentRating.label}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Property Details Section */}
        <div className='grid grid-cols-1 lg:grid-cols-4 gap-4'>
          {/* Property Details */}
          <Card className='bg-card border-border'>
            <CardHeader>
              <CardTitle className='text-foreground flex items-center gap-2'>
                <Home className='w-5 h-5' />
                Property Details
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <p className='text-xs text-muted-foreground'>Type</p>
                  <p className='font-semibold text-foreground'>
                    {property.propertyType}
                  </p>
                </div>
                <div>
                  <p className='text-xs text-muted-foreground'>Year Built</p>
                  <p className='font-semibold text-foreground'>
                    {property.yearBuilt}
                  </p>
                </div>
                <div>
                  <p className='text-xs text-muted-foreground'>Bedrooms</p>
                  <p className='font-semibold text-foreground'>
                    {property.bedrooms}
                  </p>
                </div>
                <div>
                  <p className='text-xs text-muted-foreground'>Bathrooms</p>
                  <p className='font-semibold text-foreground'>
                    {property.bathrooms}
                  </p>
                </div>
                <div>
                  <p className='text-xs text-muted-foreground'>Car Spaces</p>
                  <p className='font-semibold text-foreground'>
                    {property.carSpaces}
                  </p>
                </div>
                <div>
                  <p className='text-xs text-muted-foreground'>Energy Rating</p>
                  <p className='font-semibold text-foreground'>
                    {property.energyRating}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Rental Income */}
          <Card className='bg-card border-border'>
            <CardHeader>
              <CardTitle className='text-foreground flex items-center gap-2'>
                <TrendingUp className='w-5 h-5' />
                Rental Income
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div>
                <p className='text-xs text-muted-foreground'>Weekly Rent</p>
                <p className='text-2xl font-bold text-foreground'>
                  {formatCurrency(property.estimatedRentalValueWeekly)}
                </p>
              </div>
              <div className='border-t border-border pt-4'>
                <p className='text-xs text-muted-foreground'>Annual Income</p>
                <p className='text-2xl font-bold text-accent'>
                  {formatCurrency(analysis.annualRentalIncome)}
                </p>
              </div>
              <div className='bg-muted/50 rounded-lg p-3'>
                <p className='text-xs text-muted-foreground'>
                  Monthly Net Cash Flow
                </p>
                <p
                  className={`text-lg font-bold ${
                    analysis.monthlyNetCashFlow > 0
                      ? 'text-green-600'
                      : 'text-red-600'
                  }`}
                >
                  {formatCurrency(analysis.monthlyNetCashFlow)}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Loan Details */}
          <Card className='bg-card border-border'>
            <CardHeader>
              <CardTitle className='text-foreground flex items-center gap-2'>
                <DollarSign className='w-5 h-5' />
                Loan Details
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div>
                <p className='text-xs text-muted-foreground'>
                  Loan Amount (80% LVR)
                </p>
                <p className='text-2xl font-bold text-foreground'>
                  {formatCurrency(analysis.loanAmount)}
                </p>
              </div>
              <div className='border-t border-border pt-4'>
                <p className='text-xs text-muted-foreground'>
                  Monthly Repayment
                </p>
                <p className='text-2xl font-bold text-foreground'>
                  {formatCurrency(analysis.monthlyMortgage)}
                </p>
              </div>
              <div className='bg-muted/50 rounded-lg p-3'>
                <p className='text-xs text-muted-foreground'>
                  Debt Service Ratio
                </p>
                <p
                  className={`text-lg font-bold ${
                    analysis.debtServiceRatio < 0.5
                      ? 'text-green-600'
                      : analysis.debtServiceRatio < 0.6
                      ? 'text-yellow-600'
                      : 'text-red-600'
                  }`}
                >
                  {formatPercent(analysis.debtServiceRatio * 100)}
                </p>
              </div>
              <div className='border-t border-border pt-4'>
                <p className='text-xs text-muted-foreground'>
                  Break-Even Period
                </p>
                <p className='text-2xl font-bold text-blue-600'>
                  {analysis.breakEvenYears >= 999
                    ? 'Not achievable'
                    : `${analysis.breakEvenYears.toFixed(1)} years`}
                </p>
                <p className='text-xs text-muted-foreground mt-1'>
                  {analysis.breakEvenYears >= 999
                    ? 'Negative cash flow exceeds appreciation'
                    : `${analysis.breakEvenMonths.toFixed(0)} months`}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Agency Details */}
          <Card className='bg-card border-border'>
            <CardHeader>
              <CardTitle className='text-foreground flex items-center gap-2'>
                <Home className='w-5 h-5' />
                Agency Details
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='grid grid-cols-1 gap-2'>
                <div>
                  <p className='text-xs text-muted-foreground'>Agency Name</p>
                  <p className='font-semibold text-foreground'>
                    {agencyDetails.name}
                  </p>
                </div>
                <div>
                  <p className='text-xs text-muted-foreground'>Agent</p>
                  <p className='font-semibold text-foreground'>
                    {agencyDetails.agent}
                  </p>
                </div>
                <div>
                  <p className='text-xs text-muted-foreground'>Contact</p>
                  <p className='font-semibold text-foreground'>
                    {agencyDetails.contact}
                  </p>
                </div>
                <div>
                  <p className='text-xs text-muted-foreground'>Email</p>
                  <p className='font-semibold text-foreground'>
                    {agencyDetails.email}
                  </p>
                </div>
                <div>
                  <p className='text-xs text-muted-foreground'>Address</p>
                  <p className='font-semibold text-foreground'>
                    {agencyDetails.address}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
          {/* Property Value Projection */}
          <Card className='bg-card border-border'>
            <CardHeader>
              <CardTitle className='text-foreground'>
                Property Value Projection
              </CardTitle>
              <CardDescription>
                Estimated value growth over 10 years at{' '}
                {formatPercent(analysis.appreciationRate * 100, 2)} p.a.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width='100%' height={300}>
                <LineChart data={projectionData}>
                  <CartesianGrid
                    strokeDasharray='3 3'
                    stroke='var(--color-border)'
                  />
                  <XAxis
                    dataKey='year'
                    stroke='var(--color-muted-foreground)'
                  />
                  <YAxis stroke='var(--color-muted-foreground)' />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--color-card)',
                      border: '1px solid var(--color-border)',
                    }}
                    labelStyle={{ color: 'var(--color-foreground)' }}
                  />
                  <Legend />
                  <Line
                    type='monotone'
                    dataKey='value'
                    stroke='var(--color-chart-1)'
                    strokeWidth={2}
                    name='Property Value'
                  />
                  <Line
                    type='monotone'
                    dataKey='debt'
                    stroke='var(--color-chart-4)'
                    strokeWidth={2}
                    name='Remaining Debt'
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Monthly Cash Flow */}
          <Card className='bg-card border-border'>
            <CardHeader>
              <CardTitle className='text-foreground'>
                Monthly Cash Flow
              </CardTitle>
              <CardDescription>
                Projected income vs expenses (typical month)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width='100%' height={300}>
                <BarChart data={cashFlowData}>
                  <CartesianGrid
                    strokeDasharray='3 3'
                    stroke='var(--color-border)'
                  />
                  <XAxis
                    dataKey='month'
                    stroke='var(--color-muted-foreground)'
                  />
                  <YAxis stroke='var(--color-muted-foreground)' />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--color-card)',
                      border: '1px solid var(--color-border)',
                    }}
                    labelStyle={{ color: 'var(--color-foreground)' }}
                  />
                  <Legend />
                  <Bar
                    dataKey='income'
                    fill='var(--color-chart-1)'
                    name='Rental Income'
                  />
                  <Bar
                    dataKey='expenses'
                    fill='var(--color-chart-4)'
                    name='Total Expenses'
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Break-even and ROI Analysis */}
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-4'>
          <Card className='bg-card border-border'>
            <CardHeader>
              <CardTitle className='text-foreground flex items-center gap-2'>
                <Clock className='w-5 h-5' />
                Break-Even Period
              </CardTitle>
            </CardHeader>
            <CardContent>
              {analysis.breakEvenMonths > 0 ? (
                <div className='space-y-4'>
                  <div className='bg-yellow-50 border border-yellow-200 rounded-lg p-4'>
                    <p className='text-sm text-yellow-800 flex items-center gap-2'>
                      <AlertCircle className='w-4 h-4' />
                      Negative cash flow
                    </p>
                  </div>
                  <div>
                    <p className='text-xs text-muted-foreground'>
                      Time to break even
                    </p>
                    <p className='text-3xl font-bold text-foreground'>
                      {analysis.breakEvenYears.toFixed(1)} years
                    </p>
                  </div>
                </div>
              ) : (
                <div className='bg-green-50 border border-green-200 rounded-lg p-4'>
                  <p className='text-sm font-semibold text-green-800'>
                    Positive Cash Flow
                  </p>
                  <p className='text-xs text-green-700 mt-1'>From Day 1</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className='bg-card border-border'>
            <CardHeader>
              <CardTitle className='text-foreground'>
                5-Year Projection
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div>
                <p className='text-xs text-muted-foreground'>Projected Value</p>
                <p className='text-2xl font-bold text-foreground'>
                  {formatCurrency(analysis.projectedValueYear5)}
                </p>
              </div>
              <div className='border-t border-border pt-4'>
                <p className='text-xs text-muted-foreground'>Capital Gain</p>
                <p className='text-2xl font-bold text-green-600'>
                  {formatCurrency(analysis.capitalGainYear5)}
                </p>
              </div>
              <div className='border-t border-border pt-4'>
                <p className='text-xs text-muted-foreground'>Total ROI</p>
                <p className='text-2xl font-bold text-accent'>
                  {formatPercent(analysis.roiYear5)}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className='bg-card border-border'>
            <CardHeader>
              <CardTitle className='text-foreground'>
                10-Year Projection
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div>
                <p className='text-xs text-muted-foreground'>Projected Value</p>
                <p className='text-2xl font-bold text-foreground'>
                  {formatCurrency(analysis.projectedValueYear10)}
                </p>
              </div>
              <div className='border-t border-border pt-4'>
                <p className='text-xs text-muted-foreground'>Capital Gain</p>
                <p className='text-2xl font-bold text-green-600'>
                  {formatCurrency(analysis.capitalGainYear10)}
                </p>
              </div>
              <div className='border-t border-border pt-4'>
                <p className='text-xs text-muted-foreground'>Total ROI</p>
                <p className='text-2xl font-bold text-accent'>
                  {formatPercent(analysis.roiYear10)}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Expense Breakdown */}
        <Card className='bg-card border-border'>
          <CardHeader>
            <CardTitle className='text-foreground'>
              Annual Expense Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
              <ResponsiveContainer width='100%' height={300}>
                <PieChart>
                  <Pie
                    data={expenseBreakdown}
                    cx='50%'
                    cy='50%'
                    labelLine={false}
                    label={({ name, value }) =>
                      `${name}: ${formatCurrency(value)}`
                    }
                    outerRadius={80}
                    fill='#8884d8'
                    dataKey='value'
                  >
                    {expenseBreakdown.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => formatCurrency(Number(value))}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className='space-y-3'>
                {expenseBreakdown.map((item, index) => (
                  <div
                    key={index}
                    className='flex items-center justify-between p-3 bg-muted/50 rounded-lg'
                  >
                    <div className='flex items-center gap-3'>
                      <div
                        className='w-4 h-4 rounded'
                        style={{ backgroundColor: COLORS[index] }}
                      ></div>
                      <span className='font-medium text-foreground'>
                        {item.name}
                      </span>
                    </div>
                    <span className='font-bold text-foreground'>
                      {formatCurrency(item.value)}
                    </span>
                  </div>
                ))}
                <div className='border-t border-border pt-3 mt-4'>
                  <div className='flex items-center justify-between p-3 bg-primary/10 rounded-lg'>
                    <span className='font-semibold text-foreground'>
                      Total Annual Expenses
                    </span>
                    <span className='font-bold text-primary'>
                      {formatCurrency(
                        expenseBreakdown.reduce(
                          (sum, item) => sum + item.value,
                          0
                        )
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
