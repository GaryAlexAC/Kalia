const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000'
const TOKEN_KEY = 'kalia.accessToken'
const EXPIRY_KEY = 'kalia.sessionExpiresAt'

export const TOKEN_STORAGE_KEY = TOKEN_KEY

export type Nivel = 'EXPLORADORES' | 'CONSTRUCTORES' | 'AVANZADOS'

export type AuthStudent = {
  id: number
  nombre: string
  email: string
  nivel: Nivel
  xpTotal: number
  creadoEn: string
}

export type AuthSession = {
  accessToken: string
  tokenType: 'Bearer'
  expiresIn: number
  estudiante: AuthStudent
}

export type ApiVideo = {
  id: string
  title: string
  description: string | null
  category: string
  topic: string | null
  durationSeconds: number | null
  provider: 'tiktok'
  sourceUrl: string
  embedUrl: string
  createdAt: string
}

export type Activity = {
  id: number
  slug: string
  titulo: string
  materia: 'MATEMATICAS' | 'LECTURA' | 'CIENCIAS'
}

export type Progress = {
  id: number
  estudianteId: number
  actividadId: number
  nivel: Nivel
  xp: number
  completadoEn: string
  actividad?: Pick<Activity, 'titulo' | 'materia'>
}

export type Badge = {
  id: number
  codigo: string
  nombre: string
  descripcion: string
  materia: Activity['materia'] | null
  xpRequerido: number
}

export type EarnedBadge = Badge & { obtenidaEn: string }
export type PendingBadge = Badge & { xpActual: number; falta: number }
export type RankingEntry = Pick<AuthStudent, 'nombre' | 'nivel' | 'xpTotal'>

type ApiErrorBody = { message?: string }

export class ApiError extends Error {
  constructor(message: string, public readonly status: number) {
    super(message)
    this.name = 'ApiError'
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      'content-type': 'application/json',
      ...init?.headers,
    },
  })

  const body = await response.json().catch(() => null) as T | ApiErrorBody | null
  if (!response.ok) {
    throw new ApiError(
      (body as ApiErrorBody | null)?.message ?? 'No fue posible conectar con Kalia.',
      response.status,
    )
  }
  return body as T
}

export function login(email: string, password: string) {
  return request<AuthSession>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
}

export function register(input: {
  nombre: string
  email: string
  password: string
  nivel: Nivel
}) {
  return request<AuthSession>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export function getCurrentStudent(token: string) {
  return request<AuthStudent>('/api/auth/me', {
    headers: { authorization: `Bearer ${token}` },
  })
}

function bearer(token: string): HeadersInit {
  return { authorization: `Bearer ${token}` }
}

export function getHealth() {
  return request<{ status: 'ok' }>('/health')
}

export function getVideos(limit = 20) {
  return request<{ items: ApiVideo[]; pagination: { nextCursor: string | null; hasMore: boolean } }>(`/api/videos?limit=${limit}`)
}

export function createVideo(input: {
  title: string
  description?: string
  category: string
  topic?: string
  sourceUrl: string
  durationSeconds?: number
}) {
  return request<{ id: string }>('/api/videos', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export function getActivities() {
  return request<Activity[]>('/api/actividades')
}

export function getStudent(studentId: number, token: string) {
  return request<AuthStudent>(`/api/estudiantes/${studentId}`, {
    headers: bearer(token),
  })
}

export function getProgress(studentId: number, token: string) {
  return request<Progress[]>(`/api/estudiantes/${studentId}/progreso`, {
    headers: bearer(token),
  })
}

export function completeActivity(input: {
  estudianteId: number
  actividad: string
  nivel: Nivel
  xp: number
}, token: string) {
  return request<{ progreso: Progress; insigniasNuevas: Badge[] }>('/api/progreso', {
    method: 'POST',
    headers: bearer(token),
    body: JSON.stringify(input),
  })
}

export function getBadges() {
  return request<Badge[]>('/api/insignias')
}

export function getStudentBadges(studentId: number, token: string) {
  return request<{ obtenidas: EarnedBadge[]; pendientes: PendingBadge[] }>(`/api/estudiantes/${studentId}/insignias`, {
    headers: bearer(token),
  })
}

export function reviewStudentBadges(studentId: number, token: string) {
  return request<{ insigniasNuevas: Badge[] }>(`/api/estudiantes/${studentId}/insignias/revisar`, {
    method: 'POST',
    headers: bearer(token),
  })
}

export function getRanking(limit = 10) {
  return request<RankingEntry[]>(`/api/ranking?limite=${limit}`)
}

export function getStoredToken() {
  const expiresAt = Number(window.localStorage.getItem(EXPIRY_KEY))
  if (expiresAt && expiresAt <= Date.now()) {
    clearToken()
    return null
  }
  return window.localStorage.getItem(TOKEN_KEY)
}

export function getStoredSessionExpiry() {
  return Number(window.localStorage.getItem(EXPIRY_KEY)) || null
}

export function storeToken(token: string, expiresIn: number) {
  window.localStorage.setItem(TOKEN_KEY, token)
  window.localStorage.setItem(EXPIRY_KEY, String(Date.now() + expiresIn * 1000))
}

export function clearToken() {
  window.localStorage.removeItem(TOKEN_KEY)
  window.localStorage.removeItem(EXPIRY_KEY)
}
