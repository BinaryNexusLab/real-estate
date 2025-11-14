"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Download, Share2, MapPin, Home, TrendingUp, DollarSign, Clock, AlertCircle } from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { dummyProperties, type Property } from "@/lib/dummy-properties"
import { calculateInvestmentAnalysis, type PropertyAnalysis } from "@/lib/investment-calculator"
import { formatCurrency, formatPercent, getInvestmentRating, getYieldRating } from "@/lib/analysis-utils"
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
} from "recharts"

interface Client {
  id: string
  name: string
  salary: number
}

const dummyClients: Record<string, Client> = {
  "1": { id: "1", name: "John Smith", salary: 120000 },
  "2": { id: "2", name: "Sarah Johnson", salary: 95000 },
  "3": { id: "3", name: "Michael Chen", salary: 150000 },
}

export default function PropertyDetailPage() {
  const params = useParams()
  const clientId = params.id as string
  const propertyId = params.propertyId as string
  const [client, setClient] = useState<Client | null>(null)
  const [property, setProperty] = useState<Property | null>(null)
  const [analysis, setAnalysis] = useState<PropertyAnalysis | null>(null)
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

    const foundProperty = dummyProperties.find((p) => p.id === propertyId)
    if (foundProperty) {
      setProperty(foundProperty)

      // Calculate analysis
      const propertyAnalysis = calculateInvestmentAnalysis(
        foundProperty.price,
        foundProperty.estimatedRentalValueWeekly,
        foundProperty.maintenanceCostAnnual,
        0.07,
        30,
        0.04,
        0.8,
      )
      setAnalysis(propertyAnalysis)
    }

    setIsLoading(false)
  }, [clientId, propertyId])

  if (isLoading || !property || !analysis || !client) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  const projectionData = [
    { year: 0, value: property.price, debt: analysis.loanAmount },
    { year: 1, value: property.price * 1.04, debt: analysis.loanAmount * 0.97 },
    { year: 5, value: analysis.projectedValueYear5, debt: analysis.loanAmount * 0.7 },
    { year: 10, value: analysis.projectedValueYear10, debt: analysis.loanAmount * 0.3 },
  ]

  const cashFlowData = [
    {
      month: "Jan",
      income: analysis.monthlyRentalIncome,
      expenses:
        (analysis.annualMaintenanceCost +
          analysis.annualRates +
          analysis.annualInsurance +
          analysis.annualBodyCorp +
          analysis.monthlyMortgage * 12) /
        12,
    },
    {
      month: "Feb",
      income: analysis.monthlyRentalIncome,
      expenses:
        (analysis.annualMaintenanceCost +
          analysis.annualRates +
          analysis.annualInsurance +
          analysis.annualBodyCorp +
          analysis.monthlyMortgage * 12) /
        12,
    },
    {
      month: "Mar",
      income: analysis.monthlyRentalIncome,
      expenses:
        (analysis.annualMaintenanceCost +
          analysis.annualRates +
          analysis.annualInsurance +
          analysis.annualBodyCorp +
          analysis.monthlyMortgage * 12) /
        12,
    },
    {
      month: "Apr",
      income: analysis.monthlyRentalIncome,
      expenses:
        (analysis.annualMaintenanceCost +
          analysis.annualRates +
          analysis.annualInsurance +
          analysis.annualBodyCorp +
          analysis.monthlyMortgage * 12) /
        12,
    },
    {
      month: "May",
      income: analysis.monthlyRentalIncome,
      expenses:
        (analysis.annualMaintenanceCost +
          analysis.annualRates +
          analysis.annualInsurance +
          analysis.annualBodyCorp +
          analysis.monthlyMortgage * 12) /
        12,
    },
    {
      month: "Jun",
      income: analysis.monthlyRentalIncome,
      expenses:
        (analysis.annualMaintenanceCost +
          analysis.annualRates +
          analysis.annualInsurance +
          analysis.annualBodyCorp +
          analysis.monthlyMortgage * 12) /
        12,
    },
  ]

  const expenseBreakdown = [
    { name: "Mortgage", value: analysis.monthlyMortgage * 12 },
    { name: "Maintenance", value: analysis.annualMaintenanceCost },
    { name: "Rates", value: analysis.annualRates },
    { name: "Insurance", value: analysis.annualInsurance },
    { name: "Body Corp", value: analysis.annualBodyCorp },
  ]

  const COLORS = ["#10b981", "#f59e0b", "#ef4444", "#3b82f6", "#8b5cf6"]
  const investmentRating = getInvestmentRating(analysis.investmentScore)

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href={`/dashboard/clients/${clientId}/search`}>
            <Button variant="ghost" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-4 h-4" />
              Back to Search
            </Button>
          </Link>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex items-center gap-2 border-border text-foreground hover:bg-muted bg-transparent"
            >
              <Share2 className="w-4 h-4" />
              Share
            </Button>
            <Link href={`/dashboard/clients/${clientId}/properties/${propertyId}/report`}>
              <Button className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground">
                <Download className="w-4 h-4" />
                Download Report
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Property Header */}
        <div className="space-y-4">
          <div>
            <h1 className="text-4xl font-bold text-foreground">{property.address}</h1>
            <div className="flex items-center gap-2 text-muted-foreground mt-2">
              <MapPin className="w-5 h-5" />
              <span>
                {property.suburb}, {property.state} {property.postcode}
              </span>
            </div>
          </div>

          {/* Key Metrics - Top Section */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-card border-border">
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground mb-1">Price</p>
                <p className="text-3xl font-bold text-primary">{formatCurrency(property.price)}</p>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground mb-1">Gross Yield</p>
                <p className="text-3xl font-bold text-accent">{formatPercent(analysis.grossYield)}</p>
                <p className="text-xs text-muted-foreground mt-1">{getYieldRating(analysis.grossYield)}</p>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground mb-1">5-Year ROI</p>
                <p className="text-3xl font-bold text-green-600">{formatPercent(analysis.roiYear5)}</p>
              </CardContent>
            </Card>

            <Card
              className={`bg-card border-border border-2`}
              style={{
                borderColor: investmentRating.color.includes("green-600")
                  ? "#059669"
                  : investmentRating.color.includes("green-500")
                    ? "#10b981"
                    : investmentRating.color.includes("blue")
                      ? "#3b82f6"
                      : investmentRating.color.includes("yellow")
                        ? "#ca8a04"
                        : "#dc2626",
              }}
            >
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground mb-1">Investment Score</p>
                <p className={`text-3xl font-bold ${investmentRating.color}`}>{analysis.investmentScore}</p>
                <p className="text-xs text-muted-foreground mt-1">{investmentRating.label}</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Property Details Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <Home className="w-5 h-5" />
                Property Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Type</p>
                  <p className="font-semibold text-foreground">{property.propertyType}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Year Built</p>
                  <p className="font-semibold text-foreground">{property.yearBuilt}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Bedrooms</p>
                  <p className="font-semibold text-foreground">{property.bedrooms}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Bathrooms</p>
                  <p className="font-semibold text-foreground">{property.bathrooms}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Car Spaces</p>
                  <p className="font-semibold text-foreground">{property.carSpaces}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Energy Rating</p>
                  <p className="font-semibold text-foreground">{property.energyRating}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Rental Income
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-xs text-muted-foreground">Weekly Rent</p>
                <p className="text-2xl font-bold text-foreground">
                  {formatCurrency(property.estimatedRentalValueWeekly)}
                </p>
              </div>
              <div className="border-t border-border pt-4">
                <p className="text-xs text-muted-foreground">Annual Income</p>
                <p className="text-2xl font-bold text-accent">{formatCurrency(analysis.annualRentalIncome)}</p>
              </div>
              <div className="bg-muted/50 rounded-lg p-3">
                <p className="text-xs text-muted-foreground">Monthly Net Cash Flow</p>
                <p
                  className={`text-lg font-bold ${analysis.monthlyNetCashFlow > 0 ? "text-green-600" : "text-red-600"}`}
                >
                  {formatCurrency(analysis.monthlyNetCashFlow)}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Loan Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-xs text-muted-foreground">Loan Amount (80% LVR)</p>
                <p className="text-2xl font-bold text-foreground">{formatCurrency(analysis.loanAmount)}</p>
              </div>
              <div className="border-t border-border pt-4">
                <p className="text-xs text-muted-foreground">Monthly Repayment</p>
                <p className="text-2xl font-bold text-foreground">{formatCurrency(analysis.monthlyMortgage)}</p>
              </div>
              <div className="bg-muted/50 rounded-lg p-3">
                <p className="text-xs text-muted-foreground">Debt Service Ratio</p>
                <p
                  className={`text-lg font-bold ${analysis.debtServiceRatio < 0.5 ? "text-green-600" : analysis.debtServiceRatio < 0.6 ? "text-yellow-600" : "text-red-600"}`}
                >
                  {formatPercent(analysis.debtServiceRatio * 100)}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Property Value Projection */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Property Value Projection</CardTitle>
              <CardDescription>Estimated value growth over 10 years at 4% p.a.</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={projectionData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis dataKey="year" stroke="var(--color-muted-foreground)" />
                  <YAxis stroke="var(--color-muted-foreground)" />
                  <Tooltip
                    contentStyle={{ backgroundColor: "var(--color-card)", border: "1px solid var(--color-border)" }}
                    labelStyle={{ color: "var(--color-foreground)" }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="var(--color-chart-1)"
                    strokeWidth={2}
                    name="Property Value"
                  />
                  <Line
                    type="monotone"
                    dataKey="debt"
                    stroke="var(--color-chart-4)"
                    strokeWidth={2}
                    name="Remaining Debt"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Monthly Cash Flow */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Monthly Cash Flow</CardTitle>
              <CardDescription>Projected income vs expenses (typical month)</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={cashFlowData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis dataKey="month" stroke="var(--color-muted-foreground)" />
                  <YAxis stroke="var(--color-muted-foreground)" />
                  <Tooltip
                    contentStyle={{ backgroundColor: "var(--color-card)", border: "1px solid var(--color-border)" }}
                    labelStyle={{ color: "var(--color-foreground)" }}
                  />
                  <Legend />
                  <Bar dataKey="income" fill="var(--color-chart-1)" name="Rental Income" />
                  <Bar dataKey="expenses" fill="var(--color-chart-4)" name="Total Expenses" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Break-even and ROI Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Break-Even Period
              </CardTitle>
            </CardHeader>
            <CardContent>
              {analysis.breakEvenMonths > 0 ? (
                <div className="space-y-4">
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-sm text-yellow-800 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      Negative cash flow
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Time to break even</p>
                    <p className="text-3xl font-bold text-foreground">{analysis.breakEvenYears.toFixed(1)} years</p>
                  </div>
                </div>
              ) : (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-sm font-semibold text-green-800">Positive Cash Flow</p>
                  <p className="text-xs text-green-700 mt-1">From Day 1</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">5-Year Projection</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-xs text-muted-foreground">Projected Value</p>
                <p className="text-2xl font-bold text-foreground">{formatCurrency(analysis.projectedValueYear5)}</p>
              </div>
              <div className="border-t border-border pt-4">
                <p className="text-xs text-muted-foreground">Capital Gain</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(analysis.capitalGainYear5)}</p>
              </div>
              <div className="border-t border-border pt-4">
                <p className="text-xs text-muted-foreground">Total ROI</p>
                <p className="text-2xl font-bold text-accent">{formatPercent(analysis.roiYear5)}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">10-Year Projection</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-xs text-muted-foreground">Projected Value</p>
                <p className="text-2xl font-bold text-foreground">{formatCurrency(analysis.projectedValueYear10)}</p>
              </div>
              <div className="border-t border-border pt-4">
                <p className="text-xs text-muted-foreground">Capital Gain</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(analysis.capitalGainYear10)}</p>
              </div>
              <div className="border-t border-border pt-4">
                <p className="text-xs text-muted-foreground">Total ROI</p>
                <p className="text-2xl font-bold text-accent">{formatPercent(analysis.roiYear10)}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Expense Breakdown */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Annual Expense Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={expenseBreakdown}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${formatCurrency(value)}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {expenseBreakdown.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-3">
                {expenseBreakdown.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded" style={{ backgroundColor: COLORS[index] }}></div>
                      <span className="font-medium text-foreground">{item.name}</span>
                    </div>
                    <span className="font-bold text-foreground">{formatCurrency(item.value)}</span>
                  </div>
                ))}
                <div className="border-t border-border pt-3 mt-4">
                  <div className="flex items-center justify-between p-3 bg-primary/10 rounded-lg">
                    <span className="font-semibold text-foreground">Total Annual Expenses</span>
                    <span className="font-bold text-primary">
                      {formatCurrency(expenseBreakdown.reduce((sum, item) => sum + item.value, 0))}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
