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
import { ArrowLeft, Home } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { getClientById, type Client } from '@/app/data/client-data';

export default function ClientDetailPage() {
  const params = useParams();
  const clientId = params.id as string;
  const [client, setClient] = useState<Client | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const agent = localStorage.getItem('agent');
    if (!agent) {
      window.location.href = '/';
      return;
    }

    try {
      const foundClient = getClientById(clientId);
      setClient(foundClient);
      setIsLoading(false);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn('Failed to load client detail', e);
      setIsLoading(false);
    }
  }, [clientId]);

  if (isLoading)
    return (
      <div className='min-h-screen flex items-center justify-center'>
        Loading...
      </div>
    );
  if (!client)
    return (
      <div className='min-h-screen flex items-center justify-center'>
        Client not found
      </div>
    );

  return (
    <div className='min-h-screen bg-background'>
      {/* Header */}
      <header className='bg-card border-b border-border sticky top-0 z-50'>
        <div className='max-w-4xl mx-auto px-4 py-4 flex items-center justify-between'>
          <Link href='/dashboard/clients'>
            <Button
              variant='ghost'
              className='flex items-center gap-2 text-muted-foreground hover:text-foreground'
            >
              <ArrowLeft className='w-4 h-4' />
              Back to Clients
            </Button>
          </Link>
          <Link href={`/dashboard/clients/${clientId}/search`}>
            <Button className='flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground'>
              <Home className='w-4 h-4' />
              Find Properties
            </Button>
          </Link>
        </div>
      </header>

      <main className='max-w-4xl mx-auto px-4 py-8'>
        <Card className='bg-card border-border mb-6'>
          <CardHeader className='border-b border-border'>
            <div className='flex items-start justify-between'>
              <div>
                <CardTitle className='text-3xl text-foreground'>
                  {client.name}
                </CardTitle>
                <CardDescription className='text-muted-foreground mt-1'>
                  {client.email}
                </CardDescription>
              </div>
              <Link href={`/dashboard/clients/${clientId}/edit`}>
                <Button
                  variant='outline'
                  className='border-border text-foreground hover:bg-muted bg-transparent'
                >
                  Edit Profile
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className='pt-6'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <div>
                <p className='text-sm text-muted-foreground mb-1'>
                  Investment Budget
                </p>
                <p className='text-3xl font-bold text-primary'>
                  ${(client.budget / 1000).toFixed(0)}k
                </p>
                <p className='text-xs text-muted-foreground mt-2'>AUD</p>
              </div>
              <div>
                <p className='text-sm text-muted-foreground mb-1'>
                  Annual Salary
                </p>
                <p className='text-3xl font-bold text-accent'>
                  ${(client.salary / 1000).toFixed(0)}k
                </p>
                <p className='text-xs text-muted-foreground mt-2'>
                  Debt-to-Income Ratio:{' '}
                  {((client.budget / client.salary) * 100).toFixed(0)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Client Profile Details */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <Card className='bg-card border-border'>
            <CardHeader>
              <CardTitle className='text-foreground'>
                Investment Profile
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div>
                <p className='text-sm text-muted-foreground'>Investment Goal</p>
                <p className='font-semibold text-foreground text-lg'>
                  {client.investmentGoal}
                </p>
              </div>
              <div>
                <p className='text-sm text-muted-foreground'>
                  Investment Period
                </p>
                <p className='font-semibold text-foreground text-lg'>
                  {client.investmentPeriod} years
                </p>
              </div>
              <div>
                <p className='text-sm text-muted-foreground'>
                  Preferred Location
                </p>
                <p className='font-semibold text-foreground text-lg'>
                  {client.preferredLocation}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className='bg-card border-border'>
            <CardHeader>
              <CardTitle className='text-foreground'>
                Financial Metrics
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div>
                <p className='text-sm text-muted-foreground'>
                  Loan Serviceability
                </p>
                <p className='font-semibold text-foreground text-lg'>
                  {(client.salary / 4 > client.budget * 0.05).toString() ===
                  'true'
                    ? 'Good'
                    : 'Risk'}
                </p>
              </div>
              <div>
                <p className='text-sm text-muted-foreground'>Maximum LVR</p>
                <p className='font-semibold text-foreground text-lg'>80%</p>
              </div>
              <div>
                <p className='text-sm text-muted-foreground'>
                  Likely Loan Amount
                </p>
                <p className='font-semibold text-foreground text-lg'>
                  ${((client.budget * 0.8) / 1000).toFixed(0)}k
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
