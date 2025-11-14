export interface PropertyAnalysis {
  propertyId: string
  purchasePrice: number
  loanAmount: number
  loanRate: number
  loanPeriod: number
  annualRentalIncome: number
  annualMaintenanceCost: number
  annualRates: number
  annualInsurance: number
  annualBodyCorp: number
  appreciationRate: number

  // Calculated metrics
  downPayment: number
  monthlyMortgage: number
  monthlyNetCashFlow: number
  annualNetCashFlow: number
  grossRent: number
  grossYield: number
  netYield: number
  breakEvenMonths: number
  breakEvenYears: number
  projectedValueYear5: number
  projectedValueYear10: number
  capitalGainYear5: number
  capitalGainYear10: number
  roiYear5: number
  roiYear10: number
  debtServiceRatio: number
  investmentScore: number
}

export function calculateInvestmentAnalysis(
  purchasePrice: number,
  weeklyRent: number,
  maintenanceCost: number,
  loanRate = 0.07,
  loanPeriod = 30,
  appreciationRate = 0.04,
  loanToValueRatio = 0.8,
): PropertyAnalysis {
  // Basic calculations
  const loanAmount = purchasePrice * loanToValueRatio
  const downPayment = purchasePrice - loanAmount
  const annualRentalIncome = weeklyRent * 52

  // Assumed costs (percentage of price or fixed estimates)
  const annualRates = purchasePrice * 0.004
  const annualInsurance = purchasePrice * 0.005
  const annualBodyCorp = purchasePrice * 0.008

  // Monthly mortgage calculation (fixed rate)
  const monthlyRate = loanRate / 12
  const numberOfPayments = loanPeriod * 12
  const monthlyMortgage =
    (loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments))) /
    (Math.pow(1 + monthlyRate, numberOfPayments) - 1)

  // Cash flows
  const monthlyRentalIncome = annualRentalIncome / 12
  const monthlyExpenses = (maintenanceCost + annualRates + annualInsurance + annualBodyCorp) / 12 + monthlyMortgage
  const monthlyNetCashFlow = monthlyRentalIncome - monthlyExpenses
  const annualNetCashFlow = monthlyNetCashFlow * 12

  // Yields
  const grossRent = annualRentalIncome / purchasePrice
  const grossYield = grossRent * 100
  const netYield = (annualNetCashFlow / downPayment) * 100

  // Break-even analysis
  const totalAnnualExpenses = maintenanceCost + annualRates + annualInsurance + annualBodyCorp + monthlyMortgage * 12
  const breakEvenMonths =
    annualRentalIncome > totalAnnualExpenses
      ? 0
      : Math.ceil((totalAnnualExpenses - annualRentalIncome) / (annualRentalIncome / 12))
  const breakEvenYears = breakEvenMonths / 12

  // Appreciation projections
  const projectedValueYear5 = purchasePrice * Math.pow(1 + appreciationRate, 5)
  const projectedValueYear10 = purchasePrice * Math.pow(1 + appreciationRate, 10)

  const capitalGainYear5 = projectedValueYear5 - purchasePrice
  const capitalGainYear10 = projectedValueYear10 - purchasePrice

  // ROI calculations
  const remainingLoanYear5 = calculateRemainingLoan(loanAmount, monthlyRate, numberOfPayments, 5 * 12)
  const totalReturnYear5 = capitalGainYear5 + annualNetCashFlow * 5 + (loanAmount - remainingLoanYear5)
  const roiYear5 = (totalReturnYear5 / downPayment) * 100

  const remainingLoanYear10 = calculateRemainingLoan(loanAmount, monthlyRate, numberOfPayments, 10 * 12)
  const totalReturnYear10 = capitalGainYear10 + annualNetCashFlow * 10 + (loanAmount - remainingLoanYear10)
  const roiYear10 = (totalReturnYear10 / downPayment) * 100

  // Debt service ratio
  const debtServiceRatio = (monthlyMortgage * 12) / annualRentalIncome

  // Investment score (0-100)
  let investmentScore = 50
  if (grossYield > 5) investmentScore += 15
  else if (grossYield > 4) investmentScore += 10
  else if (grossYield > 3) investmentScore += 5

  if (roiYear5 > 25) investmentScore += 15
  else if (roiYear5 > 15) investmentScore += 10
  else if (roiYear5 > 10) investmentScore += 5

  if (debtServiceRatio < 0.5) investmentScore += 10
  else if (debtServiceRatio < 0.6) investmentScore += 5

  if (monthlyNetCashFlow > 0) investmentScore += 10
  else if (monthlyNetCashFlow > -200) investmentScore += 5

  investmentScore = Math.min(investmentScore, 100)

  return {
    propertyId: "",
    purchasePrice,
    loanAmount,
    loanRate,
    loanPeriod,
    annualRentalIncome,
    annualMaintenanceCost: maintenanceCost,
    annualRates,
    annualInsurance,
    annualBodyCorp,
    appreciationRate,
    downPayment,
    monthlyMortgage,
    monthlyNetCashFlow,
    annualNetCashFlow,
    grossRent,
    grossYield,
    netYield,
    breakEvenMonths,
    breakEvenYears,
    projectedValueYear5,
    projectedValueYear10,
    capitalGainYear5,
    capitalGainYear10,
    roiYear5,
    roiYear10,
    debtServiceRatio,
    investmentScore,
  }
}

function calculateRemainingLoan(
  initialLoan: number,
  monthlyRate: number,
  numberOfPayments: number,
  paymentsToDate: number,
): number {
  const monthlyPayment =
    (initialLoan * (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments))) /
    (Math.pow(1 + monthlyRate, numberOfPayments) - 1)
  const remainingPayments = numberOfPayments - paymentsToDate
  return (
    (monthlyPayment * (Math.pow(1 + monthlyRate, remainingPayments) - 1)) /
    (monthlyRate * Math.pow(1 + monthlyRate, remainingPayments))
  )
}
