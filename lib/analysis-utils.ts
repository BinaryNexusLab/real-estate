export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

export function formatPercent(value: number, decimals = 2): string {
  return `${value.toFixed(decimals)}%`
}

export function getInvestmentRating(score: number): { label: string; color: string } {
  if (score >= 80) return { label: "Excellent", color: "text-green-600" }
  if (score >= 65) return { label: "Very Good", color: "text-green-500" }
  if (score >= 50) return { label: "Good", color: "text-blue-500" }
  if (score >= 35) return { label: "Fair", color: "text-yellow-600" }
  return { label: "Poor", color: "text-red-600" }
}

export function getYieldRating(yield_: number): string {
  if (yield_ >= 6) return "Excellent"
  if (yield_ >= 5) return "Very Good"
  if (yield_ >= 4) return "Good"
  if (yield_ >= 3) return "Fair"
  return "Below Average"
}
