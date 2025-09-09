

import type { Chat } from '@google/genai';

export enum AppView {
  HOME = 'HOME',
  STUDY = 'STUDY',
  INTERVIEW = 'INTERVIEW',
  LEARNING_TRACKER = 'LEARNING_TRACKER',
  SYLLABUS_TRACKER = 'SYLLABUS_TRACKER',
  RESULT_TRACKER = 'RESULT_TRACKER',
  ADMIT_CARD_TRACKER = 'ADMIT_CARD_TRACKER',
  APPLICATION_TRACKER = 'APPLICATION_TRACKER',
  CURRENT_AFFAIRS = 'CURRENT_AFFAIRS',
  MIND_MAP = 'MIND_MAP',
  GUESS_PAPER = 'GUESS_PAPER',
}

export interface ChatMessage {
  role: 'user' | 'model' | 'system';
  content: string;
}

export type InterviewChat = Chat;

// Fix: Add Quiz and QuizQuestion types to fix import errors in Quiz.tsx and QuizGenerator.tsx.
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

export interface StudyMaterial {
  notes: string;
  imageUrl: string | null;
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

export interface GroundingChunk {
  web: {
    uri: string;
    title: string;
  };
}

export interface GroundedSummary {
  text: string;
  sources: GroundingChunk[];
}

export interface MindMapNode {
  name: string;
  children?: MindMapNode[];
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
    topicsMastered: number;
    weakTopics: number;
    studyStreak: number;
}

export interface RankPrediction {
    predictedRank: string;
    analysis: string;
    recommendations: string[];
}

// Fix: Add DailyBriefingMCQ and DailyBriefingData types to fix import errors in DailyBriefing.tsx.
export interface DailyBriefingMCQ {
  question: string;
  options: string[];
  correctAnswer: string;
}

export interface DailyBriefingData {
  summary: string;
  mcqs: DailyBriefingMCQ[];
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