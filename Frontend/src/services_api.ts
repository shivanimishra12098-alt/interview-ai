import { evaluateAnswer as localEvaluate, EvalResult } from './evaluator'

const BASE = import.meta.env.VITE_API_BASE || ''

async function postJSON(path: string, body: any) {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    credentials: 'include',
  })
  if (!res.ok) throw new Error(`${res.status}: ${await res.text()}`)
  return res.json()
}

export async function evaluateAnswer(question: string, answer: string): Promise<EvalResult> {
  if (!BASE) return localEvaluate(question, answer)
  try {
    const json = await postJSON('/api/evaluate', { question, answer })
    return json as EvalResult
  } catch (err) {
    return localEvaluate(question, answer)
  }
}

export async function getProfile(): Promise<any> {
  if (!BASE) {
    try {
      const raw = localStorage.getItem('candidateProfile_v1')
      return raw ? JSON.parse(raw) : null
    } catch (e) {
      return null
    }
  }
  const res = await fetch(`${BASE}/api/profile`, { credentials: 'include' })
  if (!res.ok) throw new Error('Failed to fetch profile')
  return res.json()
}

export async function saveProfile(profile: any): Promise<any> {
  if (!BASE) {
    localStorage.setItem('candidateProfile_v1', JSON.stringify(profile))
    return profile
  }
  const res = await fetch(`${BASE}/api/profile`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(profile),
  })
  if (!res.ok) throw new Error('Failed to save profile')
  return res.json()
}

export default { evaluateAnswer, getProfile, saveProfile }
