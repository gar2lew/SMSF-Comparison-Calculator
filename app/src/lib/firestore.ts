import {
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  collection,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  type QueryConstraint,
  type DocumentData,
} from 'firebase/firestore/lite'
import { db } from './firebase'
import type {
  Profile,
  Client,
  Projection,
  Scenario,
  Note,
  ActivityLog,
  Report,
  Organisation,
  OrganisationSettings,
} from './types'

const CURRENT_SCHEMA_VERSION = 1

function hydrate<T extends { id?: string; schemaVersion?: number }>(
  docId: string,
  data: DocumentData,
): T {
  const obj = { id: docId, ...data } as unknown as T
  if (!obj.schemaVersion) obj.schemaVersion = CURRENT_SCHEMA_VERSION
  return obj
}

function stamp() {
  return serverTimestamp() as unknown as string
}

// ---------------------------------------------------------------------------
// Profiles (users collection)
// ---------------------------------------------------------------------------
const usersCol = collection(db, 'users')

export async function getProfile(uid: string): Promise<Profile | null> {
  const snap = await getDoc(doc(usersCol, uid))
  if (!snap.exists()) return null
  return hydrate<Profile>(snap.id, snap.data())
}

// ---------------------------------------------------------------------------
// Clients
// ---------------------------------------------------------------------------
const clientsCol = collection(db, 'clients')

export async function getClient(id: string): Promise<Client | null> {
  const snap = await getDoc(doc(clientsCol, id))
  if (!snap.exists()) return null
  return hydrate<Client>(snap.id, snap.data())
}

export async function listClients(
  orgId: string,
  opts?: { status?: string; ownerUserId?: string; search?: string },
): Promise<Client[]> {
  const constraints: QueryConstraint[] = [
    where('organisationId', '==', orgId),
    orderBy('updatedAt', 'desc'),
  ]
  if (opts?.status) constraints.push(where('status', '==', opts.status))
  if (opts?.ownerUserId) constraints.push(where('ownerUserId', '==', opts.ownerUserId))

  const snap = await getDocs(query(clientsCol, ...constraints))
  let results = snap.docs.map((d) => hydrate<Client>(d.id, d.data()))

  if (opts?.search) {
    const term = opts.search.toLowerCase()
    results = results.filter(
      (c) =>
        c.firstName.toLowerCase().includes(term) ||
        c.lastName.toLowerCase().includes(term),
    )
  }

  return results
}

export async function createClient(data: {
  organisationId: string
  ownerUserId: string
  firstName: string
  lastName: string
  email?: string | null
  phone?: string | null
  status?: string
}): Promise<Client | null> {
  const ref = await addDoc(clientsCol, {
    ...data,
    dateOfBirth: null,
    status: data.status || 'active',
    notes: null,
    schemaVersion: CURRENT_SCHEMA_VERSION,
    createdAt: stamp(),
    updatedAt: stamp(),
  })
  const snap = await getDoc(ref)
  return snap.exists() ? hydrate<Client>(snap.id, snap.data()) : null
}

export async function updateClient(
  id: string,
  data: Partial<Pick<Client, 'firstName' | 'lastName' | 'email' | 'phone' | 'dateOfBirth' | 'status' | 'notes'>>,
): Promise<void> {
  await updateDoc(doc(clientsCol, id), { ...data, updatedAt: stamp() })
}

// ---------------------------------------------------------------------------
// Projections
// ---------------------------------------------------------------------------
const projectionsCol = collection(db, 'projections')

export async function getProjection(id: string): Promise<Projection | null> {
  const snap = await getDoc(doc(projectionsCol, id))
  if (!snap.exists()) return null
  return hydrate<Projection>(snap.id, snap.data())
}

export async function listProjections(
  orgId: string,
  opts?: { clientId?: string; ownerUserId?: string; status?: string },
): Promise<Projection[]> {
  const constraints: QueryConstraint[] = [
    where('organisationId', '==', orgId),
    orderBy('updatedAt', 'desc'),
  ]
  if (opts?.clientId) constraints.push(where('clientId', '==', opts.clientId))
  if (opts?.ownerUserId) constraints.push(where('ownerUserId', '==', opts.ownerUserId))
  if (opts?.status) constraints.push(where('status', '==', opts.status))

  const snap = await getDocs(query(projectionsCol, ...constraints))
  return snap.docs.map((d) => hydrate<Projection>(d.id, d.data()))
}

export async function createProjection(data: {
  organisationId: string
  clientId: string
  ownerUserId: string
  name: string
}): Promise<Projection | null> {
  const ref = await addDoc(projectionsCol, {
    ...data,
    status: 'draft',
    shared: false,
    presented: false,
    notes: null,
    archivedAt: null,
    schemaVersion: CURRENT_SCHEMA_VERSION,
    createdAt: stamp(),
    updatedAt: stamp(),
  })
  const snap = await getDoc(ref)
  return snap.exists() ? hydrate<Projection>(snap.id, snap.data()) : null
}

export async function updateProjection(
  id: string,
  data: Partial<Pick<Projection, 'name' | 'status' | 'shared' | 'presented' | 'notes' | 'archivedAt'>>,
): Promise<void> {
  await updateDoc(doc(projectionsCol, id), { ...data, updatedAt: stamp() })
}

export async function deleteProjection(id: string): Promise<void> {
  await deleteDoc(doc(projectionsCol, id))
}

// ---------------------------------------------------------------------------
// Scenarios
// ---------------------------------------------------------------------------
const scenariosCol = collection(db, 'scenarios')

export async function getScenario(id: string): Promise<Scenario | null> {
  const snap = await getDoc(doc(scenariosCol, id))
  if (!snap.exists()) return null
  return hydrate<Scenario>(snap.id, snap.data())
}

export async function listScenarios(
  orgId: string,
  projectionId: string,
): Promise<Scenario[]> {
  const snap = await getDocs(
    query(
      scenariosCol,
      where('organisationId', '==', orgId),
      where('projectionId', '==', projectionId),
      where('status', '==', 'active'),
      orderBy('displayOrder'),
    ),
  )
  return snap.docs.map((d) => hydrate<Scenario>(d.id, d.data()))
}

export async function createScenario(data: {
  organisationId: string
  projectionId: string
  displayOrder: number
  name: string
  fundType: string
  currentBalance: number
  salary: number
  employerRate: number
  growthRate: number
  projectionYears: number
  salarySacrificeEnabled: boolean
  salarySacrificePercent: number
}): Promise<Scenario | null> {
  const ref = await addDoc(scenariosCol, {
    ...data,
    status: 'active',
    resultFinalBalance: null,
    resultGrowthAmount: null,
    resultGrowthPercent: null,
    resultYearlyData: null,
    resultComputedAt: null,
    schemaVersion: CURRENT_SCHEMA_VERSION,
    createdAt: stamp(),
    updatedAt: stamp(),
  })
  const snap = await getDoc(ref)
  return snap.exists() ? hydrate<Scenario>(snap.id, snap.data()) : null
}

export async function updateScenario(
  id: string,
  data: Partial<
    Pick<
      Scenario,
      | 'name'
      | 'fundType'
      | 'currentBalance'
      | 'salary'
      | 'employerRate'
      | 'growthRate'
      | 'projectionYears'
      | 'salarySacrificeEnabled'
      | 'salarySacrificePercent'
      | 'displayOrder'
      | 'status'
      | 'resultFinalBalance'
      | 'resultGrowthAmount'
      | 'resultGrowthPercent'
      | 'resultYearlyData'
      | 'resultComputedAt'
    >
  >,
): Promise<void> {
  await updateDoc(doc(scenariosCol, id), { ...data, updatedAt: stamp() })
}

export async function archiveScenario(id: string): Promise<void> {
  await updateDoc(doc(scenariosCol, id), { status: 'archived', updatedAt: stamp() })
}

// ---------------------------------------------------------------------------
// Notes
// ---------------------------------------------------------------------------
const notesCol = collection(db, 'notes')

export async function listNotes(
  orgId: string,
  entityType: string,
  entityId: string,
): Promise<Note[]> {
  const snap = await getDocs(
    query(
      notesCol,
      where('organisationId', '==', orgId),
      where('entityType', '==', entityType),
      where('entityId', '==', entityId),
      orderBy('createdAt', 'desc'),
    ),
  )
  return snap.docs.map((d) => hydrate<Note>(d.id, d.data()))
}

export async function createNote(data: {
  organisationId: string
  entityType: string
  entityId: string
  ownerUserId: string
  noteType: string
  content: string
}): Promise<Note | null> {
  const ref = await addDoc(notesCol, {
    ...data,
    schemaVersion: CURRENT_SCHEMA_VERSION,
    createdAt: stamp(),
    updatedAt: stamp(),
  })
  const snap = await getDoc(ref)
  return snap.exists() ? hydrate<Note>(snap.id, snap.data()) : null
}

// ---------------------------------------------------------------------------
// Activity Log
// ---------------------------------------------------------------------------
const activityCol = collection(db, 'activityLog')

export async function listActivity(
  orgId: string,
  opts?: { entityType?: string; entityId?: string; ownerUserId?: string; limitCount?: number },
): Promise<ActivityLog[]> {
  const constraints: QueryConstraint[] = [
    where('organisationId', '==', orgId),
    orderBy('createdAt', 'desc'),
  ]
  if (opts?.entityType) constraints.push(where('entityType', '==', opts.entityType))
  if (opts?.entityId) constraints.push(where('entityId', '==', opts.entityId))
  if (opts?.ownerUserId) constraints.push(where('ownerUserId', '==', opts.ownerUserId))
  if (opts?.limitCount) constraints.push(limit(opts.limitCount))

  const snap = await getDocs(query(activityCol, ...constraints))
  return snap.docs.map((d) => hydrate<ActivityLog>(d.id, d.data()))
}

export async function createActivity(data: {
  organisationId: string
  entityType: string
  entityId: string
  ownerUserId: string
  activityType: string
  description?: string | null
  metadata?: Record<string, unknown> | null
}): Promise<void> {
  await addDoc(activityCol, {
    ...data,
    schemaVersion: CURRENT_SCHEMA_VERSION,
    createdAt: stamp(),
  })
}

// ---------------------------------------------------------------------------
// Reports
// ---------------------------------------------------------------------------
const reportsCol = collection(db, 'reports')

export async function listReports(orgId: string, ownerUserId?: string): Promise<Report[]> {
  const constraints: QueryConstraint[] = [
    where('organisationId', '==', orgId),
    orderBy('createdAt', 'desc'),
  ]
  if (ownerUserId) constraints.push(where('ownerUserId', '==', ownerUserId))

  const snap = await getDocs(query(reportsCol, ...constraints))
  return snap.docs.map((d) => hydrate<Report>(d.id, d.data()))
}

export async function createReport(data: {
  organisationId: string
  projectionId: string
  ownerUserId: string
  reportType: string
}): Promise<Report | null> {
  const ref = await addDoc(reportsCol, {
    ...data,
    filePath: null,
    fileName: null,
    fileSize: null,
    status: 'pending',
    errorMessage: null,
    schemaVersion: CURRENT_SCHEMA_VERSION,
    createdAt: stamp(),
  })
  const snap = await getDoc(ref)
  return snap.exists() ? hydrate<Report>(snap.id, snap.data()) : null
}

export async function updateReport(
  id: string,
  data: Partial<Pick<Report, 'status' | 'filePath' | 'fileName' | 'fileSize' | 'errorMessage'>>,
): Promise<void> {
  await updateDoc(doc(reportsCol, id), data)
}

// ---------------------------------------------------------------------------
// Organisation & Settings
// ---------------------------------------------------------------------------
const orgsCol = collection(db, 'organisations')

export async function getOrganisation(orgId: string): Promise<Organisation | null> {
  const snap = await getDoc(doc(orgsCol, orgId))
  if (!snap.exists()) return null
  return { id: snap.id, ...snap.data() } as Organisation
}

const settingsSubCol = (orgId: string) => collection(db, 'organisations', orgId, 'settings')

export async function getOrganisationSettings(orgId: string): Promise<OrganisationSettings | null> {
  const snap = await getDoc(doc(settingsSubCol(orgId), 'settings'))
  if (!snap.exists()) return null
  return snap.data() as OrganisationSettings
}

export async function saveOrganisationSettings(
  orgId: string,
  data: Partial<Pick<OrganisationSettings, 'logoUrl' | 'primaryColor' | 'disclaimerText'>>,
): Promise<void> {
  const settingsRef = doc(settingsSubCol(orgId), 'settings')
  const snap = await getDoc(settingsRef)
  if (snap.exists()) {
    await updateDoc(settingsRef, { ...data, schemaVersion: CURRENT_SCHEMA_VERSION })
  } else {
    await addDoc(settingsSubCol(orgId), {
      logoUrl: null,
      primaryColor: '#10b981',
      disclaimerText: 'This report is illustrative only and does not constitute financial advice. All figures are estimates and exclude tax, fees, insurance, and market volatility.',
      ...data,
      schemaVersion: CURRENT_SCHEMA_VERSION,
    })
  }
}

// ---------------------------------------------------------------------------
// Batch / helpers
// ---------------------------------------------------------------------------
export async function batchGetClients(orgId: string, ids: string[]): Promise<Map<string, Client>> {
  const unique = [...new Set(ids)]
  const map = new Map<string, Client>()
  await Promise.all(
    unique.map(async (id) => {
      const c = await getClient(id)
      if (c && c.organisationId === orgId) map.set(id, c)
    }),
  )
  return map
}

export async function countDocuments(
  orgId: string,
  collectionName: string,
  extraFilters?: Record<string, string>,
): Promise<number> {
  const colRef = collection(db, collectionName)
  const constraints: QueryConstraint[] = [where('organisationId', '==', orgId)]
  if (extraFilters) {
    for (const [key, val] of Object.entries(extraFilters)) {
      constraints.push(where(key, '==', val))
    }
  }
  const snap = await getDocs(query(colRef, ...constraints))
  return snap.size
}
