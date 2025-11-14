"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, MapPin, Home, DollarSign, TrendingUp } from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { dummyProperties, type Property } from "@/lib/dummy-properties"

interface Client {
  id: string
  name: string
  budget: number
  preferredLocation: string
  investmentGoal: string
}

const dummyClients: Record<string, Client> = {
  "1": {
    id: "1",
    name: "John Smith",
    budget: 600000,
    preferredLocation: "Sydney",
    investmentGoal: "Capital Appreciation",
  },
  "2": {
    id: "2",
    name: "Sarah Johnson",
    budget: 450000,
    preferredLocation: "Melbourne",
    investmentGoal: "Rental Yield",
  },
  "3": {
    id: "3",
    name: "Michael Chen",
    budget: 750000,
    preferredLocation: "Brisbane",
    investmentGoal: "Mixed Portfolio",
  },
}

export default function PropertySearchPage() {
  const params = useParams()
  const clientId = params.id as string
  const [client, setClient] = useState<Client | null>(null)
  const [properties, setProperties] = useState<Property[]>([])
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([])
  const [filters, setFilters] = useState({
    maxPrice: 800000,
    minBedrooms: 0,
    propertyType: "All",
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const agent = localStorage.getItem("agent")
    if (!agent) {
      window.location.href = "/"
      return
    }

    if (dummyClients[clientId]) {
      setClient(dummyClients[clientId])
    }

    // Filter properties based on client profile
    const filtered = dummyProperties.filter((prop) => {
      const withinBudget = prop.price <= (dummyClients[clientId]?.budget || 800000)
      return withinBudget
    })

    setProperties(filtered)
    setFilteredProperties(filtered)
    setFilters((prev) => ({
      ...prev,
      maxPrice: dummyClients[clientId]?.budget || 800000,
    }))
    setIsLoading(false)
  }, [clientId])

  useEffect(() => {
    let results = properties

    // Apply filters
    if (filters.maxPrice) {
      results = results.filter((p) => p.price <= filters.maxPrice)
    }

    if (filters.minBedrooms > 0) {
      results = results.filter((p) => p.bedrooms >= filters.minBedrooms)
    }

    if (filters.propertyType !== "All") {
      results = results.filter((p) => p.propertyType === filters.propertyType)
    }

    setFilteredProperties(results)
  }, [filters, properties])

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFilters((prev) => ({
      ...prev,
      [name]: name === "maxPrice" || name === "minBedrooms" ? Number.parseInt(value) : value,
    }))
  }

  if (isLoading || !client) return <div className="min-h-screen flex items-center justify-center">Loading...</div>

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href={`/dashboard/clients/${clientId}`}>
            <Button variant="ghost" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-4 h-4" />
              Back to Client
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-foreground">Property Search for {client.name}</h1>
          <div></div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Filters Section */}
        <Card className="bg-card border-border mb-8">
          <CardHeader className="border-b border-border">
            <CardTitle className="text-foreground">Search Filters</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="maxPrice" className="text-foreground font-medium text-sm">
                  Max Price
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="maxPrice"
                    name="maxPrice"
                    type="number"
                    value={filters.maxPrice}
                    onChange={handleFilterChange}
                    className="bg-input border-border text-foreground placeholder:text-muted-foreground"
                  />
                  <span className="text-sm text-muted-foreground">AUD</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="minBedrooms" className="text-foreground font-medium text-sm">
                  Min Bedrooms
                </Label>
                <select
                  id="minBedrooms"
                  name="minBedrooms"
                  value={filters.minBedrooms}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 bg-input border border-border text-foreground rounded-md"
                >
                  <option value={0}>Any</option>
                  <option value={1}>1+</option>
                  <option value={2}>2+</option>
                  <option value={3}>3+</option>
                  <option value={4}>4+</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="propertyType" className="text-foreground font-medium text-sm">
                  Property Type
                </Label>
                <select
                  id="propertyType"
                  name="propertyType"
                  value={filters.propertyType}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 bg-input border border-border text-foreground rounded-md"
                >
                  <option>All</option>
                  <option>House</option>
                  <option>Apartment</option>
                  <option>Townhouse</option>
                </select>
              </div>

              <div className="flex items-end">
                <Button
                  onClick={() => {
                    setFilters({ maxPrice: client.budget, minBedrooms: 0, propertyType: "All" })
                  }}
                  variant="outline"
                  className="w-full border-border text-foreground hover:bg-muted"
                >
                  Reset Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results Summary */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-foreground">{filteredProperties.length} Properties Found</h2>
            <p className="text-sm text-muted-foreground">
              Matching {client.name}'s {client.investmentGoal} goal
            </p>
          </div>
        </div>

        {/* Properties Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredProperties.map((property) => {
            const annualRent = property.estimatedRentalValueWeekly * 52
            const roi = ((annualRent - property.maintenanceCostAnnual) / property.price) * 100

            return (
              <Link key={property.id} href={`/dashboard/clients/${clientId}/properties/${property.id}`}>
                <Card className="bg-card border-border hover:shadow-lg transition-shadow cursor-pointer h-full">
                  <CardHeader className="border-b border-border">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-foreground text-lg">{property.address}</CardTitle>
                        <CardDescription className="flex items-center gap-1 mt-1">
                          <MapPin className="w-4 h-4" />
                          {property.suburb}, {property.state} {property.postcode}
                        </CardDescription>
                      </div>
                      <span className="text-sm font-semibold text-secondary-foreground bg-secondary px-3 py-1 rounded-full">
                        {property.propertyType}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4">
                    {/* Price */}
                    <div className="mb-4 pb-4 border-b border-border">
                      <div className="flex items-baseline gap-2">
                        <DollarSign className="w-5 h-5 text-primary" />
                        <span className="text-3xl font-bold text-foreground">
                          {(property.price / 1000).toFixed(0)}k
                        </span>
                        <span className="text-sm text-muted-foreground">
                          (Median: ${(property.medianPrice / 1000).toFixed(0)}k)
                        </span>
                      </div>
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-muted-foreground">Bedrooms</p>
                        <p className="text-lg font-bold text-foreground">{property.bedrooms}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Bathrooms</p>
                        <p className="text-lg font-bold text-foreground">{property.bathrooms}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Car Spaces</p>
                        <p className="text-lg font-bold text-foreground">{property.carSpaces}</p>
                      </div>
                    </div>

                    {/* Investment Metrics */}
                    <div className="bg-muted/50 rounded-lg p-3 space-y-2 mb-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Est. Weekly Rent</span>
                        <span className="font-semibold text-foreground">${property.estimatedRentalValueWeekly}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Annual Maintenance</span>
                        <span className="font-semibold text-foreground">
                          ${property.maintenanceCostAnnual.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center justify-between border-t border-border pt-2">
                        <span className="text-sm font-semibold text-muted-foreground flex items-center gap-1">
                          <TrendingUp className="w-4 h-4" />
                          Gross ROI
                        </span>
                        <span className="font-bold text-accent text-lg">{roi.toFixed(2)}%</span>
                      </div>
                    </div>

                    <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-sm">
                      View Full Analysis
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>

        {filteredProperties.length === 0 && (
          <Card className="bg-card border-border">
            <CardContent className="pt-12 pb-12 text-center">
              <Home className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-lg font-semibold text-foreground mb-2">No Properties Found</p>
              <p className="text-muted-foreground">Try adjusting your filters to see more results</p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
