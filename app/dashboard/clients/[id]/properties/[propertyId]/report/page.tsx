"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Download, FileText, File } from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { dummyProperties, type Property } from "@/lib/dummy-properties"
import { calculateInvestmentAnalysis, type PropertyAnalysis } from "@/lib/investment-calculator"
import { generateHTMLReport, generateCSVReport, type ReportData } from "@/lib/report-generator"
import { formatCurrency, formatPercent } from "@/lib/analysis-utils"

interface Client {
  id: string
  name: string
  email: string
  salary: number
  budget: number
}

const dummyClients: Record<string, Client> = {
  "1": { id: "1", name: "John Smith", email: "john@example.com", salary: 120000, budget: 600000 },
  "2": { id: "2", name: "Sarah Johnson", email: "sarah@example.com", salary: 95000, budget: 450000 },
  "3": { id: "3", name: "Michael Chen", email: "michael@example.com", salary: 150000, budget: 750000 },
}

export default function ReportPage() {
  const params = useParams()
  const clientId = params.id as string
  const propertyId = params.propertyId as string
  const [client, setClient] = useState<Client | null>(null)
  const [property, setProperty] = useState<Property | null>(null)
  const [analysis, setAnalysis] = useState<PropertyAnalysis | null>(null)
  const [reportData, setReportData] = useState<ReportData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isExporting, setIsExporting] = useState(false)

  useEffect(() => {
    const agent = localStorage.getItem("agent")
    if (!agent) {
      window.location.href = "/"
      return
    }

    if (dummyClients[clientId]) {
      const foundClient = dummyClients[clientId]
      setClient(foundClient)

      const foundProperty = dummyProperties.find((p) => p.id === propertyId)
      if (foundProperty) {
        setProperty(foundProperty)

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

        const data: ReportData = {
          clientName: foundClient.name,
          clientEmail: foundClient.email,
          clientSalary: foundClient.salary,
          clientBudget: foundClient.budget,
          property: foundProperty,
          analysis: propertyAnalysis,
          generatedDate: new Date().toLocaleDateString("en-AU", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          }),
        }
        setReportData(data)
      }
    }

    setIsLoading(false)
  }, [clientId, propertyId])

  const handleExportHTML = async () => {
    if (!reportData) return
    setIsExporting(true)

    const html = generateHTMLReport(reportData)
    const blob = new Blob([html], { type: "text/html" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `property-analysis-${property?.suburb}-${new Date().getTime()}.html`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    setIsExporting(false)
  }

  const handleExportPDF = async () => {
    if (!reportData) return
    setIsExporting(true)

    try {
      const html = generateHTMLReport(reportData)

      // Create a temporary iframe to print to PDF
      const iframe = document.createElement("iframe")
      iframe.style.display = "none"
      document.body.appendChild(iframe)

      const doc = iframe.contentDocument || iframe.contentWindow?.document
      if (doc) {
        doc.write(html)
        doc.close()

        iframe.contentWindow?.print()
      }

      // Fallback: Download as HTML if PDF printing fails
      setTimeout(() => {
        document.body.removeChild(iframe)
        setIsExporting(false)
      }, 1000)
    } catch (error) {
      console.error("PDF export error:", error)
      setIsExporting(false)
    }
  }

  const handleExportCSV = () => {
    if (!reportData) return
    setIsExporting(true)

    const csv = generateCSVReport(reportData)
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `property-analysis-${property?.suburb}-${new Date().getTime()}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    setIsExporting(false)
  }

  if (isLoading || !client || !property || !analysis || !reportData) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href={`/dashboard/clients/${clientId}/properties/${propertyId}`}>
            <Button variant="ghost" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-4 h-4" />
              Back to Property
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-foreground">Export Report</h1>
          <div></div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Report Preview */}
        <Card className="bg-card border-border mb-8">
          <CardHeader className="border-b border-border">
            <CardTitle className="text-foreground">Report Preview</CardTitle>
            <CardDescription>
              {property.address}, {property.suburb}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="bg-muted/50 rounded-lg p-6 space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Client</p>
                  <p className="font-semibold text-foreground">{client.name}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Property</p>
                  <p className="font-semibold text-foreground">{property.suburb}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Price</p>
                  <p className="font-semibold text-foreground">{formatCurrency(property.price)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">5-Year ROI</p>
                  <p className="font-semibold text-accent">{formatPercent(analysis.roiYear5)}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Export Options */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* PDF Export */}
          <Card className="bg-card border-border hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="bg-red-100 text-red-600 p-3 rounded-lg">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <CardTitle className="text-foreground text-lg">PDF Report</CardTitle>
                  <CardDescription>Professional formatted document</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Download a beautifully formatted PDF document with all property analysis, financial projections, and
                investment metrics.
              </p>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>✓ Professional design</li>
                <li>✓ Full analysis included</li>
                <li>✓ Print-friendly format</li>
                <li>✓ Ready to share</li>
              </ul>
              <Button
                onClick={handleExportPDF}
                disabled={isExporting}
                className="w-full bg-red-600 hover:bg-red-700 text-white flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                {isExporting ? "Exporting..." : "Export as PDF"}
              </Button>
            </CardContent>
          </Card>

          {/* HTML Export */}
          <Card className="bg-card border-border hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 text-blue-600 p-3 rounded-lg">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <CardTitle className="text-foreground text-lg">HTML Report</CardTitle>
                  <CardDescription>Interactive web document</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Download an interactive HTML report that can be opened in any web browser with full styling and
                formatting.
              </p>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>✓ Interactive format</li>
                <li>✓ Open in browser</li>
                <li>✓ Full styling preserved</li>
                <li>✓ Easy to share</li>
              </ul>
              <Button
                onClick={handleExportHTML}
                disabled={isExporting}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                {isExporting ? "Exporting..." : "Export as HTML"}
              </Button>
            </CardContent>
          </Card>

          {/* CSV Export */}
          <Card className="bg-card border-border hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="bg-green-100 text-green-600 p-3 rounded-lg">
                  <File className="w-6 h-6" />
                </div>
                <div>
                  <CardTitle className="text-foreground text-lg">CSV Export</CardTitle>
                  <CardDescription>Spreadsheet compatible format</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Download data in CSV format for use in spreadsheets, databases, and other analysis tools.
              </p>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>✓ Excel compatible</li>
                <li>✓ Easy to analyze</li>
                <li>✓ Structured data</li>
                <li>✓ Further customization</li>
              </ul>
              <Button
                onClick={handleExportCSV}
                disabled={isExporting}
                className="w-full bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                {isExporting ? "Exporting..." : "Export as CSV"}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Report Info */}
        <Card className="bg-muted/50 border border-border mt-8">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground text-center">
              Reports are generated based on current market data and assumptions. Please consult with a qualified
              financial advisor before making investment decisions.
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
