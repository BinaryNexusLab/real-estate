"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, LogOut, Users, Home, TrendingUp } from "lucide-react"
import Link from "next/link"

interface Agent {
  email: string
  name: string
}

interface Client {
  id: string
  name: string
  email: string
  budget: number
  salary: number
  investmentGoal: string
  preferredLocation: string
  investmentPeriod: number
}

export default function DashboardPage() {
  const [agent, setAgent] = useState<Agent | null>(null)
  const [clients, setClients] = useState<Client[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const storedAgent = localStorage.getItem("agent")
    if (!storedAgent) {
      window.location.href = "/"
    } else {
      setAgent(JSON.parse(storedAgent))
      
      // Load clients from localStorage, fallback to dummy clients
      try {
        const stored = localStorage.getItem("clients")
        if (stored) {
          const parsed = JSON.parse(stored) as Client[]
          setClients(parsed)
        } else {
          // Seed with dummy clients if none exist
          const dummyClients: Client[] = [
            {
              id: "1",
              name: "John Smith",
              email: "john@example.com",
              budget: 600000,
              salary: 120000,
              investmentGoal: "Capital Appreciation",
              preferredLocation: "Sydney",
              investmentPeriod: 10,
            },
            {
              id: "2",
              name: "Sarah Johnson",
              email: "sarah@example.com",
              budget: 450000,
              salary: 95000,
              investmentGoal: "Rental Yield",
              preferredLocation: "Melbourne",
              investmentPeriod: 15,
            },
            {
              id: "3",
              name: "Michael Chen",
              email: "michael@example.com",
              budget: 750000,
              salary: 150000,
              investmentGoal: "Mixed Portfolio",
              preferredLocation: "Brisbane",
              investmentPeriod: 7,
            },
          ]
          setClients(dummyClients)
          try {
            localStorage.setItem("clients", JSON.stringify(dummyClients))
          } catch (e) {
            // eslint-disable-next-line no-console
            console.warn("Could not save seed clients to localStorage", e)
          }
        }
      } catch (e) {
        // eslint-disable-next-line no-console
        console.warn("Failed to load clients from localStorage", e)
        setClients([])
      }
      setIsLoading(false)
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem("agent")
    window.location.href = "/"
  }

  if (isLoading || !agent) return <div>Loading...</div>

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary text-primary-foreground p-2 rounded-lg">
              <Home className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Real Estate Matcher</h1>
              <p className="text-sm text-muted-foreground">Agent: {agent.name}</p>
            </div>
          </div>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="flex items-center gap-2 text-foreground border-border hover:bg-muted bg-transparent"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2">Welcome back, {agent.name}</h2>
          <p className="text-muted-foreground">Manage your clients and find matching investment properties</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="bg-card border-border">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Clients</p>
                  <p className="text-3xl font-bold text-foreground">{clients.length}</p>
                </div>
                <Users className="w-12 h-12 text-secondary" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avg. Budget</p>
                  <p className="text-3xl font-bold text-foreground">
                    ${(clients.reduce((sum, c) => sum + c.budget, 0) / clients.length / 1000).toFixed(0)}k
                  </p>
                </div>
                <TrendingUp className="w-12 h-12 text-accent" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Portfolio Value</p>
                  <p className="text-3xl font-bold text-foreground">
                    ${(clients.reduce((sum, c) => sum + c.budget, 0) / 1000000).toFixed(1)}M
                  </p>
                </div>
                <Home className="w-12 h-12 text-primary" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Clients Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold text-foreground">Your Clients</h3>
            <Link href="/dashboard/clients/new">
              <Button className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground">
                <Plus className="w-4 h-4" />
                Add New Client
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {clients.map((client) => (
              <Link key={client.id} href={`/dashboard/clients/${client.id}`}>
                <Card className="bg-card border-border hover:shadow-lg transition-shadow cursor-pointer h-full">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-foreground">{client.name}</CardTitle>
                        <CardDescription>{client.email}</CardDescription>
                      </div>
                      <span className="text-sm font-semibold text-secondary-foreground bg-secondary px-3 py-1 rounded-full">
                        {client.investmentGoal}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-muted-foreground">Budget</p>
                        <p className="text-lg font-bold text-foreground">${(client.budget / 1000).toFixed(0)}k</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Salary</p>
                        <p className="text-lg font-bold text-foreground">${(client.salary / 1000).toFixed(0)}k</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Location</p>
                        <p className="text-sm font-semibold text-foreground">{client.preferredLocation}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Period</p>
                        <p className="text-sm font-semibold text-foreground">{client.investmentPeriod} years</p>
                      </div>
                    </div>
                    <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-sm">
                      Find Properties
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
