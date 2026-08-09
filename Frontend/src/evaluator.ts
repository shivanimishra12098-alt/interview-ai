export type EvalResult = {
  score: number // 0-100
  correctness: 'excellent' | 'good' | 'partial' | 'incorrect' | 'irrelevant'
  feedback: string
  strengths: string[]
  missingConcepts: string[]
  nextAction: 'followup' | 'retry' | 'next'
}

export type QuestionDef = {
  id: string
  topic: string
  question: string
  expectedConcepts: string[]
  keywords: string[]
  difficulty: 'easy' | 'medium' | 'hard'
  hints?: string[]
}

// Minimal question map used by the local evaluator. Add more questions here as needed.
const QUESTION_MAP: Record<string, QuestionDef> = {
  'Explain how a hash map works internally and what causes collisions.': {
    id: 'q-hashmap-collisions',
    topic: 'DSA',
    question: 'Explain how a hash map works internally and what causes collisions.',
    expectedConcepts: ['collision', 'chaining', 'open addressing', 'bucket', 'hash'],
    keywords: ['collision', 'hash', 'chain', 'bucket', 'open addressing', 'probing', 'linked list'],
    difficulty: 'medium',
    hints: [
      'Think about how keys are mapped to buckets with a hash function.',
      'Consider techniques such as chaining (linked lists per bucket) or open addressing (probing).',
    ],
  },
}

function tokenize(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
}

export function getQuestionDef(questionText: string): QuestionDef | undefined {
  return QUESTION_MAP[questionText]
}

// Basic, local evaluation implementation for demo purposes. Designed to be replaceable by a real AI service.
export function evaluateAnswer(questionText: string, answer: string): EvalResult {
  const def = getQuestionDef(questionText)
  const normalized = (answer || '').trim()
  // Too short or blank
  if (!normalized || normalized.length < 3) {
    return {
      score: 0,
      correctness: 'irrelevant',
      feedback: "That response doesn't address the question. Could you try explaining the answer in a sentence or two?",
      strengths: [],
      missingConcepts: def ? def.expectedConcepts : [],
      nextAction: 'retry',
    }
  }

  // Nonsense / garbage detection: many non-word characters or single gibberish token
  const words = tokenize(normalized)
  const alphaWords = words.filter((w) => /[a-z]{2,}/.test(w))
  if (alphaWords.length === 0 || (alphaWords.length === 1 && alphaWords[0].length <= 3 && /^[a-z]{3,}$/.test(alphaWords[0]))) {
    return {
      score: 0,
      correctness: 'irrelevant',
      feedback: "That answer doesn't address the question. Let's try it again.\n\nThe question is:\n" + (def ? def.question : questionText) + '\n\nTry to mention techniques or concepts relevant to the prompt.',
      strengths: [],
      missingConcepts: def ? def.expectedConcepts : [],
      nextAction: 'retry',
    }
  }

  // If we don't have a definition for this question, do a lightweight keyword check
  if (!def) {
    // simple length and token check
    const lenScore = Math.min(40, Math.floor(normalized.split('\n').join(' ').split(' ').length))
    const score = Math.min(80, lenScore + 20)
    const correctness: EvalResult['correctness'] = score > 75 ? 'excellent' : score > 60 ? 'good' : score > 40 ? 'partial' : 'incorrect'
    return {
      score,
      correctness,
      feedback: correctness === 'excellent' ? 'Good explanation.' : correctness === 'good' ? 'Good answer — a bit more detail would make it excellent.' : correctness === 'partial' ? 'Partially correct — consider adding more explanation.' : 'That seems incorrect or incomplete.',
      strengths: [],
      missingConcepts: [],
      nextAction: 'next',
    }
  }

  // Keyword / concept matching against question definition
  const matches = new Set<string>()
  for (const kw of def.keywords) {
    const k = kw.toLowerCase()
    for (const w of alphaWords) {
      if (w.includes(k) || k.includes(w)) {
        matches.add(k)
      }
    }
  }

  // Expected concept matching (stronger weight)
  const expectedMatches = new Set<string>()
  for (const ec of def.expectedConcepts) {
    for (const w of alphaWords) {
      if (w.includes(ec) || ec.includes(w)) {
        expectedMatches.add(ec)
      }
    }
  }

  // Basic scoring: weight expected concepts higher than keywords, also factor length
  const expectedScore = Math.min(def.expectedConcepts.length * 18, expectedMatches.size * 18)
  const keywordScore = Math.min(def.keywords.length * 6, matches.size * 6)
  const lengthBonus = Math.min(20, Math.floor(alphaWords.length / 3) * 5)
  let rawScore = expectedScore + keywordScore + lengthBonus

  // Normalize
  rawScore = Math.max(0, Math.min(100, rawScore))

  // Allow some tolerance for typos: if words closely match keywords (startsWith or contains) we've already used that.

  // Decide correctness label
  let correctness: EvalResult['correctness'] = 'incorrect'
  if (rawScore >= 85) correctness = 'excellent'
  else if (rawScore >= 70) correctness = 'good'
  else if (rawScore >= 45) correctness = 'partial'
  else if (rawScore >= 15) correctness = 'incorrect'
  else correctness = 'irrelevant'

  // Compose feedback, strengths, missingConcepts
  const strengths: string[] = []
  const missingConcepts: string[] = []

  if (expectedMatches.size > 0) {
    strengths.push(...Array.from(expectedMatches).slice(0, 3).map((s) => `Mentioned ${s}`))
  }
  if (matches.size > 0) {
    strengths.push(...Array.from(matches).slice(0, 3).map((s) => `Used keyword: ${s}`))
  }

  for (const ec of def.expectedConcepts) {
    if (!expectedMatches.has(ec)) missingConcepts.push(ec)
  }

  let feedback = ''
  if (correctness === 'excellent') {
    feedback = `Excellent. You covered the key concepts (${Array.from(expectedMatches).join(', ')}).`
  } else if (correctness === 'good') {
    feedback = `Good explanation. You covered most ideas; see missing concepts: ${missingConcepts.join(', ') || 'none'}.`
  } else if (correctness === 'partial') {
    feedback = `Partially correct — you have some of the right ideas. Try to include: ${missingConcepts.join(', ')}.`
  } else if (correctness === 'incorrect') {
    feedback = `That answer isn't quite right. Here's a hint: ${def.hints && def.hints.length ? def.hints[0] : 'Try focusing on the core data structure used.'}`
  } else {
    feedback = `That response doesn't address the question. Try again and mention relevant techniques.`
  }

  // Decide nextAction
  let nextAction: EvalResult['nextAction'] = 'next'
  if (correctness === 'irrelevant') nextAction = 'retry'

  return {
    score: rawScore,
    correctness,
    feedback,
    strengths,
    missingConcepts,
    nextAction,
  }
}
