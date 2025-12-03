export interface PropertyAnalysis {
  propertyId: string;
  purchasePrice: number;
  loanAmount: number;
  loanRate: number;
  loanPeriod: number;
  annualRentalIncome: number;
  annualMaintenanceCost: number;
  annualRates: number;
  annualInsurance: number;
  annualBodyCorp: number;
  appreciationRate: number;

  // Document-style fields (interest-only snapshot)
  annualInterest?: number;
  totalOutgoings?: number;
  totalAnnualCost?: number;
  totalOffsets?: number;
  annualNetCashflowDoc?: number; // rent + tax - (interest + outgoings)

  // Calculated metrics
  downPayment: number;
  monthlyMortgage: number;
  monthlyPrincipal: number; // NEW: Principal portion of monthly payment
  monthlyInterest: number; // NEW: Interest portion of monthly payment
  annualPrincipalPayment: number; // NEW: Total principal paid per year
  annualInterestPayment: number; // NEW: Total interest paid per year
  monthlyNetCashFlow: number;
  annualNetCashFlow: number;
  grossRent: number;
  grossYield: number;
  netYield: number;
  breakEvenMonths: number;
  breakEvenYears: number;
  projectedValueYear5: number;
  projectedValueYear10: number;
  capitalGainYear5: number;
  capitalGainYear10: number;
  roiYear5: number;
  roiYear10: number;
  debtServiceRatio: number;
  investmentScore: number;
}

export function calculateInvestmentAnalysis(
  purchasePrice: number,
  weeklyRent: number,
  maintenanceCost: number,
  loanRate = 0.06,
  loanPeriod = 30,
  appreciationRate = 0.04,
  loanToValueRatio = 0.8,
  // New optional parameters to support doc-style calculation
  taxRefund = 0,
  interestOnly = false,
  outgoingsParam?: {
    council?: number;
    strata?: number;
    water?: number;
    other?: number;
  }
): PropertyAnalysis {
  // Basic calculations
  const loanAmount = purchasePrice * loanToValueRatio;
  const downPayment = purchasePrice - loanAmount;
  const annualRentalIncome = weeklyRent * 52;

  // Assumed costs (percentage of price or fixed estimates)
  // If explicit outgoings are provided, use them; otherwise fallback to percentage estimates.
  const annualRates =
    outgoingsParam && outgoingsParam.council !== undefined
      ? outgoingsParam.council
      : purchasePrice * 0.004;
  const annualInsurance = purchasePrice * 0.005; // keep insurance as percentage fallback
  const annualBodyCorp =
    outgoingsParam && outgoingsParam.strata !== undefined
      ? outgoingsParam.strata
      : purchasePrice * 0.008;
  const annualWater =
    outgoingsParam && outgoingsParam.water !== undefined
      ? outgoingsParam.water
      : 0;
  const otherOutgoings =
    outgoingsParam && outgoingsParam.other !== undefined
      ? outgoingsParam.other
      : 0;

  // Monthly mortgage calculation (fixed rate)
  const monthlyRate = loanRate / 12;
  const numberOfPayments = loanPeriod * 12;
  // If interestOnly is true, monthly payment is interest-only (annualInterest / 12)
  const annualInterest = loanAmount * loanRate;
  let monthlyMortgage: number;
  if (interestOnly) {
    monthlyMortgage = annualInterest / 12;
  } else {
    monthlyMortgage =
      (loanAmount *
        (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments))) /
      (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
  }

  // Cash flows
  const monthlyRentalIncome = annualRentalIncome / 12;

  // Calculate principal and interest breakdown for first month
  // (In reality, this changes each month as principal is paid down)
  const monthlyInterestPayment = (loanAmount * loanRate) / 12;
  const monthlyPrincipalPayment = monthlyMortgage - monthlyInterestPayment;
  const annualInterestPayment = monthlyInterestPayment * 12;
  const annualPrincipalPayment = monthlyPrincipalPayment * 12;

  const monthlyExpenses =
    (maintenanceCost +
      annualRates +
      annualInsurance +
      annualBodyCorp +
      annualWater +
      otherOutgoings) /
      12 +
    monthlyMortgage;
  const monthlyNetCashFlow = monthlyRentalIncome - monthlyExpenses;
  const annualNetCashFlow = monthlyNetCashFlow * 12;

  // Yields
  const grossRent = annualRentalIncome / purchasePrice;
  const grossYield = grossRent * 100;
  // Prevent Infinity: if downPayment is 0 or too small, use a fallback calculation
  const netYield =
    downPayment > 0 ? (annualNetCashFlow / downPayment) * 100 : 0;

  // Break-even analysis
  const totalAnnualExpenses =
    maintenanceCost +
    annualRates +
    annualInsurance +
    annualBodyCorp +
    annualWater +
    otherOutgoings +
    monthlyMortgage * 12;
  const breakEvenMonths =
    annualRentalIncome > totalAnnualExpenses
      ? 0
      : annualRentalIncome > 0
      ? Math.ceil(
          (totalAnnualExpenses - annualRentalIncome) / (annualRentalIncome / 12)
        )
      : 999;
  const breakEvenYears = breakEvenMonths / 12;

  // Appreciation projections
  const projectedValueYear5 = purchasePrice * Math.pow(1 + appreciationRate, 5);
  const projectedValueYear10 =
    purchasePrice * Math.pow(1 + appreciationRate, 10);

  const capitalGainYear5 = projectedValueYear5 - purchasePrice;
  const capitalGainYear10 = projectedValueYear10 - purchasePrice;

  // ROI calculations
  const remainingLoanYear5 = calculateRemainingLoan(
    loanAmount,
    monthlyRate,
    numberOfPayments,
    5 * 12
  );
  const totalReturnYear5 =
    capitalGainYear5 +
    annualNetCashFlow * 5 +
    (loanAmount - remainingLoanYear5);
  const roiYear5 = downPayment > 0 ? (totalReturnYear5 / downPayment) * 100 : 0;

  const remainingLoanYear10 = calculateRemainingLoan(
    loanAmount,
    monthlyRate,
    numberOfPayments,
    10 * 12
  );
  const totalReturnYear10 =
    capitalGainYear10 +
    annualNetCashFlow * 10 +
    (loanAmount - remainingLoanYear10);
  const roiYear10 =
    downPayment > 0 ? (totalReturnYear10 / downPayment) * 100 : 0;

  // Debt service ratio - prevent Infinity
  const debtServiceRatio =
    annualRentalIncome > 0 ? (monthlyMortgage * 12) / annualRentalIncome : 999;

  // Document-style snapshot calculations (matches Formula Explanation.docx.txt)
  const totalOutgoings =
    annualRates + annualBodyCorp + annualWater + otherOutgoings;
  const totalAnnualCost = annualInterest + totalOutgoings;
  const totalOffsets = annualRentalIncome + taxRefund;
  const annualNetCashflowDoc = totalOffsets - totalAnnualCost; // positive means cashflow positive

  // Investment score (0-100)
  let investmentScore = 50;
  if (grossYield > 5) investmentScore += 15;
  else if (grossYield > 4) investmentScore += 10;
  else if (grossYield > 3) investmentScore += 5;

  if (roiYear5 > 25) investmentScore += 15;
  else if (roiYear5 > 15) investmentScore += 10;
  else if (roiYear5 > 10) investmentScore += 5;

  if (debtServiceRatio < 0.5) investmentScore += 10;
  else if (debtServiceRatio < 0.6) investmentScore += 5;

  if (monthlyNetCashFlow > 0) investmentScore += 10;
  else if (monthlyNetCashFlow > -200) investmentScore += 5;

  // Reward near break-even (small annual out-of-pocket) as in document example
  if (annualNetCashflowDoc >= 0) investmentScore += 8;
  else if (annualNetCashflowDoc > -2000) investmentScore += 4;

  investmentScore = Math.min(investmentScore, 100);

  return {
    propertyId: '',
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
    // doc-style fields
    annualInterest,
    totalOutgoings,
    totalAnnualCost,
    totalOffsets,
    annualNetCashflowDoc,
    downPayment,
    monthlyMortgage,
    monthlyPrincipal: monthlyPrincipalPayment,
    monthlyInterest: monthlyInterestPayment,
    annualPrincipalPayment,
    annualInterestPayment,
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
  };
}

export function calculateRemainingLoan(
  initialLoan: number,
  monthlyRate: number,
  numberOfPayments: number,
  paymentsToDate: number
): number {
  const monthlyPayment =
    (initialLoan *
      (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments))) /
    (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
  const remainingPayments = numberOfPayments - paymentsToDate;
  return (
    (monthlyPayment * (Math.pow(1 + monthlyRate, remainingPayments) - 1)) /
    (monthlyRate * Math.pow(1 + monthlyRate, remainingPayments))
  );
}
