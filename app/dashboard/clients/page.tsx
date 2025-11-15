"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Plus, ArrowLeft, Edit2, Trash2 } from "lucide-react"
import Link from "next/link"

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

export default function ClientsListPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const agent = localStorage.getItem("agent")
    if (!agent) {
      window.location.href = "/"
      return
    }
    // Try to load clients from localStorage. If none exist, seed with default demo clients.
    try {
      const stored = localStorage.getItem("clients")
      if (stored) {
        const parsed = JSON.parse(stored) as Client[]
        setClients(parsed)
      } else {
        const seed: Client[] = [
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
        setClients(seed)
        try {
          localStorage.setItem("clients", JSON.stringify(seed))
        } catch (e) {
          // ignore storage errors
          // eslint-disable-next-line no-console
          console.warn("Could not save seed clients to localStorage", e)
        }
      }
    } catch (e) {
      // If parsing fails, fallback to an empty list
      // eslint-disable-next-line no-console
      console.warn("Failed to read clients from localStorage", e)
      setClients([])
    }
    setIsLoading(false)
  }, [])

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this client?")) {
      const updated = clients.filter((c) => c.id !== id)
      setClients(updated)
      try {
        localStorage.setItem("clients", JSON.stringify(updated))
      } catch (e) {
        // eslint-disable-next-line no-console
        console.warn("Failed to persist clients after delete", e)
      }
    }
  }

  if (isLoading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/dashboard">
            <Button variant="ghost" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-foreground">Manage Clients</h1>
          <Link href="/dashboard/clients/new">
            <Button className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground">
              <Plus className="w-4 h-4" />
              Add Client
            </Button>
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="space-y-4">
          {clients.map((client) => (
            <Card key={client.id} className="bg-card border-border hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-foreground">{client.name}</h3>
                    <p className="text-sm text-muted-foreground mb-3">{client.email}</p>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                      <div>
                        <p className="text-xs text-muted-foreground">Budget</p>
                        <p className="font-semibold text-foreground">${(client.budget / 1000).toFixed(0)}k</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Salary</p>
                        <p className="font-semibold text-foreground">${(client.salary / 1000).toFixed(0)}k</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Goal</p>
                        <p className="font-semibold text-foreground text-sm">{client.investmentGoal}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Location</p>
                        <p className="font-semibold text-foreground">{client.preferredLocation}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Period</p>
                        <p className="font-semibold text-foreground">{client.investmentPeriod} yrs</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/dashboard/clients/${client.id}/edit`}>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-border text-foreground hover:bg-muted bg-transparent"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(client.id)}
                      className="border-destructive text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  )
}
