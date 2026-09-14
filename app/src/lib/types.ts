export interface Profile {
  id: string
  organisationId: string
  email: string
  fullName: string
  phone: string | null
  role: 'admin' | 'adviser'
  createdAt: string
  updatedAt: string
  schemaVersion: number
}

export type ClientStatus = 'active' | 'archived' | 'lead'

export interface Client {
  id: string
  organisationId: string
  ownerUserId: string
  firstName: string
  lastName: string
  email: string | null
  phone: string | null
  dateOfBirth: string | null
  status: ClientStatus
  notes: string | null
  createdAt: string
  updatedAt: string
  schemaVersion: number
}

export type ProjectionStatus = 'draft' | 'active' | 'archived'

export interface Projection {
  id: string
  organisationId: string
  clientId: string
  ownerUserId: string
  name: string
  status: ProjectionStatus
  shared: boolean
  presented: boolean
  notes: string | null
  createdAt: string
  updatedAt: string
  archivedAt: string | null
  schemaVersion: number
}

export type FundType = 'current' | 'smsf'
export type ScenarioStatus = 'active' | 'archived'

export interface YearlyDataPoint {
  year: number
  balance: number
  employerContribution: number
  totalEmployerContributions: number
  salarySacrificeContribution: number
  totalSalarySacrificeContributions: number
}

export interface Scenario {
  id: string
  organisationId: string
  projectionId: string
  displayOrder: number
  name: string
  fundType: FundType
  currentBalance: number
  salary: number
  employerRate: number
  growthRate: number
  projectionYears: number
  salarySacrificeEnabled: boolean
  salarySacrificePercent: number
  status: ScenarioStatus
  resultFinalBalance: number | null
  resultGrowthAmount: number | null
  resultGrowthPercent: number | null
  resultYearlyData: YearlyDataPoint[] | null
  resultComputedAt: string | null
  createdAt: string
  updatedAt: string
  schemaVersion: number
}

export type NoteType = 'adviser' | 'client' | 'internal'
export type NoteEntityType = 'client' | 'projection'

export interface Note {
  id: string
  organisationId: string
  entityType: NoteEntityType
  entityId: string
  ownerUserId: string
  noteType: NoteType
  content: string
  createdAt: string
  updatedAt: string
  schemaVersion: number
}

export type ActivityType =
  | 'created'
  | 'updated'
  | 'shared'
  | 'exported'
  | 'presented'
  | 'archived'
  | 'duplicated'
  | 'scenario_added'
  | 'note_added'

export type ActivityEntityType = 'client' | 'projection'

export interface ActivityLog {
  id: string
  organisationId: string
  entityType: ActivityEntityType
  entityId: string
  ownerUserId: string
  activityType: ActivityType
  description: string | null
  metadata: Record<string, unknown> | null
  createdAt: string
  schemaVersion: number
}

export type ReportType = 'client_summary' | 'projection' | 'comparison' | 'scenario'
export type ReportStatus = 'pending' | 'generating' | 'generated' | 'failed'

export interface Report {
  id: string
  organisationId: string
  projectionId: string
  ownerUserId: string
  reportType: ReportType
  filePath: string | null
  fileName: string | null
  fileSize: number | null
  status: ReportStatus
  errorMessage: string | null
  createdAt: string
  schemaVersion: number
}

export interface Organisation {
  id: string
  name: string
  createdAt: string
}

export interface OrganisationSettings {
  logoUrl: string | null
  primaryColor: string
  disclaimerText: string
  schemaVersion: number
}

export interface ScenarioInput {
  currentBalance: number
  salary: number
  employerRate: number
  growthRate: number
  projectionYears: number
  salarySacrificeEnabled: boolean
  salarySacrificePercent: number
  fundType: FundType
}

export interface CalculationResult {
  input: ScenarioInput
  finalBalance: number
  growthAmount: number
  growthPercent: number
  totalAnnualContribution: number
  yearlyData: YearlyDataPoint[]
}

export interface ComparisonResult {
  scenarioA: { scenario: Scenario; result: CalculationResult }
  scenarioB: { scenario: Scenario; result: CalculationResult }
  winner: 'a' | 'b' | 'tie'
  deltaFinal: number
  deltaGrowthPct: number
  yearsCompared: number
}

export interface ComparisonState {
  current: ScenarioInput
  smsf: ScenarioInput
}

export interface ComparisonOutcome {
  current: CalculationResult
  smsf: CalculationResult
  winner: 'current' | 'smsf' | 'tie'
  deltaFinal: number
  deltaGrowthPct: number
  yearsCompared: number
}

export interface YearlyComparisonRow {
  year: string
  balanceA: number
  balanceB: number
  diff: number
  empContribA: number
  empContribB: number
}

export interface ReportData {
  generatedAt: string
  firmName: string | null
  primaryColor: string
  logoUrl: string | null
  disclaimerText: string
  clientName: string
  adviserName: string
  projectionName: string
  scenarioA: {
    name: string
    fundType: string
    currentBalance: number
    salary: number
    employerRate: number
    growthRate: number
    projectionYears: number
    salarySacrificeEnabled: boolean
    salarySacrificePercent: number
    resultFinalBalance: number
    resultGrowthAmount: number
    resultGrowthPercent: number
    resultYearlyData: YearlyDataPoint[]
  }
  scenarioB: {
    name: string
    fundType: string
    currentBalance: number
    salary: number
    employerRate: number
    growthRate: number
    projectionYears: number
    salarySacrificeEnabled: boolean
    salarySacrificePercent: number
    resultFinalBalance: number
    resultGrowthAmount: number
    resultGrowthPercent: number
    resultYearlyData: YearlyDataPoint[]
  }
  winner: 'a' | 'b' | 'tie'
  deltaFinal: number
  deltaGrowthPct: number
  yearsCompared: number
  yearlyComparisonRows: YearlyComparisonRow[]
  notes: string | null
}
