import type { InterviewRecord, ResourceItem, Achievement, SkillLevel } from '../types'

export const TOPIC_LIST = [
  'Python',
  'C++',
  'JavaScript',
  'DSA',
  'DBMS',
  'OS',
  'Computer Networks',
  'AI/ML',
  'System Design',
]

export const INTERVIEW_TYPES = [
  {
    id: 'Technical Interview' as const,
    description: 'A broad round covering fundamentals across your chosen topics.',
  },
  {
    id: 'Coding Interview' as const,
    description: 'Hands-on problem solving with data structures & algorithms.',
  },
  {
    id: 'System Design' as const,
    description: 'Architect scalable systems and defend your trade-offs.',
  },
  {
    id: 'Behavioral Interview' as const,
    description: 'Situational questions about teamwork, conflict & growth.',
  },
]

// Bank of AI interviewer questions, grouped loosely by theme so the mock
// engine can pick a relevant follow-up after the candidate answers.
export const QUESTION_BANK: string[] = [
  'Explain the difference between an array and a linked list. When would you choose one over the other?',
  'What is the time complexity of binary search, and why does the array need to be sorted?',
  'Walk me through the four core principles of object-oriented programming with an example.',
  "You're building a system that needs to handle a high volume of API requests. How would you design the architecture for scalability and reliability?",
  'How would you handle data consistency across multiple services in this architecture?',
  'Explain the key differences between REST and GraphQL, and when you would reach for each.',
  'What is caching, and where would you introduce it in a typical web application?',
  'Tell me about a machine learning model you have worked with — how did you evaluate it?',
  'How would you design a URL shortening service like bit.ly at a high level?',
  'What is the difference between SQL and NoSQL databases, and how do you decide between them?',
  'Explain how a hash map works internally and what causes collisions.',
  'Describe a time you disagreed with a teammate on a technical decision. How did you resolve it?',
]

export const FOLLOW_UPS: string[] = [
  'Interesting approach — how would that change if traffic increased 10x overnight?',
  'Good. Can you go a level deeper on how you would test that solution?',
  'That makes sense. What trade-offs are you making with that choice?',
  'Nice explanation. How would you handle the edge cases here?',
  "Let's build on that — how would you monitor this in production?",
  'Solid reasoning. What would you do differently under a tighter time constraint?',
]

export const AI_CLOSING =
  "That's a great note to end on. You've covered a strong range of topics today — let's wrap up the session and put together your feedback."

const daysAgo = (n: number) => {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toISOString()
}

export const INTERVIEW_HISTORY: InterviewRecord[] = [
  {
    id: 'int-1001',
    name: 'Technical Interview',
    type: 'Technical Interview',
    difficulty: 'Intermediate',
    topics: ['DSA', 'System Design'],
    date: daysAgo(1),
    questions: 9,
    score: 88,
    status: 'Completed',
    strengths: [
      'Strong grasp of system design concepts',
      'Good problem-solving approach',
      'Clear communication',
      'Logical thinking',
    ],
    improvements: [
      'Deeper knowledge of distributed systems',
      'Practice more on concurrent programming',
      'Improve test case coverage',
      'Explore more edge cases',
    ],
    nextSteps: [
      'Practice designing scalable systems with focus on distributed consensus algorithms',
      'Review advanced data structures like B-trees and skip lists',
      'Build a small distributed system project (e.g., simple message broker)',
      'Study CAP theorem and common trade-offs in production systems',
    ],
    summary:
      'You demonstrated a strong understanding of system design principles, data structures, and problem-solving approaches. You communicated your ideas clearly and think systematically. Your solutions show good architectural thinking, though some distributed system concepts need deeper exploration.',
  },
  {
    id: 'int-1002',
    name: 'Data Structures & Algorithms',
    type: 'Coding Interview',
    difficulty: 'Advanced',
    topics: ['DSA', 'Python'],
    date: daysAgo(4),
    questions: 10,
    score: 76,
    status: 'Completed',
    strengths: [
      'Excellent problem-solving approach',
      'Efficient use of core data structures',
      'Strong analytical skills',
      'Quick adaptation to new problems',
    ],
    improvements: [
      'Practice more on concurrent programming and multithreading',
      'Work on edge case handling and boundary conditions',
      'Improve solution documentation and code clarity',
      'Master advanced algorithm techniques like dynamic programming',
    ],
    nextSteps: [
      'Solve more problems on concurrency and multithreading patterns',
      'Time-box practice sessions (45 min per problem)',
      'Write detailed comments for complex algorithms',
      'Study and implement 3-5 advanced DP problems this week',
    ],
    summary:
      'A solid coding round — your solutions were correct and reasonably efficient, though a couple of edge cases slipped through under time pressure. You showed good instincts and recovered well when asked to optimize.',
  },
  {
    id: 'int-1003',
    name: 'Python Fundamentals',
    type: 'Technical Interview',
    difficulty: 'Beginner',
    topics: ['Python'],
    date: daysAgo(9),
    questions: 8,
    score: 91,
    status: 'Completed',
    strengths: [
      'Clean, idiomatic Python code',
      'Confident with core language features',
      'Strong understanding of Python ecosystem',
      'Excellent code organization',
    ],
    improvements: [
      'Explore generators and decorators in depth',
      'Study asynchronous programming patterns',
      'Learn more about Python metaclasses and descriptors',
      'Practice performance optimization techniques',
    ],
    nextSteps: [
      'Build a small project using decorators and generators',
      'Read up on the Global Interpreter Lock (GIL)',
      'Explore asyncio and async/await patterns',
      'Contribute to an open-source Python project',
    ],
    summary:
      'Excellent fundamentals — you moved through language-level questions quickly and explained your reasoning clearly throughout. Your code is readable and follows Python best practices well.',
  },
  {
    id: 'int-1004',
    name: 'System Design',
    type: 'System Design',
    difficulty: 'Advanced',
    topics: ['System Design', 'DBMS'],
    date: daysAgo(15),
    questions: 7,
    score: 69,
    status: 'Completed',
    strengths: [
      'Good grasp of high-level architecture',
      'Understanding of database fundamentals',
      'Awareness of scalability concerns',
      'Reasonable component design',
    ],
    improvements: [
      'Deepen knowledge of distributed systems principles',
      'Practice quantifying capacity estimates and calculations',
      'Study consistency models and trade-offs in depth',
      'Improve understanding of monitoring and observability',
    ],
    nextSteps: [
      'Study CAP theorem trade-offs in depth with concrete examples',
      'Practice 3-5 more design prompts this week with focus on capacity planning',
      'Learn and implement a simple cache layer for a design',
      'Study real-world system architectures (Twitter, Netflix, Uber)',
    ],
    summary:
      'You had the right instincts on component boundaries, but capacity estimation and consistency trade-offs need more depth. Your architectural thinking is sound; focus on quantification and deeper distributed systems knowledge.',
  },
]

export const RESOURCES: ResourceItem[] = [
  { id: 'r1', title: 'Arrays & Two Pointers Deep Dive', category: 'Data Structures', difficulty: 'Beginner', time: '25 min', description: 'Master the two-pointer technique with classic array problems.' },
  { id: 'r2', title: 'Linked List Patterns', category: 'Data Structures', difficulty: 'Beginner', time: '30 min', description: 'Reversal, cycle detection, and merge patterns explained visually.' },
  { id: 'r3', title: 'Big-O Notation, Properly Explained', category: 'Algorithms', difficulty: 'Beginner', time: '20 min', description: 'Build real intuition for time and space complexity analysis.' },
  { id: 'r4', title: 'Dynamic Programming from Scratch', category: 'Algorithms', difficulty: 'Intermediate', time: '45 min', description: 'A structured approach to spotting and solving DP problems.' },
  { id: 'r5', title: 'Designing a URL Shortener', category: 'System Design', difficulty: 'Intermediate', time: '35 min', description: 'Capacity planning, hashing schemes, and database choices.' },
  { id: 'r6', title: 'Scaling Reads with Caching', category: 'System Design', difficulty: 'Advanced', time: '40 min', description: 'Cache invalidation strategies and where they tend to break.' },
  { id: 'r7', title: 'Pythonic Idioms You Should Know', category: 'Python', difficulty: 'Beginner', time: '20 min', description: 'Comprehensions, context managers, and unpacking done right.' },
  { id: 'r8', title: 'Decorators & Generators', category: 'Python', difficulty: 'Intermediate', time: '30 min', description: 'Understand closures before you write your first decorator.' },
  { id: 'r9', title: 'Intro to Supervised Learning', category: 'AI/ML', difficulty: 'Beginner', time: '35 min', description: 'Regression vs classification, and how to evaluate a model.' },
  { id: 'r10', title: 'Neural Networks, Visually', category: 'AI/ML', difficulty: 'Intermediate', time: '40 min', description: 'Forward pass, backprop, and gradient descent with diagrams.' },
  { id: 'r11', title: 'Normalization & Indexing', category: 'DBMS', difficulty: 'Intermediate', time: '30 min', description: 'When to normalize, when to denormalize, and why indexes help.' },
  { id: 'r12', title: 'Transactions & ACID', category: 'DBMS', difficulty: 'Intermediate', time: '25 min', description: 'Isolation levels explained with concrete failure scenarios.' },
  { id: 'r13', title: 'Processes, Threads & the Scheduler', category: 'Operating Systems', difficulty: 'Intermediate', time: '35 min', description: 'What actually happens when your program runs.' },
  { id: 'r14', title: 'Memory Management Essentials', category: 'Operating Systems', difficulty: 'Advanced', time: '30 min', description: 'Paging, segmentation, and virtual memory, demystified.' },
  { id: 'r15', title: 'TCP vs UDP, and When It Matters', category: 'Computer Networks', difficulty: 'Beginner', time: '20 min', description: 'A practical comparison grounded in real application choices.' },
  { id: 'r16', title: 'How DNS Resolution Really Works', category: 'Computer Networks', difficulty: 'Beginner', time: '20 min', description: 'From your browser bar to an IP address, step by step.' },
]

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'a1', icon: '🏆', title: 'Interview Master', description: 'Completed 10+ interviews' },
  { id: 'a2', icon: '⚡', title: 'Fast Learner', description: 'Improved average score by 15% in a month' },
  { id: 'a3', icon: '🎯', title: 'Problem Solver', description: 'Scored 90%+ on a coding round' },
]

export const SKILLS: SkillLevel[] = [
  { name: 'Python', level: 88 },
  { name: 'DSA', level: 74 },
  { name: 'System Design', level: 66 },
  { name: 'DBMS', level: 71 },
  { name: 'AI/ML', level: 55 },
]

export const RECOMMENDED_TOPICS: { title: string; icon: string; difficulty: string; progress: number }[] = [
  { title: 'Arrays & Strings', icon: '🧩', difficulty: 'Beginner', progress: 80 },
  { title: 'Linked Lists', icon: '🔗', difficulty: 'Beginner', progress: 55 },
  { title: 'System Design', icon: '🏗️', difficulty: 'Advanced', progress: 40 },
  { title: 'Algorithms', icon: '📈', difficulty: 'Intermediate', progress: 65 },
  { title: 'Python', icon: '🐍', difficulty: 'Beginner', progress: 90 },
  { title: 'Database Fundamentals', icon: '🗄️', difficulty: 'Intermediate', progress: 48 },
]
