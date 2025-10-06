import type { Chat } from '@google/genai';
import type { User as FirebaseUser } from 'firebase/auth';

export enum AppView {
  HOME = 'HOME',
  EXPLORE = 'EXPLORE',
  STUDY_HELPER = 'STUDY_HELPER',
  QUIZ = 'QUIZ',
  INTERVIEW = 'INTERVIEW',
  LEARNING_TRACKER = 'LEARNING_TRACKER',
  SYLLABUS_TRACKER = 'SYLLABUS_TRACKER',
  RESULT_TRACKER = 'RESULT_TRACKER',
  ADMIT_CARD_TRACKER = 'ADMIT_CARD_TRACKER',
  APPLICATION_TRACKER = 'APPLICATION_TRACKER',
  GUESS_PAPER = 'GUESS_PAPER',
  AI_STUDY_PLAN = 'AI_STUDY_PLAN',
  TEACH_SHORTCUTS = 'TEACH_SHORTCUTS',
  EXAM_DETAILS_VIEWER = 'EXAM_DETAILS_VIEWER',
  JOB_NOTIFICATIONS = 'JOB_NOTIFICATIONS',
  DOUBT_SOLVER = 'DOUBT_SOLVER',
  STORY_TUTOR = 'STORY_TUTOR',
  MIND_MAP = 'MIND_MAP',
  CURRENT_AFFAIRS = 'CURRENT_AFFAIRS',
  DAILY_BRIEFING = 'DAILY_BRIEFING',
}

export interface ChatMessage {
  role: 'user' | 'model' | 'system';
  content: string;
}

export type InterviewChat = Chat;

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

export interface QuizResult {
  topic: string;
  score: number;
  totalQuestions: number;
  date: string;
}

export interface LearningProgress {
  studiedTopics: string[];
  quizHistory: QuizResult[];
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
  imageUrl: string | null;
}

export interface DeepDiveQuizQuestion {
  question: string;
  answer: string;
}

export interface DeepDiveMaterial {
  coreConcepts: string[];
  realWorldExample: string;
  commonMistakes: string[];
  quickQuiz: DeepDiveQuizQuestion[];
  relatedTopics: string[];
}

export interface ExamDetail {
  criteria: string;
  details: string;
}

export interface ExamDetailGroup {
    groupTitle: string;
    details: ExamDetail[];
}

export interface SyllabusTopic {
  id: string;
  title: string;
  details?: string;
  children?: SyllabusTopic[];
}

export interface SyllabusProgress {
  [syllabusKey: string]: {
    checkedIds: string[];
    // FIX: Add syllabus to progress to calculate completion on dashboard
    syllabus: SyllabusTopic[];
  };
}

export interface ExamStatusUpdate {
  status: string;
  details: string;
  link?: string;
}

export interface ApplicationRecord {
  id: string; // Unique ID, can be a timestamp
  examName: string;
  registrationId: string;
  password?: string;
  notes?: string;
}

export interface ExamByQualification {
    examName: string;
    examCategory: string;
    description: string;
}

export interface GuessQuestion {
  question: string;
  answer: string;
}

export interface GuessPaper {
  title: string;
  questions: GuessQuestion[];
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

// FIX: Added missing types for DailyBriefing and CurrentAffairsAnalyst features.
export interface DailyBriefingMCQ {
  question: string;
  options: string[];
  correctAnswer: string;
}

export interface DailyBriefingData {
  summary: string;
  mcqs: DailyBriefingMCQ[];
}

export interface GroundingSource {
    web: {
        uri: string;
        title: string;
    };
}

export interface GroundedSummary {
    text: string;
    sources: GroundingSource[];
}

// --- Study Plan Types ---
export interface StudyPlanTask {
  day: string;
  topic: string;
  activity: 'Study Notes' | 'Take Quiz';
  reason: string;
}

export interface StudyPlan {
    title: string;
    plan: StudyPlanTask[];
}

export interface JobNotification {
  postName: string;
  organization: string;
  vacancies: string;
  lastDate: string;
  link: string;
}

// --- Static Exam Data Structure ---

export interface ExamTier {
  name: string;
  topics?: string[];
  details?: ExamDetailGroup[];
}

export interface ExamSubCategory {
  name: string;
  tiers?: ExamTier[];
  topics?: string[]; // Topics for single-stage exams
  details?: ExamDetailGroup[]; // Details for single-stage exams
}

export interface ExamCategory {
  name: string;
  subCategories: ExamSubCategory[] | null; // null means fetch dynamically
  details?: ExamDetailGroup[];
}

export interface ExamData {
    national: ExamCategory[];
    state: {
      [stateName: string]: ExamCategory[];
    };
}

export interface LastSelection {
  selectionLevel: string;
  selectedState: string;
  selectedQualification: string;
  selectedExam: string;
  selectedSubCategory: string;
  selectedTier: string;
}

// Added MindMapNode to fix errors in MindMapGenerator.tsx
export interface MindMapNode {
  name: string;
  children?: MindMapNode[];
}
// FIX: Added missing UserProfile type for admin features.
export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  hasApiAccess: boolean;
  createdAt?: { toDate: () => Date }; // Firestore Timestamp
}

export type User = FirebaseUser & UserProfile;

export interface Notification {
  message: string;
  type: 'success' | 'error';
}