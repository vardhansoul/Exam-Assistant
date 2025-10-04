
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { AppView, ExamDetailGroup, ExamByQualification, SyllabusTopic, User, Notification } from './types';
import { LANGUAGES, QUALIFICATION_CATEGORIES, SELECTION_LEVELS, INDIAN_STATES, EXAM_DATA, SCHOOL_CLASSES, SCHOOL_STREAMS, SCHOOL_SUBJECTS } from './constants';
import { generateExamsByQualification, getSpecificErrorMessage, generateTopicsForExam, generateExamDetails } from './services/geminiService';
import { getLastSelection, saveLastSelection, getSyllabusProgress, getTrackingData } from './utils/tracking';
import { auth, db, onAuthStateChanged, signOut, getDoc, doc, setDoc, serverTimestamp, getRedirectResult, GoogleAuthProvider, signInWithRedirect } from './firebase';
import TopicExplorer from './components/TopicExplorer';
import StudyHelper from './components/StudyHelper';
import QuizGenerator from './components/QuizGenerator';
import MockInterview from './components/MockInterview';
import LearningTracker from './components/LearningTracker';
import SyllabusTracker from './components/SyllabusTracker';
import ResultTracker from './components/ResultTracker';
import AdmitCardTracker from './components/AdmitCardTracker';
import ApplicationTracker from './components/ApplicationTracker';
import GuessPaperGenerator from './components/GuessPaperGenerator';
import StudyPlanner from './components/StudyPlanner';
import TeachShortcuts from './components/TeachShortcuts';
import Card from './components/Card';
import Button from './components/Button';
import LoadingSpinner from './components/LoadingSpinner';
import SelectionPopup from './components/SelectionPopup';
import PopupSelector from './components/PopupSelector';
import ExamDetailsViewer from './components/ExamDetailsViewer';
import JobNotificationsViewer from './components/JobNotificationsViewer';
import DoubtSolver from './components/DoubtSolver';
import StoryTutor from './components/StoryTutor';
import MindMapGenerator from './components/MindMapGenerator';
import CurrentAffairsAnalyst from './components/CurrentAffairsAnalyst';
import DailyBriefing from './components/DailyBriefing';
import NotificationBanner from './components/NotificationBanner';
import { Bars3Icon } from './components/icons/Bars3Icon';
import { ArrowLeftIcon } from './components/icons/ArrowLeftIcon';
import { UserCircleIcon } from './components/icons/UserCircleIcon';
import { ArrowRightOnRectangleIcon } from './components/icons/ArrowRightOnRectangleIcon';


// Popup configuration type for child components
export type PopupConfig = {
    title: string;
    options: { value: string; label: string; subtitle?: string }[];
    onSelect: (value: string) => void;
};


const App: React.FC = () => {
  const [view, setView] = useState<AppView>(() => {
    const hash = window.location.hash.replace('#', '');
    const viewFromHash = Object.values(AppView).find(v => v === hash.toUpperCase());
    return viewFromHash || AppView.HOME;
  });
  const [language, setLanguage] = useState<string>(LANGUAGES[0]);
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [user, setUser] = useState<User | null | 'loading'>('loading');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [notification, setNotification] = useState<Notification | null>(null);

  // State to link planner to tools
  const [preselectedTopic, setPreselectedTopic] = useState<string | null>(null);

  // --- Selection State ---
  const [selectionLevel, setSelectionLevel] = useState<string>('');
  const [selectedState, setSelectedState] = useState<string>('');
  const [selectedQualification, setSelectedQualification] = useState<string>('');
  const [selectedExam, setSelectedExam] = useState<string>('');
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>('');
  const [selectedTier, setSelectedTier] = useState<string>('');

  // --- API call states ---
  const [qualificationExams, setQualificationExams] = useState<ExamByQualification[]>([]);
  const [isQualificationExamsLoading, setIsQualificationExamsLoading] = useState<boolean>(false);
  const [qualificationExamsError, setQualificationExamsError] = useState<string | null>(null);
  
  const [dynamicExamDetails, setDynamicExamDetails] = useState<{ topics: string[]; details: ExamDetailGroup[] } | null>(null);
  const [isDynamicDetailsLoading, setIsDynamicDetailsLoading] = useState<boolean>(false);
  const [dynamicDetailsError, setDynamicDetailsError] = useState<string | null>(null);

  // --- Popup State ---
  const [popupState, setPopupState] = useState<{
    isOpen: boolean;
    title: string;
    options: { value: string; label: string; subtitle?: string; }[];
    onSelect: (value: string) => void;
  }>({
    isOpen: false,
    title: '',
    options: [],
    onSelect: () => {},
  });
  
   useEffect(() => {
    getRedirectResult(auth).catch(error => {
        console.error("Login redirect error:", error);
        setNotification({ message: 'Login failed. Please try again.', type: 'error' });
    });
    
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userDocRef = doc(db, "users", firebaseUser.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          setUser({ ...firebaseUser, ...userDoc.data() } as User);
        } else {
          // Create a profile for a new user
          const newUserProfile = {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            name: firebaseUser.displayName,
            role: 'user',
            hasApiAccess: true, // Default access
            createdAt: serverTimestamp(),
          };
          await setDoc(userDocRef, newUserProfile);
          setUser({ ...firebaseUser, ...newUserProfile } as User);
        }
      } else {
        setUser(null);
      }
    });
    return () => unsubscribe();
  }, []);
  
  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
    setNotification({ message: "You have been logged out.", type: 'success' });
  };
  
  const handleGoogleLogin = async () => {
    setIsLoggingIn(true);
    setNotification(null);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithRedirect(auth, provider);
      // Page will redirect, no need to set isLoggingIn back to false here.
    } catch (err) {
      console.error("Login initiation failed:", err);
      setNotification({ message: 'Login failed to start. Please try again.', type: 'error' });
      setIsLoggingIn(false);
    }
  };

  useEffect(() => {
    const currentHash = window.location.hash.replace('#', '');
    if (view !== currentHash) {
      window.location.hash = view;
    }
  }, [view]);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      const viewFromHash = Object.values(AppView).find(v => v === hash.toUpperCase()) || AppView.HOME;
      setView(currentView => currentView !== viewFromHash ? viewFromHash : currentView);
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);


  useEffect(() => {
    const lastSelection = getLastSelection();
    if (lastSelection) {
      setSelectionLevel(lastSelection.selectionLevel);
      setSelectedState(lastSelection.selectedState);
      setSelectedQualification(lastSelection.selectedQualification);
      setSelectedExam(lastSelection.selectedExam);
      setSelectedSubCategory(lastSelection.selectedSubCategory);
      setSelectedTier(lastSelection.selectedTier);
    }
  }, []);
  
  useEffect(() => {
    saveLastSelection({
        selectionLevel, selectedState, selectedQualification,
        selectedExam, selectedSubCategory, selectedTier,
    });
  }, [selectionLevel, selectedState, selectedQualification, selectedExam, selectedSubCategory, selectedTier]);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  const handleClearPreselectedTopic = useCallback(() => setPreselectedTopic(null), []);

  const selectionPath = useMemo(() => {
    if (selectionLevel === 'School Syllabus (NCERT)') {
        return [selectionLevel, selectedExam, selectedTier, selectedSubCategory].filter(Boolean).join(' - ');
    }
    return [
      selectionLevel === 'State Level' ? selectedState : selectionLevel,
      selectedExam,
      selectedSubCategory,
      selectedTier,
    ].filter(Boolean).join(' - ');
  }, [selectionLevel, selectedState, selectedExam, selectedSubCategory, selectedTier]);


  const isExamSelected = !!selectedSubCategory;

  const examCategories = useMemo(() => {
    if (selectionLevel === 'National Level') {
        return EXAM_DATA.national;
    }
    if (selectionLevel === 'State Level' && selectedState) {
        return EXAM_DATA.state[selectedState] || [];
    }
    return [];
  }, [selectionLevel, selectedState]);

  const subCategories = useMemo(() => {
    if (!selectedExam) return [];
    const category = examCategories.find(cat => cat.name === selectedExam);
    return category?.subCategories || [];
  }, [examCategories, selectedExam]);

  const tiers = useMemo(() => {
    if (!selectedSubCategory) return [];
    const subCategory = subCategories?.find(sub => sub.name === selectedSubCategory);
    return subCategory?.tiers || [];
  }, [subCategories, selectedSubCategory]);
  
  const { staticTopics, staticDetails } = useMemo(() => {
      let topics: string[] | undefined, details: ExamDetailGroup[] | undefined;
      const subCat = subCategories?.find(sc => sc.name === selectedSubCategory);
      if (selectedTier) {
          const tier = subCat?.tiers?.find(t => t.name === selectedTier);
          topics = tier?.topics; details = tier?.details;
      } else {
          topics = subCat?.topics; details = subCat?.details;
      }
      return { staticTopics: topics, staticDetails: details };
  }, [subCategories, selectedSubCategory, selectedTier]);

  const examTopics = useMemo(() => staticTopics ?? (dynamicExamDetails?.topics ?? []), [staticTopics, dynamicExamDetails]);

  const handleSelectionLevelChange = useCallback((level: string) => {
    setSelectionLevel(level);
    setSelectedState(''); setSelectedQualification(''); setSelectedExam('');
    setSelectedSubCategory(''); setSelectedTier('');
    setDynamicExamDetails(null); setDynamicDetailsError(null);
    setQualificationExams([]); setQualificationExamsError(null);
  }, []);

  const handleResetSelection = useCallback(() => {
    handleSelectionLevelChange('');
    setView(AppView.HOME);
  }, [handleSelectionLevelChange]);

  const handleSubCategoryChange = (subCategory: string) => {
      setSelectedSubCategory(subCategory);
      setSelectedTier('');
      setDynamicExamDetails(null);
      setDynamicDetailsError(null);
  };
  
  const handleClassChange = useCallback((className: string) => {
    setSelectedExam(className);
    setSelectedTier('');
    setSelectedSubCategory('');
  }, []);

  const handleStreamChange = useCallback((streamName: string) => {
    setSelectedTier(streamName);
    setSelectedSubCategory('');
  }, []);


  useEffect(() => {
    if (selectionLevel === 'Exams by Qualification' && selectedQualification) {
      const fetchExams = async () => {
        setIsQualificationExamsLoading(true);
        setQualificationExamsError(null);
        setQualificationExams([]);
        try {
          const exams = await generateExamsByQualification(selectedQualification, language);
          setQualificationExams(exams);
        } catch (err) {
          setQualificationExamsError(getSpecificErrorMessage(err));
        }
        setIsQualificationExamsLoading(false);
      };
      fetchExams();
    }
  }, [selectedQualification, language, selectionLevel]);

  useEffect(() => {
    const shouldFetchDynamically = (selectionLevel === 'National Level' || selectionLevel === 'State Level') && selectedSubCategory && subCategories && subCategories.length > 0 && !staticTopics && !staticDetails;
    const shouldFetchForQualification = selectionLevel === 'Exams by Qualification' && selectedSubCategory && selectedExam;
    const shouldFetchForSchool = selectionLevel === 'School Syllabus (NCERT)' && selectedExam && selectedSubCategory;

    if (shouldFetchDynamically || shouldFetchForQualification || shouldFetchForSchool) {
      const fetchDynamicDetails = async () => {
        setIsDynamicDetailsLoading(true);
        setDynamicDetailsError(null);
        try {
            let examCategoryForAPI = selectedExam;
            let subCategoryForAPI = selectedSubCategory;
            let tierForAPI = selectedTier;

            if (selectionLevel === 'School Syllabus (NCERT)') {
                examCategoryForAPI = `NCERT ${selectedExam}${selectedTier ? ` ${selectedTier}` : ''}`;
                tierForAPI = ''; // Don't pass stream as tier to API
            } else {
                examCategoryForAPI = selectedExam;
            }

          const [topics, details] = await Promise.all([
            generateTopicsForExam(examCategoryForAPI, subCategoryForAPI, tierForAPI, language, selectionLevel),
            generateExamDetails(examCategoryForAPI, subCategoryForAPI, tierForAPI, language, selectionLevel)
          ]);
          if (topics.length === 0 && details.length === 0) {
            setDynamicDetailsError(`The AI could not find detailed information for "${selectedSubCategory}".`);
            setDynamicExamDetails({ topics: [], details: [] });
          } else {
            setDynamicExamDetails({ topics, details });
          }
        } catch (err) {
          setDynamicDetailsError(getSpecificErrorMessage(err));
        } finally {
          setIsDynamicDetailsLoading(false);
        }
      };
      fetchDynamicDetails();
    } else {
      setDynamicExamDetails(null);
      setDynamicDetailsError(null);
    }
  }, [selectedSubCategory, selectedExam, selectedTier, language, selectionLevel, subCategories, staticTopics, staticDetails]);

  const showPopup = (config: PopupConfig) => {
    setPopupState({
        isOpen: true,
        title: config.title,
        options: config.options,
        onSelect: (value: string) => {
            config.onSelect(value);
            setPopupState(prev => ({ ...prev, isOpen: false }));
        }
    });
  };

  const MainContent = () => {
    switch (view) {
      case AppView.STUDY: return <TopicExplorer topics={examTopics} language={language} isOnline={isOnline} showPopup={showPopup} user={user as User | null} />;
      case AppView.STUDY_HELPER: return <StudyHelper topics={examTopics} language={language} isOnline={isOnline} preselectedTopic={preselectedTopic} onClearPreselectedTopic={handleClearPreselectedTopic} showPopup={showPopup} user={user as User | null} />;
      case AppView.QUIZ: return <QuizGenerator topics={examTopics} language={language} isOnline={isOnline} preselectedTopic={preselectedTopic} onClearPreselectedTopic={handleClearPreselectedTopic} showPopup={showPopup} user={user as User | null} />;
      case AppView.LEARNING_TRACKER: return <LearningTracker topics={examTopics} selectionPath={selectionPath} user={user as User | null} />;
      case AppView.INTERVIEW: return <MockInterview language={language} isOnline={isOnline} showPopup={showPopup} />;
      case AppView.SYLLABUS_TRACKER: return <SyllabusTracker selectedExam={selectionPath} language={language} isOnline={isOnline} onTeachWithStory={(topic) => { setPreselectedTopic(topic); setView(AppView.STORY_TUTOR); }} user={user as User | null} />;
      case AppView.GUESS_PAPER: return <GuessPaperGenerator topics={examTopics} language={language} isOnline={isOnline} showPopup={showPopup} />;
      case AppView.RESULT_TRACKER: return <ResultTracker selection={{ selectedExam, selectedSubCategory, selectedTier }} language={language} isOnline={isOnline} />;
      case AppView.ADMIT_CARD_TRACKER: return <AdmitCardTracker selection={{ selectedExam, selectedSubCategory, selectedTier }} language={language} isOnline={isOnline} />;
      case AppView.APPLICATION_TRACKER: return <ApplicationTracker user={user as User | null} />;
      case AppView.AI_STUDY_PLAN: return <StudyPlanner setView={setView} setPreselectedTopic={setPreselectedTopic} selectionPath={selectionPath} availableTopics={examTopics} language={language} isOnline={isOnline} user={user as User | null} />;
      case AppView.TEACH_SHORTCUTS: return <TeachShortcuts language={language} isOnline={isOnline} showPopup={showPopup} />;
      case AppView.DOUBT_SOLVER: return <DoubtSolver language={language} isOnline={isOnline} />;
      case AppView.STORY_TUTOR: return <StoryTutor topic={preselectedTopic} language={language} isOnline={isOnline} onBack={() => setView(AppView.SYLLABUS_TRACKER)} />;
      case AppView.EXAM_DETAILS_VIEWER: return <ExamDetailsViewer 
            selectionPath={selectionPath}
            details={staticDetails ?? dynamicExamDetails?.details ?? []}
            isLoading={isDynamicDetailsLoading}
            error={dynamicDetailsError}
            onBack={() => setView(AppView.HOME)}
        />;
      case AppView.JOB_NOTIFICATIONS: return <JobNotificationsViewer language={language} isOnline={isOnline} onBack={() => setView(AppView.HOME)} />;
      case AppView.MIND_MAP: return <MindMapGenerator topics={examTopics} language={language} isOnline={isOnline} showPopup={showPopup} />;
      case AppView.CURRENT_AFFAIRS: return <CurrentAffairsAnalyst language={language} isOnline={isOnline} selectionPath={selectionPath} />;
      case AppView.DAILY_BRIEFING: return <DailyBriefing language={language} isOnline={isOnline} />;
      case AppView.HOME:
      default: return <Dashboard />;
    }
  };

    const RadialProgress: React.FC<{ percentage: number; size?: number; strokeWidth?: number; }> = ({ percentage, size=100, strokeWidth=10 }) => {
        const radius = (size - strokeWidth) / 2;
        const circumference = 2 * Math.PI * radius;
        const offset = circumference - (percentage / 100) * circumference;

        return (
            <div className="relative" style={{ width: size, height: size }}>
                <svg className="w-full h-full transform -rotate-90" viewBox={`0 0 ${size} ${size}`}>
                    <defs>
                        <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#2dd4bf" />
                            <stop offset="100%" stopColor="#0d9488" />
                        </linearGradient>
                    </defs>
                    <circle className="text-slate-200" strokeWidth={strokeWidth} stroke="currentColor" fill="transparent" r={radius} cx={size/2} cy={size/2} />
                    <circle 
                        stroke="url(#progressGradient)"
                        strokeWidth={strokeWidth}
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        strokeLinecap="round"
                        fill="transparent"
                        r={radius}
                        cx={size/2}
                        cy={size/2}
                        style={{ transition: 'stroke-dashoffset 0.5s ease-out' }}
                    />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-xl sm:text-2xl font-extrabold text-teal-700">{Math.round(percentage)}<span className="text-sm sm:text-base font-bold text-slate-500 mt-1">%</span></span>
            </div>
        );
    };

  const StatCard: React.FC<{ label: string; value: string | number; }> = ({ label, value }) => (
    <div className="bg-white p-4 rounded-xl border border-slate-200/80 flex items-center">
      <div>
        <p className="text-sm font-medium text-slate-600">{label}</p>
        <p className="text-xl font-bold text-slate-900">{value}</p>
      </div>
    </div>
  );

  const ToolLinkCard: React.FC<{ view: AppView; title: string; desc: string; disabled: boolean; setView: (v: AppView) => void; }> = 
  ({ view, title, desc, disabled, setView }) => (
    <button 
      onClick={() => setView(view)} 
      disabled={disabled}
      className="group w-full text-left p-4 bg-white rounded-xl border border-slate-200/80 shadow-sm hover:border-teal-400 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:hover:translate-y-0 disabled:cursor-not-allowed disabled:hover:shadow-sm disabled:hover:border-slate-200"
    >
      <div className="flex items-start">
        <div className="flex-grow">
          <h4 className="font-bold text-slate-900">{title}</h4>
          <p className="text-xs text-slate-500 mt-1">{desc}</p>
        </div>
        <span className="text-slate-400 group-hover:text-teal-500 transition-colors">→</span>
      </div>
    </button>
  );

  const Dashboard = () => {
    const [syllabusProgressData, setSyllabusProgressData] = useState<any>({});
    const [performanceStats, setPerformanceStats] = useState({ averageScore: 0, topicsStudied: 0 });
    
    const syllabusKey = selectionPath ? `${selectionPath}-${language}` : '';
    const isSchoolSyllabus = selectionLevel === 'School Syllabus (NCERT)';

    useEffect(() => {
        const loadData = async () => {
            if (user === 'loading') return;
            const uid = user ? user.uid : null;
            const [syllabusData, trackingData] = await Promise.all([
                getSyllabusProgress(uid),
                getTrackingData(uid)
            ]);
            
            setSyllabusProgressData(syllabusData);

            const totalQuizzes = trackingData.quizHistory.length;
            const totalScore = trackingData.quizHistory.reduce((sum, q) => sum + (q.score / q.totalQuestions) * 100, 0);
            const averageScore = totalQuizzes > 0 ? Math.round(totalScore / totalQuizzes) : 0;
            setPerformanceStats({ averageScore, topicsStudied: trackingData.studiedTopics.length });
        };
        loadData();
    }, [user, selectionPath, language]);
    
    const currentSyllabusProgress = syllabusProgressData[syllabusKey] || { checkedIds: [], syllabus: [] };

    const countTopics = useCallback((topics: SyllabusTopic[]): number => {
      return topics.reduce((acc, topic) => acc + 1 + (topic.children ? countTopics(topic.children) : 0), 0);
    }, []);

    const totalTopics = useMemo(() => countTopics(currentSyllabusProgress.syllabus), [currentSyllabusProgress.syllabus, countTopics]);
    const progressPercentage = totalTopics > 0 ? (currentSyllabusProgress.checkedIds.length / totalTopics) * 100 : 0;

    const studyTools = [
      { view: AppView.STUDY_HELPER, title: 'AI Study Helper', desc: 'Notes, summaries, and deep dives.', disabled: !isExamSelected },
      { view: AppView.QUIZ, title: 'Quiz Generator', desc: 'Create custom quizzes on any topic.', disabled: !isExamSelected },
      { view: AppView.GUESS_PAPER, title: 'Guess Paper', desc: 'AI-predicted exam questions.', disabled: !isExamSelected },
      { view: AppView.MIND_MAP, title: 'Mind Map Generator', desc: 'Visually explore topic connections.', disabled: !isExamSelected },
      { view: AppView.INTERVIEW, title: 'Mock Interview', desc: 'Practice with an AI interviewer.', disabled: isSchoolSyllabus },
      { view: AppView.TEACH_SHORTCUTS, title: 'Aptitude Shortcuts', desc: 'Learn problem-solving tricks.', disabled: isSchoolSyllabus },
      { view: AppView.DOUBT_SOLVER, title: 'Doubt Solver', desc: 'Get answers from a photo.', disabled: false },
    ];
    
    const trackingTools = [
        { view: AppView.SYLLABUS_TRACKER, title: 'Syllabus Tracker', desc: 'Generate and track your syllabus.', disabled: !isExamSelected },
        { view: AppView.AI_STUDY_PLAN, title: 'AI Study Plan', desc: 'Get a personalized study plan.', disabled: !isExamSelected },
        { view: AppView.APPLICATION_TRACKER, title: 'Application Tracker', desc: 'Save application credentials.', disabled: isSchoolSyllabus },
    ];

    const infoTools = [
      { view: AppView.JOB_NOTIFICATIONS, title: 'Job Notifications', desc: 'Latest govt job openings.', disabled: isSchoolSyllabus },
      { view: AppView.CURRENT_AFFAIRS, title: 'Current Affairs', desc: 'AI-powered news analysis.', disabled: false },
      { view: AppView.EXAM_DETAILS_VIEWER, title: isSchoolSyllabus ? 'Learning Objectives' : 'Eligibility & Details', desc: isSchoolSyllabus ? 'See key concepts for the subject.' : 'Check criteria, patterns, and more.', disabled: !isExamSelected },
      { view: AppView.RESULT_TRACKER, title: 'Result Tracker', desc: 'Check real-time result status.', disabled: !isExamSelected || isSchoolSyllabus },
      { view: AppView.ADMIT_CARD_TRACKER, title: 'Admit Card Tracker', desc: 'Track admit card availability.', disabled: !isExamSelected || isSchoolSyllabus },
    ];

    return (
      <div className="space-y-8">
        {!isExamSelected ? (
          <ExamSelectionWizard />
        ) : (
          <>
            <div className="p-6 bg-gradient-to-br from-teal-500 to-teal-600 text-white rounded-xl shadow-lg shadow-teal-500/30">
                <h2 className="text-3xl font-bold">Welcome back!</h2>
                <p className="opacity-80 mt-1">Your dashboard for <span className="font-semibold">{selectionPath}</span></p>
                <button onClick={handleResetSelection} className="text-sm font-semibold opacity-80 hover:opacity-100 mt-2">Change Exam →</button>
            </div>
            
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-1 !p-4 flex flex-col items-center justify-center text-center">
                    <h3 className="font-bold text-slate-700 mb-2">Syllabus Progress</h3>
                    <RadialProgress percentage={progressPercentage} size={140} strokeWidth={12} />
                    <p className="text-xs text-slate-500 mt-2">{currentSyllabusProgress.checkedIds.length} of {totalTopics} topics complete</p>
                </Card>
                <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                   <StatCard label="Avg. Quiz Score" value={`${performanceStats.averageScore}%`} />
                   <StatCard label="Topics Studied" value={performanceStats.topicsStudied} />
                   <div className="sm:col-span-2">
                     <button onClick={() => setView(AppView.DAILY_BRIEFING)} className="w-full h-full text-left p-4 bg-teal-600 text-white rounded-xl shadow-lg shadow-teal-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                        <div className="flex items-center">
                            <div className="flex-grow">
                                <h3 className="text-lg font-bold">Today's AI Briefing</h3>
                                <p className="opacity-80 mt-1 text-sm">Get your daily dose of current affairs.</p>
                            </div>
                        </div>
                    </button>
                   </div>
                </div>
            </div>
            
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-800 mb-4">Study & Practice</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {studyTools.map(tool => <ToolLinkCard key={tool.title} {...tool} setView={setView} />)}
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-800 mb-4">Track & Analyze</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {trackingTools.map(tool => <ToolLinkCard key={tool.title} {...tool} setView={setView} />)}
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-800 mb-4">Information Hub</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {infoTools.map(tool => <ToolLinkCard key={tool.title} {...tool} setView={setView} />)}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    );
  };

  const ExamSelectionWizard = () => {
    
    const SelectionCard: React.FC<{title: string; subtitle?: string; onClick: () => void;}> = ({ title, subtitle, onClick }) => (
      <button onClick={onClick} className="w-full h-full p-4 text-center bg-white rounded-xl border-2 border-slate-200 hover:border-teal-500 hover:bg-teal-50/50 hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-teal-400 flex flex-col justify-center">
        <h4 className="font-bold text-slate-800 text-base leading-tight">{title}</h4>
        {subtitle && <p className="text-sm text-slate-500 mt-1">{subtitle}</p>}
      </button>
    );

    const renderStep1_Level = () => (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 h-auto">
           {SELECTION_LEVELS.map(level => (
               <div key={level} className="h-28">
                 <SelectionCard title={level} onClick={() => handleSelectionLevelChange(level)} />
               </div>
           ))}
        </div>
    );

    const renderStep2_StateOrQual = () => (
        <>
            {selectionLevel === 'State Level' && 
                <PopupSelector 
                    label="Choose your state"
                    value={selectedState}
                    placeholder="Select a state..."
                    onClick={() => setPopupState({
                        isOpen: true,
                        title: 'Choose your state',
                        options: INDIAN_STATES.map(s => ({ value: s.name, label: s.name, subtitle: s.capital })),
                        onSelect: (state) => {
                            setSelectedState(state);
                            setPopupState(prev => ({ ...prev, isOpen: false }));
                        }
                    })}
                />
            }
            {selectionLevel === 'Exams by Qualification' && 
                <PopupSelector 
                    label="Choose your qualification"
                    value={selectedQualification}
                    placeholder="Select a qualification..."
                    onClick={() => setPopupState({
                        isOpen: true,
                        title: 'Choose your qualification',
                        options: QUALIFICATION_CATEGORIES.map(q => ({ value: q, label: q })),
                        onSelect: (qual) => {
                            setSelectedQualification(qual);
                            setPopupState(prev => ({ ...prev, isOpen: false }));
                        }
                    })}
                />
            }
        </>
    );
    
    const renderStep_School_Class = () => (
        <PopupSelector 
            label="Choose your class"
            value={selectedExam}
            placeholder="Select a class..."
            onClick={() => showPopup({
                title: 'Choose your class',
                options: SCHOOL_CLASSES.map(c => ({ value: c, label: c })),
                onSelect: handleClassChange
            })}
        />
    );

    const renderStep_School_Stream = () => (
        <PopupSelector 
            label="Choose your stream"
            value={selectedTier}
            placeholder="Select a stream..."
            onClick={() => showPopup({
                title: 'Choose your stream',
                options: SCHOOL_STREAMS.map(s => ({ value: s, label: s })),
                onSelect: handleStreamChange
            })}
        />
    );

    const renderStep_School_Subject = () => {
        const classNum = parseInt(selectedExam.split(' ')[1] || '0');
        let subjectKey = '';
        if (classNum >= 6 && classNum <= 8) subjectKey = 'junior';
        else if (classNum >= 9 && classNum <= 10) subjectKey = 'secondary';
        else if ((classNum === 11 || classNum === 12) && selectedTier) subjectKey = `${selectedExam}_${selectedTier}`;
        
        const subjects = SCHOOL_SUBJECTS[subjectKey] || [];

        return (
            <PopupSelector 
                label="Choose your subject"
                value={selectedSubCategory}
                placeholder="Select a subject..."
                onClick={() => showPopup({
                    title: 'Choose your subject',
                    options: subjects.map(s => ({ value: s, label: s })),
                    onSelect: setSelectedSubCategory
                })}
            />
        );
    };

    const renderStep3_Category = () => {
        if (isQualificationExamsLoading) return <LoadingSpinner />;
        if (qualificationExamsError) return <p className="text-red-500">{qualificationExamsError}</p>;

        const examsToList = selectionLevel === 'Exams by Qualification' ? qualificationExams : examCategories;
        if (examsToList.length === 0) return <p className="text-slate-500">No exams found for this selection.</p>;

        return (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {examsToList.map(exam => (
                    <SelectionCard 
                        key={exam.name || exam.examName} 
                        title={exam.name || exam.examName} 
                        subtitle={(exam as ExamByQualification).examCategory}
                        onClick={() => {
                            if (selectionLevel === 'Exams by Qualification') {
                                setSelectedExam((exam as ExamByQualification).examCategory);
                                handleSubCategoryChange((exam as ExamByQualification).examName);
                            } else {
                                setSelectedExam(exam.name);
                            }
                        }} 
                    />
                ))}
            </div>
        );
    };

    const renderStep4_SubCategory = () => (
        subCategories && subCategories.length > 0 ? (
            <PopupSelector
                label="Select a sub-category or specific exam"
                value={selectedSubCategory}
                placeholder="Select..."
                onClick={() => setPopupState({
                    isOpen: true,
                    title: 'Select a sub-category',
                    options: subCategories.map(s => ({ value: s.name, label: s.name })),
                    onSelect: (subCat) => {
                        handleSubCategoryChange(subCat);
                        setPopupState(prev => ({ ...prev, isOpen: false }));
                    }
                })}
            />
        ) : (isDynamicDetailsLoading ? <LoadingSpinner/> : <p className="text-slate-500">This exam has no further sub-categories. You can now use the tools.</p>)
    );

    const renderStep5_Tier = () => (
        tiers && tiers.length > 0 ? (
            <PopupSelector
                label="Select a tier or stage (if applicable)"
                value={selectedTier}
                placeholder="Select a tier..."
                onClick={() => setPopupState({
                    isOpen: true,
                    title: 'Select a tier',
                    options: tiers.map(t => ({ value: t.name, label: t.name })),
                    onSelect: (tier) => {
                        setSelectedTier(tier);
                        setPopupState(prev => ({ ...prev, isOpen: false }));
                    }
                })}
            />
        ) : null
    );

    const renderWizardSteps = () => {
        if (!selectionLevel) {
            return renderStep1_Level();
        }
        if (selectionLevel === 'School Syllabus (NCERT)') {
            if (!selectedExam) return renderStep_School_Class();
            const classNum = parseInt(selectedExam.split(' ')[1]);
            if ((classNum === 11 || classNum === 12) && !selectedTier) return renderStep_School_Stream();
            if (!selectedSubCategory) return renderStep_School_Subject();
        }
        if (selectionLevel === 'National Level') {
            if (!selectedExam) return renderStep3_Category();
            if (!selectedSubCategory && subCategories && subCategories.length > 0) return renderStep4_SubCategory();
            if (selectedSubCategory && tiers && tiers.length > 0 && !selectedTier) return renderStep5_Tier();
        }
        if (selectionLevel === 'State Level') {
            if (!selectedState) return renderStep2_StateOrQual();
            if (!selectedExam) return renderStep3_Category();
            if (!selectedSubCategory && subCategories && subCategories.length > 0) return renderStep4_SubCategory();
            if (selectedSubCategory && tiers && tiers.length > 0 && !selectedTier) return renderStep5_Tier();
        }
        if (selectionLevel === 'Exams by Qualification') {
            if (!selectedQualification) return renderStep2_StateOrQual();
            if (!selectedExam && !selectedSubCategory) return renderStep3_Category();
        }
        return null;
    };
    
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80">
          <div className="p-8 text-center bg-teal-50 rounded-t-2xl border-b border-slate-200/80">
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-4">Start Your Journey!</h2>
              <p className="text-slate-600 mt-2 max-w-xl mx-auto">Select your exam category to unlock personalized tools and AI-powered study assistance.</p>
          </div>
          <div className="p-6 sm:p-8">
              <div className="space-y-6">
                  {renderWizardSteps()}
                  {dynamicDetailsError && <p className="text-red-500 bg-red-100 p-3 rounded-md">{dynamicDetailsError}</p>}
              </div>
              
              {selectionLevel && (
                  <div className="mt-8 pt-6 border-t border-slate-200/80">
                      <Button variant="secondary" onClick={handleResetSelection}>Start Over</Button>
                  </div>
              )}
          </div>
      </div>
    );
  };
  
  const NavItem: React.FC<{ view: AppView; label: string; currentView: AppView; setView: (v: AppView) => void; isSidebar?: boolean; disabled?: boolean; }> = 
  ({ view, label, currentView, setView, isSidebar = false, disabled = false }) => {
    const isActive = view === currentView;
    const baseClasses = `flex transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed relative`;
    const activeClasses = isSidebar 
      ? 'bg-teal-50 text-teal-600 font-semibold' 
      : 'text-teal-600';
    const inactiveClasses = isSidebar 
      ? 'text-slate-600 hover:bg-slate-100 hover:text-slate-900' 
      : 'text-slate-500 hover:bg-slate-100';
    const layoutClasses = isSidebar 
      ? 'items-center p-3 rounded-lg w-full text-left' 
      : 'flex-col items-center justify-center flex-1 py-2';
    
    return (
      <button onClick={() => { setView(view); setIsSidebarOpen(false); }} disabled={disabled} className={`${baseClasses} ${layoutClasses} ${isActive ? activeClasses : inactiveClasses}`}>
        {isActive && isSidebar && <div className="absolute left-0 top-2 bottom-2 w-1 bg-teal-500 rounded-r-full"></div>}
        <span className={`text-sm font-semibold ${isSidebar ? 'ml-3' : ''}`}>{label}</span>
        {isActive && !isSidebar && <div className="absolute bottom-0 left-4 right-4 h-1 bg-teal-500 rounded-t-full"></div>}
      </button>
    );
  };
  
  const navItems = [
    { view: AppView.HOME, label: "Dashboard" },
    { view: AppView.STUDY_HELPER, label: "Study", disabled: !isExamSelected },
    { view: AppView.LEARNING_TRACKER, label: "Insights" },
  ];
  

  const getLanguageAbbreviation = (lang: string): string => {
    if (!lang) return 'En';
    if (lang.includes('+')) {
        const parts = lang.split('+').map(part => part.trim().split('(')[0].trim());
        const firstAbbr = parts[0].substring(0, 1);
        const secondAbbr = parts[1].substring(0, 1);
        return `${firstAbbr}/${secondAbbr}`;
    }
    const mainLang = lang.split('(')[0].trim();
    return mainLang.substring(0, 2);
  };

  const handleLanguageButtonClick = () => {
    setPopupState({
        isOpen: true,
        title: 'Select Language',
        options: LANGUAGES.map(lang => ({ value: lang, label: lang })),
        onSelect: (selectedLang) => {
            setLanguage(selectedLang);
            setPopupState(prev => ({ ...prev, isOpen: false }));
        }
    });
  };

  const handleBack = () => {
    window.history.back();
  };

  return (
    <div className="flex h-full bg-slate-100">
      {/* Sidebar for md and up */}
      <aside className={`fixed lg:relative inset-y-0 left-0 z-40 w-64 bg-white border-r border-slate-200 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 transition-transform duration-300 ease-in-out`}>
        <div className="flex items-center justify-between p-4 border-b border-slate-200 h-16">
          <div className="text-xl font-bold text-slate-800 hover:text-teal-700 transition-colors text-left">
              Club of Competition
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-1 text-slate-500 hover:text-slate-800">
              X
          </button>
        </div>
        <nav className="p-4 space-y-2">
            {navItems.map(item => <NavItem key={item.label} {...item} currentView={view} setView={setView} isSidebar />)}
        </nav>
      </aside>

      <div className="flex-1 flex flex-col h-full w-full">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200/80">
          <div className="flex items-center justify-between p-2 sm:p-4 h-16">
            <div className="flex items-center gap-2">
              <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-1 text-slate-500" aria-label="Open menu">
                  <Bars3Icon className="w-6 h-6" />
              </button>
              {view !== AppView.HOME && (
                  <button onClick={handleBack} className="p-1 text-slate-500 hover:text-slate-800" aria-label="Go back">
                      <ArrowLeftIcon className="w-6 h-6" />
                  </button>
              )}
            </div>
            <div className="flex-shrink min-w-0 text-sm font-semibold text-teal-800 bg-teal-100/80 px-3 py-1.5 rounded-full flex items-center gap-2" title={selectionPath}>
              <span className="truncate">{selectionPath ? selectionPath : 'No Exam Selected'}</span>
            </div>
             <div className="flex items-center gap-2 sm:gap-4">
                 <button 
                    onClick={handleLanguageButtonClick} 
                    className="flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-teal-600 px-2 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                    aria-label={`Change language, current is ${language}`}
                 >
                    <span>{getLanguageAbbreviation(language)}</span>
                 </button>
                 {user === 'loading' ? null : user ? (
                      <div className="relative group">
                        <button className="flex items-center gap-2 p-1.5 rounded-full hover:bg-slate-100" aria-label="User menu">
                           <UserCircleIcon className="w-7 h-7 text-slate-500"/>
                        </button>
                        <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-slate-200 p-1 opacity-0 group-hover:opacity-100 invisible group-hover:visible transition-all duration-200 z-10">
                            <div className="px-2 py-1.5 text-sm text-slate-600 border-b mb-1 truncate">{user.displayName || user.email}</div>
                            <button onClick={handleLogout} className="w-full text-left flex items-center gap-2 px-2 py-1.5 text-sm text-slate-700 rounded-md hover:bg-slate-100">
                                <ArrowRightOnRectangleIcon className="w-4 h-4" />
                                <span>Logout</span>
                            </button>
                        </div>
                    </div>
                 ) : (
                    <Button variant="secondary" onClick={handleGoogleLogin} disabled={isLoggingIn}>
                      {isLoggingIn ? 'Signing in...' : 'Login'}
                    </Button>
                 )}
             </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
            <div className="pb-20 lg:pb-0">
                <MainContent />
            </div>
        </main>
      </div>

      {/* Bottom Nav for mobile */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 lg:hidden flex justify-around bg-white/80 backdrop-blur-md border-t border-slate-200 shadow-[0_-2px_5px_rgba(0,0,0,0.05)] p-1 gap-1">
        {navItems.map(item => (
            <NavItem key={item.label} {...item} currentView={view} setView={setView} />
        ))}
      </nav>
      
      <SelectionPopup 
        isOpen={popupState.isOpen}
        onClose={() => setPopupState({ ...popupState, isOpen: false })}
        title={popupState.title}
        options={popupState.options}
        onSelect={popupState.onSelect}
      />
      {notification && (
        <NotificationBanner 
            message={notification.message}
            type={notification.type}
            onDismiss={() => setNotification(null)}
        />
      )}
    </div>
  );
};

export default App;
