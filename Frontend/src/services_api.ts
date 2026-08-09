import { evaluateAnswer as localEvaluate } from './evaluator'
import type { EvalResult } from './evaluator'
import type { InterviewConfig } from './types'

const BASE = import.meta.env.VITE_API_BASE || ''

export function isBackendConnected() {
  return Boolean(BASE)
}

export type StartInterviewResponse = {
  sessionId: string
  firstQuestion: string
}

export type NextTurnResponse = {
  // 'question' = advance to a new question, 'retry'/'followup' = stay on the current one, 'done' = interview finished
  action: 'question' | 'retry' | 'followup' | 'done'
  question?: string
  evaluation: EvalResult
}

// TODO: confirm this matches your backend's actual start-interview route + payload/response shape.
export async function startInterview(config: InterviewConfig): Promise<StartInterviewResponse> {
  if (!BASE) {
    // No backend configured — caller falls back to fully local mock behavior.
    throw new Error('no-backend')
  }
  return postJSON('/api/interview/start', config) as Promise<StartInterviewResponse>
}

// TODO: confirm this matches your backend's continuation endpoint. Sends the candidate's answer for the
// current session/question and expects back both the evaluation AND what to do next (ask a new question,
// retry, follow up, or finish) so the backend — not the frontend — drives adaptivity.
export async function submitAnswerAndAdvance(
  sessionId: string,
  questionText: string,
  answer: string,
): Promise<NextTurnResponse> {
  if (!BASE) {
    throw new Error('no-backend')
  }
  return postJSON('/api/interview/answer', { sessionId, question: questionText, answer }) as Promise<NextTurnResponse>
}

// TODO: confirm this matches your backend's finish/report endpoint.
export async function endInterview(sessionId: string): Promise<any> {
  if (!BASE) {
    throw new Error('no-backend')
  }
  return postJSON('/api/interview/end', { sessionId })
}

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

export default { evaluateAnswer, getProfile, saveProfile, startInterview, submitAnswerAndAdvance, endInterview, isBackendConnected }