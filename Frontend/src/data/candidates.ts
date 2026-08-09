export const CANDIDATE_NAMES = [
  'Aarav Sharma',
  'Ananya Verma',
  'Rohan Gupta',
  'Priya Singh',
  'Arjun Mehta',
  'Kavya Patel',
  'Aditya Kumar',
  'Sneha Joshi',
  'Rahul Mishra',
  'Neha Agarwal',
  'Yash Malhotra',
  'Simran Kaur',
  'Devansh Singh',
  'Aditi Sharma',
  'Karan Verma',
  'Ishita Gupta',
  'Aryan Kapoor',
  'Meera Nair',
  'Harsh Vardhan',
  'Riya Mehta',
  'Ankit Raj',
  'Pooja Sharma',
  'Siddharth Jain',
  'Tanya Gupta',
  'Manav Bansal',
  'Nisha Verma',
  'Akash Yadav',
  'Diya Kapoor',
  'Varun Singh',
  'Sakshi Mishra',
  'Vihaan Patel',
]

function initialsFor(name: string) {
  return name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

const ROLE_OPTIONS = [
  'AI/ML Student',
  'Data Science Student',
  'ML Engineer Trainee',
  'Software Engineering Intern',
  'Research Intern',
]

const TOPICS = ['Python', 'RAG', 'AI Agents', 'MCP', 'System Design', 'Databases', 'Algorithms']

export const CANDIDATES = CANDIDATE_NAMES.map((name, idx) => {
  const id = `candidate-${String(idx + 1).padStart(2, '0')}`
  const initials = initialsFor(name)
  const role = ROLE_OPTIONS[idx % ROLE_OPTIONS.length]
  const totalDays = 31
  const currentDay = ((idx * 3) % totalDays) + 1 // deterministic variation
  const progress = Math.round((currentDay / totalDays) * 100)
  const interviewsCompleted = (idx % 10) + 1
  const interviewScore = 55 + ((idx * 7) % 45) // range 55-99
  const streak = (idx % 12) + 1
  const projectsCompleted = (idx % 5) + 0
  const status = currentDay === totalDays ? 'Completed' : interviewScore < 60 ? 'At Risk' : 'Active'

  const skills = {
    python: Math.min(98, 60 + ((idx * 5) % 40)),
    rag: Math.min(95, 50 + ((idx * 6) % 45)),
    agents: Math.min(92, 40 + ((idx * 4) % 53)),
    mcp: Math.min(90, 30 + ((idx * 3) % 60)),
    systemDesign: Math.min(94, 45 + ((idx * 7) % 50)),
  }

  const strengths = [
    TOPICS[idx % TOPICS.length],
    TOPICS[(idx + 1) % TOPICS.length],
    'Problem Solving',
  ]

  const areasToImprove = [
    TOPICS[(idx + 3) % TOPICS.length],
    TOPICS[(idx + 4) % TOPICS.length],
  ]

  const recentInterviews = [
    { title: 'RAG Fundamentals', score: Math.max(50, Math.round(interviewScore - 2)) },
    { title: 'AI Agents', score: Math.max(50, Math.round(interviewScore - 4)) },
    { title: 'System Design', score: Math.max(50, Math.round(interviewScore + 1)) },
  ]

  const achievements = [
    { id: 'ach-1', title: 'First Interview', unlocked: idx % 2 === 0 },
    { id: 'ach-2', title: '7-Day Streak', unlocked: streak >= 7 },
    { id: 'ach-3', title: 'Project Contributor', unlocked: projectsCompleted >= 1 },
  ]

  return {
    id,
    name,
    initials,
    role,
    cohort: '31-Day AI Engineering Cohort',
    currentDay,
    totalDays,
    progress,
    interviewScore,
    interviewsCompleted,
    status,
    skills,
    strengths,
    areasToImprove,
    streak,
    projectsCompleted,
    recentInterviews,
    achievements,
  }
})

export default CANDIDATES
