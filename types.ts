
import type { Chat } from '@google/genai';

export type User = {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  isAdmin?: boolean; // New field for dynamic admin status
  role?: string; // New field for role management
  createdAt?: string | any; // Account creation date (string or Firestore Timestamp)
  customExpiryDate?: any; // Admin override for expiry
  validityDaysRemaining?: number; // Calculated on frontend
};

export enum AppView {
  HOME = 'HOME',
  ASK_AI = 'ASK_AI',
  LEARNING_TRACKER = 'LEARNING_TRACKER',
  USER_PROFILE = 'USER_PROFILE',
  QUIZ = 'QUIZ',
  INTERVIEW = 'INTERVIEW',
  LEARN_TOPICS = 'LEARN_TOPICS',
  DAILY_BRIEFING = 'DAILY_BRIEFING',
  MIND_MAP = 'MIND_MAP',
  GUESS_PAPER = 'GUESS_PAPER',
  STUDY_ROADMAP = 'STUDY_ROADMAP',
  TEACH_SHORTCUTS = 'TEACH_SHORTCUTS',
  EXAM_DETAILS_VIEWER = 'EXAM_DETAILS_VIEWER',
  JOB_NOTIFICATIONS = 'JOB_NOTIFICATIONS',
  JOB_DETAILS_VIEWER = 'JOB_DETAILS_VIEWER',
  DOUBT_SOLVER = 'DOUBT_SOLVER',
  CONCEPT_LINK_MAP = 'CONCEPT_LINK_MAP',
  TEACH_BACK_MODE = 'TEACH_BACK_MODE',
  SELF_SUMMARY_CHALLENGE = 'SELF_SUMMARY_CHALLENGE',
  REAL_LIFE_EXAMPLES = 'REAL_LIFE_EXAMPLES',
  CAREER_COMPASS = 'CAREER_COMPASS',
  AI_RESUME_BUILDER = 'AI_RESUME_BUILDER',
  FLASHCARDS_GENERATOR = 'FLASHCARDS_GENERATOR',
  SCIENTIFIC_CALCULATOR = 'SCIENTIFIC_CALCULATOR',
  PREVIOUS_YEAR_QUESTIONS = 'PREVIOUS_YEAR_QUESTIONS',
  TOOLS = 'TOOLS',
  CURRENT_AFFAIRS = 'CURRENT_AFFAIRS',
  ADAPTIVE_LEARNING_PATH = 'ADAPTIVE_LEARNING_PATH',
  STORY_TUTOR = 'STORY_TUTOR',
  HOMEWORK_SOLVER = 'HOMEWORK_SOLVER',
}

export type LastSelection = {
  selectionLevel: string;
  selectedState: string;
  selectedQualification: string;
  selectedExam: string;
  selectedSubCategory: string;
  selectedTier: string;
};

export interface SubjectSyllabusItem {
  subject: string;
  topics: string[];
}
export type Syllabus = SubjectSyllabusItem[];

export interface ExamDetail {
  criteria: string;
  details: string;
}
export interface ExamDetailGroup {
  groupTitle: string;
  details: ExamDetail[];
}

export interface QuizQuestion {
  question: string;
  questionEnglish?: string;
  options: string[];
  optionsEnglish?: string[];
  correctAnswer: string;
}
export interface Quiz {
  title: string;
  questions: QuizQuestion[];
}

export interface PracticeQuestion {
  question: string;
  answer: string;
}
export interface StudyMaterial {
  notes: string;
  summary: string;
  story: string;
  practiceQuestions: PracticeQuestion[];
  shortcutsAndTricks: string;
  imageUrl: string | null;
}

export interface StoryTutorResponse {
    prePoints: string[];
    story: string;
    challengeQuestion: string;
    solutionWithStory: string;
}

export interface DeepDiveMaterial {
  coreConcepts: string[];
  realWorldExample: string;
  commonMistakes: string[];
  quickQuiz: DeepDiveQuizQuestion[];
  relatedTopics: string[];
}

export interface DeepDiveQuizQuestion {
  question: string;
  answer: string;
}

export interface ExamByQualification {
  examName: string;
  examCategory: string;
  description: string;
}

export interface GroundingSource {
    web?: {
        uri?: string;
        title?: string;
    }
}
export interface ExamStatusUpdate {
  status: string;
  details: string;
  link?: string;
  sources?: GroundingSource[];
}

export interface GroundedSummary {
    text: string;
    sources: GroundingSource[];
}

export interface GuessPaper {
  title: string;
  questions: PracticeQuestion[];
}

export interface PerformanceSummary {
  totalQuizzes: number;
  averageScore: number;
  topicsStudied: number;
  masteredTopics: string[];
  weakTopics: string[];
  studyStreak: number;
}

export interface RankPrediction {
  predictedRank: string;
  analysis: string;
  recommendations: string[];
}

export interface StudyRoadmapPhase {
    phaseTitle: string;
    strategy: string;
    topics: string[];
}
export interface StudyRoadmap {
  title: string;
  phases: StudyRoadmapPhase[];
}

export interface JobNotification {
  postName: string;
  organization: string;
  vacancies: string;
  eligibility: string;
  startDate?: string;
  lastDate: string;
  link?: string;
}

export interface AdaptiveLearningStep {
  step: number;
  action: 'Review Concept' | 'Deep Dive' | 'Practice Questions' | 'Final Quiz';
  topic: string;
  subject: string;
  rationale: string;
}

export interface AdaptiveLearningPath {
  title: string;
  initialAssessment: string;
  steps: AdaptiveLearningStep[];
}

export interface MindMapNode {
  name: string;
  children?: MindMapNode[];
}

export interface DailyBriefingMCQ {
  question: string;
  options: string[];
  correctAnswer: string;
}
export interface DailyBriefingData {
  summary: string;
  mcqs: DailyBriefingMCQ[];
  sources: GroundingSource[];
}

export interface ChatMessage {
  role: 'user' | 'model' | 'system';
  content: string;
}

export interface ChatSession {
    id: string;
    title: string;
    createdAt: number;
    messages: ChatMessage[];
}

export type InterviewChat = Chat;

export interface TutorialStep {
    step: number;
    title: string;
    content: string;
    example?: string;
}

export interface Tutorial {
    title: string;
    introduction: string;
    prerequisites: string[];
    steps: TutorialStep[];
    workedExample: string;
    commonPitfalls: string[];
    summary: string;
    nextSteps: string[];
}

export type HistoryType =
 | 'QUIZ_STARTED' | 'QUIZ_COMPLETED' | 'TOPIC_STUDIED'
 | 'INTERVIEW_STARTED' | 'MIND_MAP_GENERATED'
 | 'GUESS_PAPER_GENERATED' | 'ROADMAP_GENERATED'
 | 'SHORTCUTS_VIEWED' | 'EXAM_DETAILS_VIEWED'
 | 'JOB_NOTIFICATIONS_VIEWED' | 'DOUBT_SOLVED'
 | 'DAILY_BRIEFING_VIEWED'
 | 'ASK_AI_QUESTION' | 'CONCEPT_MAP_GENERATED'
 | 'TEACH_BACK_STARTED' | 'SUMMARY_CHALLENGE_COMPLETED'
 | 'REAL_LIFE_EXAMPLES_VIEWED' | 'CAREER_ADVICE_VIEWED'
 | 'RESUME_BUILT' | 'FLASHCARDS_GENERATED'
 | 'PREVIOUS_YEAR_QUESTIONS_VIEWED' | 'CURRENT_AFFAIRS_VIEWED'
 | 'ADAPTIVE_PATH_GENERATED'
 | 'TUTORIAL_STARTED'
 | 'STORY_TUTOR_VIEWED'
 | 'HOMEWORK_SOLVED'
 ;
 
export interface HistoryItem {
  id: string;
  timestamp: number;
  type: HistoryType;
  description: string;
  view: AppView;
  context: {
    topic?: string;
    examPath?: string;
  };
}

export interface SyllabusTopic {
    id: string;
    title: string;
    details?: string;
    children?: SyllabusTopic[];
}
export interface SyllabusProgress {
  [key: string]: {
    checkedIds: string[];
    syllabus: SyllabusTopic[];
  };
}

export interface QuizResult {
  topic: string;
  score: number;
  totalQuestions: number;
  date: string;
}
export interface LearningProgress {
  studiedTopics: string[];
  quizHistory: QuizResult[];
  likedTopics: string[];
}

export interface ApplicationRecord {
  id: string;
  examName: string;
  registrationId: string;
  password?: string;
  notes?: string;
}

export interface Notification {
  message: string;
  type: 'error' | 'success';
}

export interface DailyNugget {
    type: 'word' | 'quote';
    word?: string;
    meaning?: string;
    sentence?: string;
    quote?: string;
    author?: string;
}

export interface DailyQuote {
    quote: string;
    author: string;
}

export type DisplaySettings = {
    fontSize: 'sm' | 'base' | 'lg';
    fontFamily: 'sans' | 'serif' | 'mono';
    language: string;
    theme: 'light' | 'dark' | 'system';
};

export type UserProfile = {
  dob: string;
  college: string;
  school: string;
  course: string;
  place: string;
  gender: string;
  interestedJobs: string;
  isAdmin?: boolean; // Stored in DB
  isBlocked?: boolean;
  apiUsage?: number;
};

export interface UserSession {
    lastView: AppView;
    history?: AppView[]; // Navigation stack persistence
    context?: {
        currentTopic?: string;
    };
}

export interface PopupConfig {
    title: string;
    options: { value: string; label: string }[];
    onSelect: (value: string) => void;
}

export interface DictionaryEntry {
    word: string;
    partOfSpeech: string;
    definition: string;
    example: string;
}

export interface Flashcard {
    front: string;
    back: string;
}

export interface WorkExperience {
    jobTitle: string;
    company: string;
    startDate: string;
    endDate: string;
    responsibilities: string[];
}
export interface Education {
    degree: string;
    institution: string;
    graduationYear: string;
}
export interface ResumeData {
    fullName: string;
    email: string;
    phone: string;
    address: string;
    summary: string;
    workExperience: WorkExperience[];
    education: Education[];
    skills: string[];
}

export interface SolvingMethod {
    title: string;
    explanation: string;
    example: string;
}

export type UserNotes = { [topic: string]: string };

// From constants.ts
export interface ExamTier {
  name: string;
  syllabus?: Syllabus;
}

export interface ExamSubCategory {
  name: string;
  tiers?: ExamTier[];
  syllabus?: Syllabus;
  subCategories?: ExamSubCategory[];
}

export interface ExamCategory {
  name: string;
  subCategories?: ExamSubCategory[];
  // FIX: Add optional 'tiers' property to allow top-level categories to have tiers directly.
  tiers?: ExamTier[];
}

// New types for Admin Dashboard
export interface GlobalStats {
    totalUsers: number;
}

export interface FullUserProfile extends User {
    lastLogin?: any; // Timestamp
    createdAt?: any; // Timestamp or string from User
    loginCount?: number;
    role?: string; // 'admin' | 'user'
    isBlocked?: boolean;
    apiUsage?: number;
    currentFocus?: string;
    customExpiryDate?: any; // Timestamp
    profile?: UserProfile; // Added profile data
}

export interface TrialUser {
    id: string; // phone number
    name: string;
    email: string;
    phoneNumber: string;
    fingerprint: string;
    startedAt: any;
    userAgent: string;
    apiUsage?: number;
}
        