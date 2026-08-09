import { evaluateAnswer as localEvaluate, EvalResult } from './evaluator'

const BASE = import.meta.env.VITE_API_BASE || ''
const PROFILE_STORAGE_KEY = 'candidateProfile_v1'

async function requestJSON(path: string, init: RequestInit = {}): Promise<any> {
  const res = await fetch(`${BASE}${path}`, {
    credentials: 'include',
    ...init,
  })
  const text = await res.text()
  if (!res.ok) throw new Error(`${res.status}: ${text || res.statusText}`)
  if (!text) return null
  return JSON.parse(text)
}

function readLocalProfile(): any | null {
  try {
    const raw = localStorage.getItem(PROFILE_STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function writeLocalProfile(profile: any) {
  try {
    localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile))
  } catch {
    // ignore storage failures
  }
}

export async function evaluateAnswer(question: string, answer: string): Promise<EvalResult> {
  try {
    const json = await requestJSON('/api/evaluate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question, answer }),
    })
    return json as EvalResult
  } catch {
    return localEvaluate(question, answer)
  }
}

export async function getProfile(): Promise<any> {
  try {
    const profile = await requestJSON('/api/profile')
    if (profile) {
      writeLocalProfile(profile)
      return profile
    }
  } catch {
    // fall back to the local profile cache
  }

  return readLocalProfile()
}

export async function saveProfile(profile: any): Promise<any> {
  try {
    const saved = await requestJSON('/api/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profile),
    })
    if (saved) {
      writeLocalProfile(saved)
      return saved
    }
  } catch {
    // fall back to local storage when the backend is unavailable
  }

  writeLocalProfile(profile)
  return profile
}

export default { evaluateAnswer, getProfile, saveProfile }
