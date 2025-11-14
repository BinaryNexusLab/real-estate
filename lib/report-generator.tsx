import type { PropertyAnalysis } from "./investment-calculator"
import type { Property } from "./dummy-properties"
import { formatCurrency, formatPercent } from "./analysis-utils"

export interface ReportData {
  clientName: string
  clientEmail: string
  clientSalary: number
  clientBudget: number
  property: Property
  analysis: PropertyAnalysis
  generatedDate: string
}

export function generateHTMLReport(data: ReportData): string {
  const { clientName, clientEmail, clientSalary, clientBudget, property, analysis, generatedDate } = data

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #1f2937;
      background: #f9fafb;
      margin: 0;
      padding: 20px;
    }
    .container {
      max-width: 900px;
      margin: 0 auto;
      background: white;
      border-radius: 8px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      overflow: hidden;
    }
    .header {
      background: linear-gradient(135deg, #047857 0%, #059669 100%);
      color: white;
      padding: 40px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 32px;
      font-weight: bold;
    }
    .header p {
      margin: 10px 0 0 0;
      font-size: 14px;
      opacity: 0.9;
    }
    .section {
      padding: 40px;
      border-bottom: 1px solid #e5e7eb;
    }
    .section:last-child {
      border-bottom: none;
    }
    .section h2 {
      margin: 0 0 20px 0;
      font-size: 20px;
      color: #047857;
      font-weight: 600;
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 20px;
      margin-bottom: 20px;
    }
    .grid.three {
      grid-template-columns: repeat(3, 1fr);
    }
    .metric {
      background: #f3f4f6;
      padding: 15px;
      border-radius: 6px;
    }
    .metric-label {
      font-size: 12px;
      color: #6b7280;
      text-transform: uppercase;
      margin-bottom: 5px;
    }
    .metric-value {
      font-size: 24px;
      font-weight: bold;
      color: #1f2937;
    }
    .metric-sublabel {
      font-size: 12px;
      color: #6b7280;
      margin-top: 5px;
    }
    .key-metrics {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 15px;
      margin: 20px 0;
    }
    .key-metric-card {
      background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
      border: 1px solid #86efac;
      padding: 20px;
      border-radius: 6px;
      text-align: center;
    }
    .key-metric-label {
      font-size: 12px;
      color: #4b5563;
      margin-bottom: 8px;
    }
    .key-metric-value {
      font-size: 28px;
      font-weight: bold;
      color: #047857;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
    }
    th {
      background: #f3f4f6;
      padding: 12px;
      text-align: left;
      font-weight: 600;
      border-bottom: 2px solid #d1d5db;
      font-size: 13px;
    }
    td {
      padding: 12px;
      border-bottom: 1px solid #e5e7eb;
    }
    tr:last-child td {
      border-bottom: none;
    }
    .summary-table td:first-child {
      font-weight: 500;
    }
    .summary-table td:last-child {
      text-align: right;
      font-weight: bold;
    }
    .footer {
      background: #f9fafb;
      padding: 20px 40px;
      font-size: 12px;
      color: #6b7280;
      border-top: 1px solid #e5e7eb;
      text-align: center;
    }
    .page-break {
      page-break-after: always;
      margin-bottom: 40px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Investment Property Analysis Report</h1>
      <p>Generated on ${generatedDate}</p>
    </div>

    <!-- Client Information -->
    <div class="section">
      <h2>Client Information</h2>
      <div class="grid">
        <div class="metric">
          <div class="metric-label">Client Name</div>
          <div class="metric-value">${clientName}</div>
          <div class="metric-sublabel">${clientEmail}</div>
        </div>
        <div class="metric">
          <div class="metric-label">Annual Salary</div>
          <div class="metric-value">${formatCurrency(clientSalary)}</div>
        </div>
        <div class="metric">
          <div class="metric-label">Investment Budget</div>
          <div class="metric-value">${formatCurrency(clientBudget)}</div>
        </div>
        <div class="metric">
          <div class="metric-label">Max LVR Loan</div>
          <div class="metric-value">${formatCurrency(clientBudget * 0.8)}</div>
        </div>
      </div>
    </div>

    <!-- Property Details -->
    <div class="section">
      <h2>Property Details</h2>
      <div style="margin-bottom: 20px;">
        <h3 style="margin: 0 0 10px 0; color: #1f2937;">${property.address}</h3>
        <p style="margin: 0; color: #6b7280;">${property.suburb}, ${property.state} ${property.postcode}</p>
      </div>
      <div class="grid three">
        <div class="metric">
          <div class="metric-label">Property Type</div>
          <div class="metric-value" style="font-size: 18px;">${property.propertyType}</div>
        </div>
        <div class="metric">
          <div class="metric-label">Year Built</div>
          <div class="metric-value" style="font-size: 18px;">${property.yearBuilt}</div>
        </div>
        <div class="metric">
          <div class="metric-label">Energy Rating</div>
          <div class="metric-value" style="font-size: 18px;">${property.energyRating}</div>
        </div>
      </div>
      <div class="grid three">
        <div class="metric">
          <div class="metric-label">Bedrooms</div>
          <div class="metric-value" style="font-size: 18px;">${property.bedrooms}</div>
        </div>
        <div class="metric">
          <div class="metric-label">Bathrooms</div>
          <div class="metric-value" style="font-size: 18px;">${property.bathrooms}</div>
        </div>
        <div class="metric">
          <div class="metric-label">Car Spaces</div>
          <div class="metric-value" style="font-size: 18px;">${property.carSpaces}</div>
        </div>
      </div>
    </div>

    <!-- Key Financial Metrics -->
    <div class="section">
      <h2>Key Financial Metrics</h2>
      <div class="key-metrics">
        <div class="key-metric-card">
          <div class="key-metric-label">Purchase Price</div>
          <div class="key-metric-value">${formatCurrency(property.price)}</div>
        </div>
        <div class="key-metric-card">
          <div class="key-metric-label">Gross Yield</div>
          <div class="key-metric-value">${formatPercent(analysis.grossYield)}</div>
        </div>
        <div class="key-metric-card">
          <div class="key-metric-label">5-Year ROI</div>
          <div class="key-metric-value">${formatPercent(analysis.roiYear5)}</div>
        </div>
        <div class="key-metric-card">
          <div class="key-metric-label">10-Year ROI</div>
          <div class="key-metric-value">${formatPercent(analysis.roiYear10)}</div>
        </div>
      </div>
    </div>

    <!-- Investment Analysis -->
    <div class="section">
      <h2>Investment Analysis</h2>
      <table class="summary-table">
        <tr>
          <td>Weekly Rental Income</td>
          <td>${formatCurrency(property.estimatedRentalValueWeekly)}</td>
        </tr>
        <tr>
          <td>Annual Rental Income</td>
          <td>${formatCurrency(analysis.annualRentalIncome)}</td>
        </tr>
        <tr>
          <td>Loan Amount (80% LVR)</td>
          <td>${formatCurrency(analysis.loanAmount)}</td>
        </tr>
        <tr>
          <td>Down Payment (20%)</td>
          <td>${formatCurrency(analysis.downPayment)}</td>
        </tr>
        <tr>
          <td>Monthly Mortgage</td>
          <td>${formatCurrency(analysis.monthlyMortgage)}</td>
        </tr>
        <tr>
          <td>Monthly Net Cash Flow</td>
          <td style="color: ${analysis.monthlyNetCashFlow > 0 ? "#059669" : "#dc2626"}">${formatCurrency(analysis.monthlyNetCashFlow)}</td>
        </tr>
        <tr>
          <td>Annual Net Cash Flow</td>
          <td style="color: ${analysis.annualNetCashFlow > 0 ? "#059669" : "#dc2626"}">${formatCurrency(analysis.annualNetCashFlow)}</td>
        </tr>
        <tr>
          <td>Debt Service Ratio</td>
          <td>${formatPercent(analysis.debtServiceRatio * 100)}</td>
        </tr>
      </table>
    </div>

    <!-- Expense Breakdown -->
    <div class="section">
      <h2>Annual Expense Breakdown</h2>
      <table class="summary-table">
        <tr>
          <td>Mortgage Payments</td>
          <td>${formatCurrency(analysis.monthlyMortgage * 12)}</td>
        </tr>
        <tr>
          <td>Maintenance & Repairs</td>
          <td>${formatCurrency(analysis.annualMaintenanceCost)}</td>
        </tr>
        <tr>
          <td>Council Rates</td>
          <td>${formatCurrency(analysis.annualRates)}</td>
        </tr>
        <tr>
          <td>Insurance</td>
          <td>${formatCurrency(analysis.annualInsurance)}</td>
        </tr>
        <tr>
          <td>Body Corporate</td>
          <td>${formatCurrency(analysis.annualBodyCorp)}</td>
        </tr>
        <tr style="background: #f0fdf4; font-weight: bold;">
          <td>Total Annual Expenses</td>
          <td>${formatCurrency(
            analysis.monthlyMortgage * 12 +
              analysis.annualMaintenanceCost +
              analysis.annualRates +
              analysis.annualInsurance +
              analysis.annualBodyCorp,
          )}</td>
        </tr>
      </table>
    </div>

    <!-- Long-term Projections -->
    <div class="section">
      <h2>Long-term Value Projections</h2>
      <table class="summary-table">
        <thead>
          <tr>
            <th>Period</th>
            <th>Projected Value</th>
            <th>Capital Gain</th>
            <th>Total ROI</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>5 Years</td>
            <td>${formatCurrency(analysis.projectedValueYear5)}</td>
            <td>${formatCurrency(analysis.capitalGainYear5)}</td>
            <td>${formatPercent(analysis.roiYear5)}</td>
          </tr>
          <tr>
            <td>10 Years</td>
            <td>${formatCurrency(analysis.projectedValueYear10)}</td>
            <td>${formatCurrency(analysis.capitalGainYear10)}</td>
            <td>${formatPercent(analysis.roiYear10)}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Footer -->
    <div class="footer">
      <p>This report is generated by Real Estate Matcher and contains projections based on current market data and assumptions. Past performance does not guarantee future results. Please consult with a qualified financial advisor before making investment decisions.</p>
    </div>
  </div>
</body>
</html>
  `
}

export function generateCSVReport(data: ReportData): string {
  const { clientName, clientEmail, clientSalary, clientBudget, property, analysis, generatedDate } = data

  const lines = [
    "Investment Property Analysis Report",
    `Generated: ${generatedDate}`,
    "",
    "CLIENT INFORMATION",
    `Client Name,${clientName}`,
    `Client Email,${clientEmail}`,
    `Annual Salary,${clientSalary}`,
    `Investment Budget,${clientBudget}`,
    "",
    "PROPERTY DETAILS",
    `Address,${property.address}`,
    `Suburb,${property.suburb}`,
    `State,${property.state}`,
    `Postcode,${property.postcode}`,
    `Property Type,${property.propertyType}`,
    `Year Built,${property.yearBuilt}`,
    `Bedrooms,${property.bedrooms}`,
    `Bathrooms,${property.bathrooms}`,
    `Car Spaces,${property.carSpaces}`,
    "",
    "FINANCIAL METRICS",
    `Purchase Price,${analysis.purchasePrice}`,
    `Weekly Rental Income,${property.estimatedRentalValueWeekly}`,
    `Annual Rental Income,${analysis.annualRentalIncome}`,
    `Gross Yield %,${analysis.grossYield}`,
    `Monthly Mortgage,${analysis.monthlyMortgage}`,
    `Monthly Net Cash Flow,${analysis.monthlyNetCashFlow}`,
    `Annual Net Cash Flow,${analysis.annualNetCashFlow}`,
    "",
    "EXPENSE BREAKDOWN",
    `Mortgage (Annual),${analysis.monthlyMortgage * 12}`,
    `Maintenance,${analysis.annualMaintenanceCost}`,
    `Rates,${analysis.annualRates}`,
    `Insurance,${analysis.annualInsurance}`,
    `Body Corp,${analysis.annualBodyCorp}`,
    "",
    "PROJECTIONS",
    `5-Year Value,${analysis.projectedValueYear5}`,
    `5-Year Capital Gain,${analysis.capitalGainYear5}`,
    `5-Year ROI %,${analysis.roiYear5}`,
    `10-Year Value,${analysis.projectedValueYear10}`,
    `10-Year Capital Gain,${analysis.capitalGainYear10}`,
    `10-Year ROI %,${analysis.roiYear10}`,
  ]

  return lines.join("\n")
}
