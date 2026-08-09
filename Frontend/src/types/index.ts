export type InterviewType = 'Technical Interview' | 'Coding Interview' | 'System Design' | 'Behavioral Interview'
export type Difficulty = 'Beginner' | 'Intermediate' | 'Advanced'
export type InterviewMode = 'Adaptive AI' | 'Standard'
export type InterviewStatus = 'Completed' | 'In Progress' | 'Abandoned'

export interface InterviewConfig {
  type: InterviewType
  difficulty: Difficulty
  topics: string[]
  questionCount: number
  mode: InterviewMode
}

export interface ChatMessageData {
  id: string
  role: 'ai' | 'user'
  content: string
  timestamp: number
}

export interface InterviewRecord {
  id: string
  name: string
  type: InterviewType
  difficulty: Difficulty
  topics: string[]
  date: string
  questions: number
  score: number
  status: InterviewStatus
  strengths: string[]
  improvements: string[]
  nextSteps: string[]
  summary: string
  messages?: ChatMessageData[]
}

export interface ResourceItem {
  id: string
  title: string
  category: string
  difficulty: Difficulty
  time: string
  description: string
}

export interface Achievement {
  id: string
  icon: string
  title: string
  description: string
}

export interface SkillLevel {
  name: string
  level: number
}

export interface ToastMessage {
  id: string
  type: 'success' | 'error' | 'info'
  message: string
}

export interface AppSettings {
  darkMode: boolean
  compactMode: boolean
  defaultDifficulty: Difficulty
  defaultQuestionCount: number
  adaptiveQuestions: boolean
  interviewReminders: boolean
  weeklyProgress: boolean
}
