import type { ScenarioInput, YearlyDataPoint, CalculationResult, Scenario } from './types'

function clamp(v: number, min: number, max: number): number {
  return Math.min(Math.max(v, min), max)
}

export function projectYearlySeries(input: ScenarioInput): CalculationResult {
  const { currentBalance, salary, employerRate, growthRate, projectionYears } = input

  const ssRate = input.salarySacrificeEnabled
    ? clamp((input.salarySacrificePercent || 0) / 100, 0, 1)
    : 0

  const employerContrib = salary * employerRate
  const ssContrib = salary * ssRate
  const totalAnnualContrib = employerContrib + ssContrib

  let bal = currentBalance
  let runningEmp = 0
  let runningSS = 0

  const yearlyData: YearlyDataPoint[] = [
    {
      year: 0,
      balance: bal,
      employerContribution: 0,
      totalEmployerContributions: 0,
      salarySacrificeContribution: 0,
      totalSalarySacrificeContributions: 0,
    },
  ]

  for (let y = 1; y <= projectionYears; y++) {
    bal += totalAnnualContrib
    bal = bal * (1 + growthRate)

    runningEmp += employerContrib
    runningSS += ssContrib

    yearlyData.push({
      year: y,
      balance: bal,
      employerContribution: employerContrib,
      totalEmployerContributions: runningEmp,
      salarySacrificeContribution: ssContrib,
      totalSalarySacrificeContributions: runningSS,
    })
  }

  const finalBalance = bal
  const growthAmount = finalBalance - currentBalance
  const growthPercent = currentBalance > 0 ? (growthAmount / currentBalance) * 100 : 0

  return {
    input,
    finalBalance,
    growthAmount,
    growthPercent,
    totalAnnualContribution: totalAnnualContrib,
    yearlyData,
  }
}

export function scenarioToInput(scenario: Scenario): ScenarioInput {
  return {
    currentBalance: scenario.currentBalance,
    salary: scenario.salary,
    employerRate: scenario.employerRate,
    growthRate: scenario.growthRate,
    projectionYears: scenario.projectionYears,
    salarySacrificeEnabled: scenario.salarySacrificeEnabled,
    salarySacrificePercent: scenario.salarySacrificePercent,
    fundType: scenario.fundType,
  }
}
