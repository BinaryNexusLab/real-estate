"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function NewClientPage() {
  const router = useRouter()
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    salary: 80000,
    budget: 500000,
    preferredLocation: "Sydney",
    investmentGoal: "Capital Appreciation",
    investmentPeriod: 10,
  })

  useEffect(() => {
    const agent = localStorage.getItem("agent")
    if (!agent) {
      router.push("/")
    }
  }, [router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: name === "salary" || name === "budget" || name === "investmentPeriod" ? Number.parseInt(value) : value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    try {
      // Create a client object with a simple unique id
      const newClient = {
        id: Date.now().toString(),
        name: formData.name,
        email: formData.email,
        budget: formData.budget,
        salary: formData.salary,
        investmentGoal: formData.investmentGoal,
        preferredLocation: formData.preferredLocation,
        investmentPeriod: formData.investmentPeriod,
      }

      // Read existing clients from localStorage and append
      const stored = localStorage.getItem("clients")
      const clients = stored ? (JSON.parse(stored) as any[]) : []
      clients.push(newClient)
      localStorage.setItem("clients", JSON.stringify(clients))

      // small delay to show saving state (UX)
      setTimeout(() => {
        setIsSaving(false)
        router.push("/dashboard/clients")
      }, 250)
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("Failed to save client", err)
      setIsSaving(false)
      // remain on page so user can retry
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/dashboard/clients">
            <Button variant="ghost" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-foreground">Add New Client</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        <Card className="bg-card border-border">
          <CardHeader className="border-b border-border">
            <CardTitle className="text-foreground">Client Information</CardTitle>
            <CardDescription>Enter client financial profile and investment preferences</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-foreground font-medium">
                    Full Name
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="bg-input border-border text-foreground placeholder:text-muted-foreground"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-foreground font-medium">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="bg-input border-border text-foreground placeholder:text-muted-foreground"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="salary" className="text-foreground font-medium">
                    Annual Salary (AUD)
                  </Label>
                  <Input
                    id="salary"
                    name="salary"
                    type="number"
                    value={formData.salary}
                    onChange={handleChange}
                    className="bg-input border-border text-foreground placeholder:text-muted-foreground"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="budget" className="text-foreground font-medium">
                    Investment Budget (AUD)
                  </Label>
                  <Input
                    id="budget"
                    name="budget"
                    type="number"
                    value={formData.budget}
                    onChange={handleChange}
                    className="bg-input border-border text-foreground placeholder:text-muted-foreground"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="preferredLocation" className="text-foreground font-medium">
                    Preferred Location
                  </Label>
                  <select
                    id="preferredLocation"
                    name="preferredLocation"
                    value={formData.preferredLocation}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-input border border-border text-foreground rounded-md"
                  >
                    <option>Sydney</option>
                    <option>Melbourne</option>
                    <option>Brisbane</option>
                    <option>Perth</option>
                    <option>Adelaide</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="investmentGoal" className="text-foreground font-medium">
                    Investment Goal
                  </Label>
                  <select
                    id="investmentGoal"
                    name="investmentGoal"
                    value={formData.investmentGoal}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-input border border-border text-foreground rounded-md"
                  >
                    <option>Capital Appreciation</option>
                    <option>Rental Yield</option>
                    <option>Mixed Portfolio</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="investmentPeriod" className="text-foreground font-medium">
                  Investment Period (Years)
                </Label>
                <Input
                  id="investmentPeriod"
                  name="investmentPeriod"
                  type="number"
                  value={formData.investmentPeriod}
                  onChange={handleChange}
                  className="bg-input border-border text-foreground placeholder:text-muted-foreground"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <Button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
                >
                  {isSaving ? "Creating..." : "Create Client"}
                </Button>
                <Link href="/dashboard/clients" className="flex-1">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full border-border text-foreground hover:bg-muted bg-transparent"
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
  )
}
