// Choices for the AI mock interview, shared by the page (src/lib/interview.ts)
// and the API's input validation (server/interview.ts).
export const ROLES = [
  'Software Engineer (SDE)',
  'Frontend Developer',
  'Backend Developer',
  'Full Stack Developer',
  'Data Analyst',
  'Data Scientist / ML Engineer',
  'DevOps / Cloud Engineer',
  'Android / Mobile Developer',
] as const;
export const LEVELS = ['Internship', 'Fresher', '1–3 years'] as const;
