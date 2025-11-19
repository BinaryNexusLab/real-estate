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
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';

interface Client {
  id: string;
  name: string;
  email: string;
  budget: number;
  salary: number;
  investmentGoal: string;
  preferredLocation: string;
  investmentPeriod: number;
}

const dummyClients: Record<string, Client> = {
  '1': {
    id: '1',
    name: 'John Smith',
    email: 'john@example.com',
    budget: 1200000,
    salary: 180000,
    investmentGoal: 'Capital Appreciation',
    preferredLocation: 'Sydney',
    investmentPeriod: 10,
  },
  '2': {
    id: '2',
    name: 'Sarah Johnson',
    email: 'sarah@example.com',
    budget: 1300000,
    salary: 195000,
    investmentGoal: 'Rental Yield',
    preferredLocation: 'Melbourne',
    investmentPeriod: 15,
  },
  '3': {
    id: '3',
    name: 'Michael Chen',
    email: 'michael@example.com',
    budget: 850000,
    salary: 150000,
    investmentGoal: 'Mixed Portfolio',
    preferredLocation: 'Brisbane',
    investmentPeriod: 7,
  },
};

export default function EditClientPage() {
  const params = useParams();
  const router = useRouter();
  const clientId = params.id as string;
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<Client | null>(null);

  useEffect(() => {
    const agent = localStorage.getItem('agent');
    if (!agent) {
      router.push('/');
      return;
    }

    try {
      const stored = localStorage.getItem('clients');
      if (stored) {
        const parsed = JSON.parse(stored) as Client[];
        const found = parsed.find((c) => c.id === clientId);
        if (found) {
          setFormData(found);
          setIsLoading(false);
          return;
        }
      }

      // fallback to dummy clients
      if (dummyClients[clientId]) {
        setFormData(dummyClients[clientId]);
        setIsLoading(false);
        return;
      }

      // not found: redirect back to clients list
      router.push('/dashboard/clients');
    } catch (e) {
      // parse error or other issue - go back to list
      // eslint-disable-next-line no-console
      console.warn('Failed to load client for edit', e);
      router.push('/dashboard/clients');
    }
  }, [clientId, router]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    if (!formData) return;
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]:
        name === 'budget' || name === 'salary' || name === 'investmentPeriod'
          ? Number.parseInt(value)
          : value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      // Read existing clients, update matching id or append
      const stored = localStorage.getItem('clients');
      const clients = stored ? (JSON.parse(stored) as Client[]) : [];
      const idx = clients.findIndex((c) => c.id === clientId);
      if (idx > -1) {
        clients[idx] = formData as Client;
      } else {
        clients.push(formData as Client);
      }
      localStorage.setItem('clients', JSON.stringify(clients));

      setTimeout(() => {
        setIsSaving(false);
        router.push(`/dashboard/clients/${clientId}`);
      }, 250);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Failed to save client', err);
      setIsSaving(false);
    }
  };

  if (isLoading || !formData)
    return (
      <div className='min-h-screen flex items-center justify-center'>
        Loading...
      </div>
    );

  return (
    <div className='min-h-screen bg-background'>
      {/* Header */}
      <header className='bg-card border-b border-border sticky top-0 z-50'>
        <div className='max-w-2xl mx-auto px-4 py-4 flex items-center gap-4'>
          <Link href={`/dashboard/clients/${clientId}`}>
            <Button
              variant='ghost'
              className='flex items-center gap-2 text-muted-foreground hover:text-foreground'
            >
              <ArrowLeft className='w-4 h-4' />
              Back
            </Button>
          </Link>
          <h1 className='text-2xl font-bold text-foreground'>Edit Client</h1>
        </div>
      </header>

      <main className='max-w-2xl mx-auto px-4 py-8'>
        <Card className='bg-card border-border'>
          <CardHeader className='border-b border-border'>
            <CardTitle className='text-foreground'>
              Client Information
            </CardTitle>
            <CardDescription>
              Update client financial profile and investment preferences
            </CardDescription>
          </CardHeader>
          <CardContent className='pt-6'>
            <form onSubmit={handleSubmit} className='space-y-6'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <Label htmlFor='name' className='text-foreground font-medium'>
                    Full Name
                  </Label>
                  <Input
                    id='name'
                    name='name'
                    value={formData.name}
                    onChange={handleChange}
                    className='bg-input border-border text-foreground placeholder:text-muted-foreground'
                  />
                </div>
                <div className='space-y-2'>
                  <Label
                    htmlFor='email'
                    className='text-foreground font-medium'
                  >
                    Email Address
                  </Label>
                  <Input
                    id='email'
                    name='email'
                    type='email'
                    value={formData.email}
                    onChange={handleChange}
                    className='bg-input border-border text-foreground placeholder:text-muted-foreground'
                  />
                </div>
              </div>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <Label
                    htmlFor='salary'
                    className='text-foreground font-medium'
                  >
                    Annual Salary (AUD)
                  </Label>
                  <Input
                    id='salary'
                    name='salary'
                    type='number'
                    value={formData.salary}
                    onChange={handleChange}
                    className='bg-input border-border text-foreground placeholder:text-muted-foreground'
                  />
                </div>
                <div className='space-y-2'>
                  <Label
                    htmlFor='budget'
                    className='text-foreground font-medium'
                  >
                    Investment Budget (AUD)
                  </Label>
                  <Input
                    id='budget'
                    name='budget'
                    type='number'
                    value={formData.budget}
                    onChange={handleChange}
                    className='bg-input border-border text-foreground placeholder:text-muted-foreground'
                  />
                </div>
              </div>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <Label
                    htmlFor='preferredLocation'
                    className='text-foreground font-medium'
                  >
                    Preferred Location
                  </Label>
                  <select
                    id='preferredLocation'
                    name='preferredLocation'
                    value={formData.preferredLocation}
                    onChange={handleChange}
                    className='w-full px-3 py-2 bg-input border border-border text-foreground rounded-md'
                  >
                    <option>Sydney</option>
                    <option>Melbourne</option>
                    <option>Brisbane</option>
                    <option>Perth</option>
                    <option>Adelaide</option>
                  </select>
                </div>
                <div className='space-y-2'>
                  <Label
                    htmlFor='investmentGoal'
                    className='text-foreground font-medium'
                  >
                    Investment Goal
                  </Label>
                  <select
                    id='investmentGoal'
                    name='investmentGoal'
                    value={formData.investmentGoal}
                    onChange={handleChange}
                    className='w-full px-3 py-2 bg-input border border-border text-foreground rounded-md'
                  >
                    <option>Capital Appreciation</option>
                    <option>Rental Yield</option>
                    <option>Mixed Portfolio</option>
                  </select>
                </div>
              </div>

              <div className='space-y-2'>
                <Label
                  htmlFor='investmentPeriod'
                  className='text-foreground font-medium'
                >
                  Investment Period (Years)
                </Label>
                <Input
                  id='investmentPeriod'
                  name='investmentPeriod'
                  type='number'
                  value={formData.investmentPeriod}
                  onChange={handleChange}
                  className='bg-input border-border text-foreground placeholder:text-muted-foreground'
                />
              </div>

              <div className='flex gap-4 pt-4'>
                <Button
                  type='submit'
                  disabled={isSaving}
                  className='flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold'
                >
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
                <Link
                  href={`/dashboard/clients/${clientId}`}
                  className='flex-1'
                >
                  <Button
                    type='button'
                    variant='outline'
                    className='w-full border-border text-foreground hover:bg-muted bg-transparent'
                  >
                    Cancel
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
