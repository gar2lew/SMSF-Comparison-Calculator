import type { Projection, Scenario, Client, OrganisationSettings, CalculationResult, ReportData, YearlyComparisonRow } from './types'

export function generateReportData(
  projection: Projection,
  scenarioA: Scenario,
  scenarioB: Scenario,
  resultA: CalculationResult,
  resultB: CalculationResult,
  client: Client,
  settings: OrganisationSettings,
  adviserName: string,
): ReportData {
  const years = Math.min(scenarioA.projectionYears, scenarioB.projectionYears)

  const yearlyComparisonRows: YearlyComparisonRow[] = []
  for (let y = 0; y <= years; y++) {
    const da = resultA.yearlyData[y]
    const db = resultB.yearlyData[y]
    if (!da || !db) continue
    yearlyComparisonRows.push({
      year: y === 0 ? 'Start' : `Year ${y}`,
      balanceA: da.balance,
      balanceB: db.balance,
      diff: db.balance - da.balance,
      empContribA: da.employerContribution,
      empContribB: db.employerContribution,
    })
  }

  const winner =
    resultA.finalBalance === resultB.finalBalance
      ? 'tie'
      : resultA.finalBalance > resultB.finalBalance
        ? 'a'
        : 'b'

  return {
    generatedAt: new Date().toISOString(),
    firmName: settings.logoUrl ? null : settings.logoUrl,
    primaryColor: settings.primaryColor,
    logoUrl: settings.logoUrl,
    disclaimerText: settings.disclaimerText,
    clientName: `${client.firstName} ${client.lastName}`,
    adviserName,
    projectionName: projection.name,
    scenarioA: {
      name: scenarioA.name,
      fundType: scenarioA.fundType,
      currentBalance: scenarioA.currentBalance,
      salary: scenarioA.salary,
      employerRate: scenarioA.employerRate,
      growthRate: scenarioA.growthRate,
      projectionYears: scenarioA.projectionYears,
      salarySacrificeEnabled: scenarioA.salarySacrificeEnabled,
      salarySacrificePercent: scenarioA.salarySacrificePercent,
      resultFinalBalance: resultA.finalBalance,
      resultGrowthAmount: resultA.growthAmount,
      resultGrowthPercent: resultA.growthPercent,
      resultYearlyData: resultA.yearlyData,
    },
    scenarioB: {
      name: scenarioB.name,
      fundType: scenarioB.fundType,
      currentBalance: scenarioB.currentBalance,
      salary: scenarioB.salary,
      employerRate: scenarioB.employerRate,
      growthRate: scenarioB.growthRate,
      projectionYears: scenarioB.projectionYears,
      salarySacrificeEnabled: scenarioB.salarySacrificeEnabled,
      salarySacrificePercent: scenarioB.salarySacrificePercent,
      resultFinalBalance: resultB.finalBalance,
      resultGrowthAmount: resultB.growthAmount,
      resultGrowthPercent: resultB.growthPercent,
      resultYearlyData: resultB.yearlyData,
    },
    winner,
    deltaFinal: resultB.finalBalance - resultA.finalBalance,
    deltaGrowthPct: resultB.growthPercent - resultA.growthPercent,
    yearsCompared: years,
    yearlyComparisonRows,
    notes: projection.notes,
  }
}
