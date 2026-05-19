
import React, { useState, useEffect, useCallback, useRef, Suspense, lazy } from 'react';
import { 
    getDisplaySettings, saveDisplaySettings, getLastSelection, saveLastSelection, 
    isLastSelectionValid, getUserSession, saveUserSession, 
    logActivity, saveComponentState, 
    getComponentState, syncComponentStatesFromCloud 
} from './utils/tracking';
import { 
    generateExamDetails, generateStudyNotes, generateTutorialForTopic, 
    fetchLatestJobNotifications, generateSyllabusForExam 
} from './services/geminiService';
import { 
    onAuthStateChange, getUserDoc, handleSignOut, getUserProfile, 
    ensureAdminPermissions, getUserDisplaySettings, saveUserDisplaySettings,
    retryFailedExports, syncSession, listenToSession
} from './firebase';
import { ADMIN_EMAILS, EXAM_DATA } from './constants';
import { getSpecificErrorMessage } from './utils/errors';
import type { 
    User, PopupConfig, DisplaySettings, LastSelection, Syllabus, 
    Notification, StudyMaterial, Tutorial, ExamDetailGroup, JobNotification, 
    ExamCategory, UserSession, HistoryType 
} from './types';
import { AppView } from './types';
import { App as CapacitorApp } from '@capacitor/app';
import { Network } from '@capacitor/network';

// Eager imports for Shell (Critical Path)
import Dashboard from './components/Dashboard';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import MobileTaskbar from './components/MobileTaskbar';
import StartupLoading from './components/StartupLoading';
import LoginPrompt from './components/LoginPrompt';
import NotificationBanner from './components/NotificationBanner';
import AuthModal from './components/AuthModal';
import { OfflineBanner } from './components/OfflineBanner';
import LoadingSpinner from './components/LoadingSpinner';

// Retry Logic for Lazy Loading - Optimized for Speed
const lazyRetry = (componentImport: () => Promise<any>, retriesLeft = 3) => {
  return lazy(async () => {
    try {
      return await componentImport();
    } catch (error) {
      if (retriesLeft === 0) {
        console.error("Chunk load failed after retries:", error);
        throw error;
      }
      // Faster retry (500ms instead of 1500ms)
      await new Promise(resolve => setTimeout(resolve, 500));
      return await componentImport().catch(() => {
          const retry = async (attempts: number): Promise<any> => {
              try {
                  return await componentImport();
              } catch (e) {
                  if (attempts === 0) throw e;
                  await new Promise(r => setTimeout(r, 500));
                  return retry(attempts - 1);
              }
          };
          return retry(retriesLeft - 1);
      });
    }
  });
};

// Lazy Imports for Views (Load on demand with retry)
const AskAiAnything = lazyRetry(() => import('./components/AskAiAnything'));
const LearningTracker = lazyRetry(() => import('./components/LearningTracker'));
const UserProfileComponent = lazyRetry(() => import('./components/UserProfile'));
const TopicExplorer = lazyRetry(() => import('./components/TopicExplorer'));
const QuizGenerator = lazyRetry(() => import('./components/QuizGenerator'));
const MockInterview = lazyRetry(() => import('./components/MockInterview'));
const JobNotificationsViewer = lazyRetry(() => import('./components/JobNotificationsViewer'));
const ExamDetailsViewer = lazyRetry(() => import('./components/ExamDetailsViewer'));
const PreviousYearQuestions = lazyRetry(() => import('./components/PreviousYearQuestions'));
const Tools = lazyRetry(() => import('./components/Tools'));
const CurrentAffairsAnalyst = lazyRetry(() => import('./components/CurrentAffairsAnalyst'));
const MindMapGenerator = lazyRetry(() => import('./components/MindMapGenerator'));
const GuessPaperGenerator = lazyRetry(() => import('./components/GuessPaperGenerator'));
const StudyPlanner = lazyRetry(() => import('./components/StudyPlanner'));
const TeachShortcuts = lazyRetry(() => import('./components/TeachShortcuts'));
const DoubtSolver = lazyRetry(() => import('./components/DoubtSolver'));
const ConceptLinkMap = lazyRetry(() => import('./components/ConceptLinkMap'));
const TeachBackMode = lazyRetry(() => import('./components/TeachBackMode'));
const SelfSummaryChallenge = lazyRetry(() => import('./components/SelfSummaryChallenge'));
const RealLifeExamples = lazyRetry(() => import('./components/RealLifeExamples'));
const CareerCompass = lazyRetry(() => import('./components/CareerCompass'));
const AiResumeBuilder = lazyRetry(() => import('./components/AiResumeBuilder'));
const FlashcardsGenerator = lazyRetry(() => import('./components/FlashcardsGenerator'));
const ScientificCalculator = lazyRetry(() => import('./components/ScientificCalculator'));
const AdaptiveLearningPath = lazyRetry(() => import('./components/AdaptiveLearningPath'));
const AdminDashboard = lazyRetry(() => import('./components/AdminDashboard'));
const StoryTutorGenerator = lazyRetry(() => import('./components/StoryTutorGenerator'));
const LearningTechniques = lazyRetry(() => import('./components/LearningTechniques'));
const MapInteractiveLearning = lazyRetry(() => import('./components/MapInteractiveLearning'));

// Lazy Imports for Heavy Modals
const ExamSelectionWizard = lazyRetry(() => import('./components/ExamSelectionWizard'));
const SelectionPopup = lazyRetry(() => import('./components/SelectionPopup'));
const DisplaySettingsPopup = lazyRetry(() => import('./components/DisplaySettingsPopup'));
const StudyMaterialModal = lazyRetry(() => import('./components/StudyMaterialModal'));
const StoryTutorModal = lazyRetry(() => import('./components/StoryTutor'));
const TutorialModal = lazyRetry(() => import('./components/TutorialModal'));

const App: React.FC = () => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);
    const [appMode, setAppMode] = useState<'user' | 'admin'>('user');
    const [showAuthModal, setShowAuthModal] = useState(false);

    const [view, setView] = useState<AppView>(() => {
        try {
            const sessionStr = localStorage.getItem('global_last_session');
            if (sessionStr) {
                const session = JSON.parse(sessionStr);
                return session.lastView || AppView.HOME;
            }
        } catch (e) {}
        return AppView.HOME;
    });
    
    const [history, setHistory] = useState<AppView[]>(() => {
        try {
            const sessionStr = localStorage.getItem('global_last_session');
            if (sessionStr) {
                const session = JSON.parse(sessionStr);
                return session.history || [];
            }
        } catch (e) {}
        return [];
    });

    const [isNavMenuOpen, setIsNavMenuOpen] = useState(false);
    const [popupConfig, setPopupConfig] = useState<PopupConfig | null>(null);
    const [displaySettings, setDisplaySettings] = useState<DisplaySettings>(() => getDisplaySettings());
    const [lastSelection, setLastSelection] = useState<LastSelection | null>(null);
    const [syllabus, setSyllabus] = useState<Syllabus>([]);
    const [isSyllabusLoading, setIsSyllabusLoading] = useState(false);
    const [syllabusError, setSyllabusError] = useState<string | null>(null);
    const [isExamWizardOpen, setIsExamWizardOpen] = useState(false);
    
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [notification, setNotification] = useState<Notification | null>(null);
    const [isDisplaySettingsOpen, setIsDisplaySettingsOpen] = useState(false);
    const [isAuthInProgress, setIsAuthInProgress] = useState(false);

    // Single device limit session tracking
    const [sessionId] = useState(() => {
        const existing = localStorage.getItem('app_session_id');
        if (existing) return existing;
        const newId = Math.random().toString(36).substring(2) + Date.now().toString(36);
        localStorage.setItem('app_session_id', newId);
        return newId;
    });

    const [isStudyModalOpen, setIsStudyModalOpen] = useState(() => getComponentState<boolean>('isStudyModalOpen') || false);
    const [studyModalTopic, setStudyModalTopic] = useState<{ topic: string, mainTopic?: string } | null>(() => getComponentState('studyModalTopic'));
    const [studyMaterial, setStudyMaterial] = useState<StudyMaterial | null>(() => getComponentState('studyMaterial'));
    const [isStudyMaterialLoading, setIsStudyMaterialLoading] = useState(false);
    const [studyMaterialError, setStudyMaterialError] = useState<string | null>(null);

    const [isStoryModalOpen, setIsStoryModalOpen] = useState(false);
    const [storyModalTopic, setStudyStoryTopic] = useState<string | null>(null);

    const [isTutorialModalOpen, setIsTutorialModalOpen] = useState(() => getComponentState<boolean>('isTutorialModalOpen') || false);
    const [tutorialModalTopic, setTutorialModalTopic] = useState<string | null>(() => getComponentState('tutorialModalTopic'));
    const [tutorial, setTutorial] = useState<Tutorial | null>(() => getComponentState('tutorial'));
    const [isTutorialLoading, setIsTutorialLoading] = useState(false);
    const [tutorialError, setTutorialError] = useState<string | null>(null);

    const [currentTopic, setCurrentTopic] = useState<string | null>(null);

    const [examDetails, setExamDetails] = useState<ExamDetailGroup[]>([]);
    const [isExamDetailsLoading, setIsExamDetailsLoading] = useState(false);
    const [examDetailsError, setExamDetailsError] = useState<string | null>(null);
    
    const [jobCount, setJobCount] = useState<number>(0);
    const [selectedJob, setSelectedJob] = useState<JobNotification | null>(null);

    const isLoggingOut = useRef(false);
    const backHandlerRef = useRef<(() => boolean) | null>(null);
    
    const selectionPath = lastSelection ? [
        lastSelection.selectionLevel === 'State Level' ? lastSelection.selectedState : '',
        lastSelection.selectedExam, 
        lastSelection.selectedSubCategory, 
        lastSelection.selectedTier
    ].filter(Boolean).join(' > ') : 'No Exam Selected';

    const fetchExamData = useCallback(async (selection: LastSelection): Promise<Syllabus | null> => {
        if (
            (selection.selectionLevel === 'National Level' && (!selection.selectedExam || !selection.selectedSubCategory)) ||
            (selection.selectionLevel === 'State Level' && (!selection.selectedState || !selection.selectedExam || !selection.selectedSubCategory)) ||
            (selection.selectionLevel === 'Entrance Exams' && (!selection.selectedExam || !selection.selectedSubCategory)) ||
            (selection.selectionLevel === 'Exams by Qualification' && !selection.selectedQualification) ||
            (selection.selectionLevel === 'School Syllabus (NCERT)' && (!selection.selectedExam || !selection.selectedTier))
        ) {
            setSyllabus([]);
            return null;
        }

        if (selection.selectionLevel === 'Exams by Qualification') {
            setSyllabus([]);
            return null;
        }

        setIsSyllabusLoading(true);
        setSyllabusError(null);
        setSyllabus([]);

        try {
            let syllabusData: Syllabus | undefined;

            if (selection.selectionLevel === 'School Syllabus (NCERT)') {
                syllabusData = await generateSyllabusForExam(selection.selectedExam, selection.selectedSubCategory, selection.selectedTier, displaySettings.language, selection.selectionLevel, selection.selectedState);
            } else {
                const examListSource = (
                    selection.selectionLevel === 'National Level' ? EXAM_DATA.national :
                    selection.selectionLevel === 'State Level' ? EXAM_DATA.state[selection.selectedState as keyof typeof EXAM_DATA.state] :
                    EXAM_DATA.entrance
                ) as ExamCategory[];

                const exam = examListSource?.find(e => e.name === selection.selectedExam);
                const subCategory = exam?.subCategories?.find(sc => sc.name === selection.selectedSubCategory);

                if (selection.selectedTier) {
                    const tierObj = subCategory?.tiers?.find(t => t.name === selection.selectedTier);
                    const subSubCategoryObj = subCategory?.subCategories?.find(ssc => ssc.name === selection.selectedTier);
                    syllabusData = tierObj?.syllabus || subSubCategoryObj?.syllabus;
                } else {
                    syllabusData = subCategory?.syllabus;
                }

                if (!syllabusData) {
                    syllabusData = await generateSyllabusForExam(
                        selection.selectedExam, 
                        selection.selectedSubCategory, 
                        selection.selectedTier, 
                        displaySettings.language, 
                        selection.selectionLevel,
                        selection.selectedState
                    );
                }
            }
            
            setSyllabus(syllabusData || []);
            return syllabusData || null;
        } catch (error) {
            console.error("Failed to fetch exam data:", error);
            setSyllabusError(getSpecificErrorMessage(error));
            return null;
        } finally {
            setIsSyllabusLoading(false);
        }
    }, [displaySettings.language]);
    
    const handleRefreshSyllabus = useCallback(() => {
        if (lastSelection) fetchExamData(lastSelection);
    }, [lastSelection, fetchExamData]);

    // Handle language change: refetch syllabus if the language changes
    useEffect(() => {
        if (lastSelection) {
            fetchExamData(lastSelection);
        }
    }, [displaySettings.language, fetchExamData]);

    useEffect(() => {
        const unsubscribe = onAuthStateChange(async (firebaseUser) => {
            try {
                if (firebaseUser) {
                    if (isLoggingOut.current) {
                        return;
                    }

                    const isGoogle = firebaseUser.providerData.some(p => p?.providerId === 'google.com');
                    const isNew = firebaseUser.metadata.creationTime === firebaseUser.metadata.lastSignInTime;
                    if (isGoogle && isNew) return;

                    const userDoc = await getUserDoc(firebaseUser.uid);
                    
                    if (userDoc?.isBlocked) {
                        await handleSignOut();
                        setNotification({ type: 'error', message: "Your account has been blocked. Please contact support." });
                        return;
                    }

                    let isUserAdmin = false;
                    if (firebaseUser.email) {
                        isUserAdmin = ADMIN_EMAILS.some(email => email.toLowerCase() === firebaseUser.email!.toLowerCase());
                    }
                    
                    if (isUserAdmin) {
                        try { await ensureAdminPermissions(firebaseUser.uid); } catch (err) { console.error("Failed to sync admin permissions:", err); }
                    }
                    
                    setIsAdmin(isUserAdmin);
                    setAppMode('user');
                    
                    const loggedInUser: User = {
                        uid: firebaseUser.uid,
                        displayName: firebaseUser.displayName,
                        email: firebaseUser.email,
                        photoURL: firebaseUser.photoURL,
                        isAdmin: isUserAdmin,
                        createdAt: firebaseUser.metadata.creationTime,
                    };
                    setUser(loggedInUser);
        
                    const localSettings = getDisplaySettings();
                    setDisplaySettings(localSettings);

                    // Fetch critical local data first, let cloud states sync in background
                    const [selection, session] = await Promise.all([
                        getLastSelection(loggedInUser.uid),
                        getUserSession(loggedInUser.uid)
                    ]);

                    Promise.all([
                        getUserDisplaySettings(loggedInUser.uid),
                        syncComponentStatesFromCloud(loggedInUser.uid)
                    ]).then(([cloudSettings]) => {
                        if (cloudSettings) {
                            setDisplaySettings(cloudSettings);
                            saveDisplaySettings(cloudSettings);
                        } else {
                            // If no cloud settings, upload local as default
                            const current = getDisplaySettings();
                            saveUserDisplaySettings(loggedInUser.uid, current).catch(console.warn);
                        }
                    }).catch(console.warn);

                    if (session) {
                        setView(session.lastView);
                        if (session.history) setHistory(session.history);
                        if (session.context?.currentTopic) setCurrentTopic(session.context.currentTopic);
                    }
                    
                    if (isLastSelectionValid(selection)) {
                        setLastSelection(selection);
                        fetchExamData(selection);
                    } 

                } else {
                    setUser(null);
                    setIsAdmin(false);

                    // Load guest session if not logging out
                    if (!isLoggingOut.current) {
                        const [guestSession, guestSelection] = await Promise.all([
                            getUserSession(null),
                            getLastSelection(null)
                        ]);
                        
                        if (guestSession) {
                            setView(guestSession.lastView);
                            if (guestSession.history) setHistory(guestSession.history);
                            if (guestSession.context?.currentTopic) setCurrentTopic(guestSession.context.currentTopic);
                        }
                        
                        if (isLastSelectionValid(guestSelection)) {
                            setLastSelection(guestSelection);
                            fetchExamData(guestSelection);
                        }
                    }

                    if (isLoggingOut.current) {
                        setView(AppView.HOME);
                        setHistory([]);
                        setLastSelection(null);
                        setSyllabus([]);
                        isLoggingOut.current = false;
                        
                        saveComponentState('isStudyModalOpen', null, user?.uid || null);
                        saveComponentState('studyModalTopic', null, user?.uid || null);
                        saveComponentState('isTutorialModalOpen', null, user?.uid || null);
                        saveComponentState('tutorialModalTopic', null, user?.uid || null);
                        
                        const keysToRemove = [
                            'quiz_active_state', 'mindmap_active_state', 'interview_active_state',
                            'topic_explorer_state', 'guess_paper_state', 'study_roadmap_state',
                            'shortcuts_state', 'doubt_solver_state',
                            'concept_map_state', 'teach_back_state', 'summary_challenge_state',
                            'real_life_examples_state', 'career_compass_state', 'resume_builder_state',
                            'flashcards_state', 'pyq_state', 'current_affairs_state', 'story_tutor_state'
                        ];
                        keysToRemove.forEach(key => localStorage.removeItem(key));

                        if (user?.uid) {
                            saveUserSession(user.uid, null).catch(e => console.warn("Session clear error", e));
                        }

                        handleSignOut().catch(err => console.error("Sign out error:", err));
                    }
                }
            } catch (e) {
                console.error("Error during app initialization:", e);
            } finally {
                setIsLoading(false);
            }
        });
        return () => unsubscribe();
    }, [fetchExamData, isAuthInProgress]);

    useEffect(() => {
        const root = window.document.documentElement;
        
        const applyTheme = () => {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            const isDark = displaySettings.theme === 'dark' || (displaySettings.theme === 'system' && prefersDark);
            
            root.classList.toggle('dark', isDark);
            
            if (displaySettings.theme === 'system') {
                localStorage.removeItem('color-theme');
            } else {
                localStorage.setItem('color-theme', displaySettings.theme);
            }
        };

        applyTheme();

        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleSystemThemeChange = () => {
            if (displaySettings.theme === 'system') {
                applyTheme();
            }
        };

        // Add listener for system theme changes
        mediaQuery.addEventListener('change', handleSystemThemeChange);

        return () => {
            mediaQuery.removeEventListener('change', handleSystemThemeChange);
        };
    }, [displaySettings.theme]);

    useEffect(() => {
        const root = window.document.documentElement;
        if (displaySettings.fontSize === 'sm') {
            root.style.fontSize = '14px';
        } else if (displaySettings.fontSize === 'lg') {
            root.style.fontSize = '18px';
        } else {
            root.style.fontSize = '16px'; // base
        }
    }, [displaySettings.fontSize]);

    useEffect(() => {
        if (!isLoading && !isLoggingOut.current) {
            const session: UserSession = { lastView: view, history: history, context: { currentTopic } };
            saveUserSession(user?.uid || null, session);
            try {
                localStorage.setItem('global_last_session', JSON.stringify(session));
            } catch (e) {}
        }
    }, [view, history, currentTopic, user, isLoading]);

    useEffect(() => {
        saveComponentState('isStudyModalOpen', isStudyModalOpen, user?.uid || null);
        saveComponentState('studyModalTopic', studyModalTopic, user?.uid || null);
    }, [isStudyModalOpen, studyModalTopic, user?.uid]);

    useEffect(() => {
        saveComponentState('isTutorialModalOpen', isTutorialModalOpen, user?.uid || null);
        saveComponentState('tutorialModalTopic', tutorialModalTopic, user?.uid || null);
    }, [isTutorialModalOpen, tutorialModalTopic, user?.uid]);

    useEffect(() => {
        let networkListener: any = null;

        const setupNetwork = async () => {
            const status = await Network.getStatus();
            setIsOnline(status.connected);
            if (status.connected) retryFailedExports();

            networkListener = await Network.addListener('networkStatusChange', status => {
                setIsOnline(status.connected);
                if (status.connected) retryFailedExports();
            });
        };

        setupNetwork();

        return () => {
            if (networkListener) {
                networkListener.remove();
            }
        };
    }, []);

    useEffect(() => {
        if (view === AppView.EXAM_DETAILS_VIEWER && lastSelection && user) {
            const fetchDetails = async () => {
                setIsExamDetailsLoading(true);
                setExamDetailsError(null);
                setExamDetails([]);
                try {
                    const details = await generateExamDetails(
                        lastSelection.selectedExam,
                        lastSelection.selectedSubCategory,
                        lastSelection.selectedTier,
                        displaySettings.language,
                        lastSelection.selectionLevel
                    );
                    setExamDetails(details);
                } catch (err) {
                    setExamDetailsError(getSpecificErrorMessage(err));
                } finally {
                    setIsExamDetailsLoading(false);
                }
            };
            fetchDetails();
        }
    }, [view, lastSelection, displaySettings.language, user]);

    const canAccessPremium = !!user;

    useEffect(() => {
        const checkDailyJobUpdates = async () => {
            if (!isOnline || !canAccessPremium) return;
            const now = new Date();
            const istDateStr = now.toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' });
            const checkKey = `last_job_notification_check_${istDateStr}`;
            const alreadyChecked = localStorage.getItem(checkKey);
            
            if (!alreadyChecked) {
                try {
                    const jobs = await fetchLatestJobNotifications(displaySettings.language);
                    setJobCount(jobs.length);
                    if (jobs.length > 0) {
                        setNotification({ type: 'success', message: `🔔 Daily Update: ${jobs.length} new job notifications available today!` });
                    }
                    localStorage.setItem(checkKey, 'true');
                    const yesterday = new Date(now);
                    yesterday.setDate(yesterday.getDate() - 1);
                    const yesterdayStr = yesterday.toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' });
                    localStorage.removeItem(`last_job_notification_check_${yesterdayStr}`);
                } catch (e) {
                    console.error("Daily job fetch failed:", e);
                }
            } else {
                fetchLatestJobNotifications(displaySettings.language).then(jobs => {
                    setJobCount(jobs.length);
                }).catch(e => console.error("Silent job count update failed", e));
            }
        };
        checkDailyJobUpdates();
        const intervalId = setInterval(checkDailyJobUpdates, 60 * 1000);
        return () => clearInterval(intervalId);
    }, [canAccessPremium, isOnline, displaySettings.language, user]);


    const handleSetLastSelection = async (selection: LastSelection | null): Promise<Syllabus | null> => {
        setLastSelection(selection);
        await saveLastSelection(selection, user?.uid || null);
        if (selection) {
            return fetchExamData(selection);
        } else {
            setSyllabus([]);
            return null;
        }
    };

    const handleDisplaySettingsChange = (newSettings: Partial<DisplaySettings>) => {
        setDisplaySettings(prev => {
            const updated = { ...prev, ...newSettings };
            saveDisplaySettings(updated);
            if (user) saveUserDisplaySettings(user.uid, updated);
            return updated;
        });
    };
    
    // Automatically sync AI content (like syllabus and open modals) when language changes
    useEffect(() => {
        // Clear cached tools states so they restart in the new language
        const tools = [
            'AskAiAnything', 'careerCompass', 'currentAffairsAnalyst',
            'doubtSolver', 'flashcardsGenerator', 'guessPaperGenerator',
            'homeworkSolver', 'mindMapGenerator', 'mockInterview',
            'previousYearQuestions', 'quizGenerator', 'realLifeExamples',
            'selfSummaryChallenge', 'storyTutorGenerator', 'studyPlanner',
            'teachShortcuts', 'topicExplorer'
        ];
        // Don't fully trash history from Firebase right here, just trash local state so components refetch fresh
        tools.forEach(key => localStorage.removeItem(`active_state_${key}`));

        if (lastSelection) {
            fetchExamData(lastSelection);
        }
        if (isStudyModalOpen && studyModalTopic) {
            handleStudyTopic(studyModalTopic.topic, studyModalTopic.mainTopic);
        }
        if (isTutorialModalOpen && tutorialModalTopic) {
            handleStartTutorial(tutorialModalTopic);
        }
    }, [displaySettings.language]);
    
    const handleChangeExam = () => setIsExamWizardOpen(true);

    const handleSelectionComplete = async (selection: LastSelection) => {
        setIsExamWizardOpen(false);
        
        // Explicitly clear component states to ensure fresh start for new exam
        const tools = [
            'topic_explorer_state', 'quiz_active_state', 'mindmap_active_state', 
            'interview_active_state', 'guess_paper_state', 'study_roadmap_state',
            'shortcuts_state', 'doubt_solver_state', 'concept_map_state', 
            'teach_back_state', 'summary_challenge_state', 'real_life_examples_state', 
            'career_compass_state', 'resume_builder_state', 'flashcards_state', 
            'pyq_state', 'current_affairs_state', 'story_tutor_state', 'homework_solver_state'
        ];
        tools.forEach(key => saveComponentState(key, null, user?.uid || null));

        handleSetView(AppView.LEARN_TOPICS);
        handleSetLastSelection(selection);
    };

    const handleSetView = useCallback((newView: AppView) => {
        if (newView === view) return;
        backHandlerRef.current = null;
        if (newView === AppView.HOME) {
            setHistory([]);
        } else {
            setHistory(prev => [...prev, view]);
        }
        setView(newView);
        setIsNavMenuOpen(false);
        window.scrollTo(0, 0);
    }, [view]);

    const handleGoBack = useCallback(() => {
        if (backHandlerRef.current) {
            const handled = backHandlerRef.current();
            if (handled) return;
        }
        if (isExamWizardOpen) { setIsExamWizardOpen(false); return; }
        if (isStudyModalOpen) { setIsStudyModalOpen(false); return; }
        if (isStoryModalOpen) { setIsStoryModalOpen(false); return; }
        if (isTutorialModalOpen) { setIsTutorialModalOpen(false); return; }
        if (isDisplaySettingsOpen) { setIsDisplaySettingsOpen(false); return; }
        if (!!popupConfig) { setPopupConfig(null); return; }

        if (history.length > 0) {
            const previousView = history[history.length - 1];
            setHistory(prev => prev.slice(0, -1));
            setView(previousView);
            window.scrollTo(0, 0);
        } else if (view !== AppView.HOME) {
            setView(AppView.HOME);
        } else {
            CapacitorApp.exitApp();
        }
    }, [history, view, isExamWizardOpen, isStudyModalOpen, isStoryModalOpen, isTutorialModalOpen, isDisplaySettingsOpen, popupConfig]);
    
    const handleSetBackHandler = useCallback((handler: (() => boolean) | null) => {
        backHandlerRef.current = handler;
    }, []);

    useEffect(() => {
        const backListener = CapacitorApp.addListener('backButton', (data) => {
            handleGoBack();
        });
        return () => {
            backListener.then(handler => handler.remove());
        };
    }, [handleGoBack]);
    
    const handleUserSignOut = () => {
        isLoggingOut.current = true;
        setUser(null);
        setIsAdmin(false);
        setAppMode('user');
        setView(AppView.HOME);
        setHistory([]);
        setLastSelection(null);
        setSyllabus([]);
        setCurrentTopic(null);
        setIsStudyModalOpen(false);
        setStudyMaterial(null);
        setStudyModalTopic(null);
        setIsTutorialModalOpen(false);
        setTutorial(null);
        setTutorialModalTopic(null);
        setIsExamWizardOpen(false);
        setPopupConfig(null);
        setIsDisplaySettingsOpen(false);

        backHandlerRef.current = null;

        setTimeout(() => {
            saveComponentState('isStudyModalOpen', null, user?.uid || null);
            saveComponentState('studyModalTopic', null, user?.uid || null);
            saveComponentState('isTutorialModalOpen', null, user?.uid || null);
            saveComponentState('tutorialModalTopic', null, user?.uid || null);
            
            const keysToRemove = [
                'quiz_active_state', 'mindmap_active_state', 'interview_active_state',
                'topic_explorer_state', 'guess_paper_state', 'study_roadmap_state',
                'shortcuts_state', 'doubt_solver_state',
                'concept_map_state', 'teach_back_state', 'summary_challenge_state',
                'real_life_examples_state', 'career_compass_state', 'resume_builder_state',
                'flashcards_state', 'pyq_state', 'current_affairs_state', 'story_tutor_state'
            ];
            keysToRemove.forEach(key => localStorage.removeItem(key));

            if (user?.uid) {
                saveUserSession(user.uid, null).catch(e => console.warn("Session clear error", e));
            }

            handleSignOut().catch(err => console.error("Sign out error:", err));
        }, 50);
    };
    
    const handleStudyTopic = useCallback(async (topic: string, mainTopic?: string) => {
        setIsStudyModalOpen(true);
        setStudyModalTopic({ topic, mainTopic });
        
        if (studyMaterial && studyModalTopic?.topic === topic) {
            return; 
        }

        setIsStudyMaterialLoading(true);
        setStudyMaterial(null);
        setStudyMaterialError(null);
    
        try {
            const material = await generateStudyNotes(topic, displaySettings.language, mainTopic, selectionPath);
            setStudyMaterial(material);
        } catch (err) {
            setStudyMaterialError(getSpecificErrorMessage(err));
        } finally {
            setIsStudyMaterialLoading(false);
        }
    }, [displaySettings.language, selectionPath, studyMaterial, studyModalTopic, user]);
    
    const handleTeachWithStory = (topic: string) => {
        setStudyStoryTopic(topic);
        setIsStoryModalOpen(true);
    };

    const handleStartTutorial = useCallback(async (topic: string) => {
        setIsTutorialModalOpen(true);
        setTutorialModalTopic(topic);
        
        if (tutorial && tutorialModalTopic === topic) {
            return;
        }

        setIsTutorialLoading(true);
        setTutorial(null);
        setTutorialError(null);
    
        logActivity(user?.uid || null, {
            type: 'TUTORIAL_STARTED' as HistoryType,
            description: `Started a tutorial for "${topic}"`,
            view: AppView.LEARN_TOPICS,
            context: { topic, examPath: selectionPath }
        });

        try {
            const tutorialData = await generateTutorialForTopic(topic, displaySettings.language, selectionPath);
            setTutorial(tutorialData);
        } catch (err) {
            setTutorialError(getSpecificErrorMessage(err));
        } finally {
            setIsTutorialLoading(false);
        }
    }, [displaySettings.language, selectionPath, user, tutorial, tutorialModalTopic]);
    
    useEffect(() => {
        if (user?.uid) {
            syncSession(user.uid, sessionId);
            
            const unsubscribe = listenToSession(user.uid, (currentId) => {
                if (currentId && currentId !== sessionId) {
                    // Another session started
                    setNotification({ 
                        type: 'error', 
                        message: "Logged out: You are logged in on another device." 
                    });
                    handleSignOut().then(() => {
                        setUser(null);
                        setIsAdmin(false);
                        setAppMode('user');
                        setView(AppView.HOME);
                    }).catch((error) => {
                        console.error("Sign out error", error);
                    });
                }
            });
            return () => unsubscribe();
        }
    }, [user?.uid, sessionId]);

    const handleRetryStudyMaterial = useCallback(() => {
        if (studyModalTopic) handleStudyTopic(studyModalTopic.topic, studyModalTopic.mainTopic);
    }, [studyModalTopic, handleStudyTopic]);

    const handleRetryTutorial = useCallback(() => {
        if (tutorialModalTopic) handleStartTutorial(tutorialModalTopic);
    }, [tutorialModalTopic, handleStartTutorial]);

    const requestAuth = () => { if (!user) setShowAuthModal(true); };
    
    const handleSelectJob = (job: JobNotification) => {
        setSelectedJob(job);
        handleSetView(AppView.JOB_DETAILS_VIEWER);
    };

    const handleTakeQuiz = (topic: string) => {
        setCurrentTopic(topic);
        handleSetView(AppView.QUIZ);
    };

    const renderView = () => {
        const lang = displaySettings.language;
        const topics = syllabus.flatMap(s => s.topics);

        return (
            <Suspense fallback={<div className="flex justify-center items-center h-64"><LoadingSpinner /></div>}>
                {(() => {
                    switch (view) {
                        case AppView.HOME: 
                            return <Dashboard user={user} setView={handleSetView} lastSelection={lastSelection} onChangeExam={handleChangeExam} isOnline={isOnline} />;
                        case AppView.ASK_AI: 
                            return <AskAiAnything language={lang} isOnline={isOnline} selectionPath={selectionPath} user={user} canAccessPremium={canAccessPremium} requestAuth={requestAuth} setView={handleSetView} />;
                        case AppView.LEARNING_TRACKER: 
                            return <LearningTracker topics={topics} selectionPath={selectionPath} user={user} />;
                        case AppView.USER_PROFILE: 
                            return <UserProfileComponent user={user} setNotification={setNotification} />;
                        case AppView.LEARN_TOPICS:
                            return <TopicExplorer syllabus={syllabus} onStudyTopic={handleStudyTopic} onTeachWithStory={handleTeachWithStory} onStartTutorial={handleStartTutorial} isOnline={isOnline} user={user} language={lang} selectionPath={selectionPath} isLoading={isSyllabusLoading} error={syllabusError} onRefresh={handleRefreshSyllabus} canAccessPremium={canAccessPremium} requestAuth={requestAuth} onSetBackHandler={handleSetBackHandler} onTakeQuiz={handleTakeQuiz} />;
                        case AppView.QUIZ:
                            return <QuizGenerator topics={topics} language={lang} isOnline={isOnline} topic={currentTopic} onTopicChange={setCurrentTopic} showPopup={setPopupConfig} user={user} selectionPath={selectionPath} canAccessPremium={canAccessPremium} requestAuth={requestAuth} isSyllabusLoading={isSyllabusLoading} onRefresh={handleRefreshSyllabus} onSetBackHandler={handleSetBackHandler} />;
                        case AppView.INTERVIEW:
                            return <MockInterview language={lang} isOnline={isOnline} showPopup={setPopupConfig} user={user} selectionPath={selectionPath} canAccessPremium={canAccessPremium} requestAuth={requestAuth} onSetBackHandler={handleSetBackHandler} />;
                        case AppView.JOB_NOTIFICATIONS:
                            return <JobNotificationsViewer language={lang} isOnline={isOnline} user={user} canAccessPremium={canAccessPremium} requestAuth={requestAuth} onSelectJob={handleSelectJob} />;
                        case AppView.EXAM_DETAILS_VIEWER:
                            return <ExamDetailsViewer selectionPath={selectionPath} details={examDetails} isLoading={isExamDetailsLoading} error={examDetailsError} user={user} canAccessPremium={canAccessPremium} requestAuth={requestAuth} />;
                        case AppView.JOB_DETAILS_VIEWER:
                            if (!selectedJob) return <JobNotificationsViewer language={lang} isOnline={isOnline} user={user} canAccessPremium={canAccessPremium} requestAuth={requestAuth} onSelectJob={handleSelectJob} />;
                            const jobDetails: ExamDetailGroup[] = [
                                {
                                    groupTitle: 'Job Overview',
                                    details: [
                                        { criteria: 'Post Name', details: selectedJob.postName },
                                        { criteria: 'Organization', details: selectedJob.organization },
                                        { criteria: 'Vacancies', details: selectedJob.vacancies },
                                        { criteria: 'Last Date', details: selectedJob.lastDate },
                                    ]
                                },
                                {
                                    groupTitle: 'Eligibility & Requirements',
                                    details: [
                                        { criteria: 'Details', details: selectedJob.eligibility }
                                    ]
                                }
                            ];
                            return <ExamDetailsViewer 
                                selectionPath={`${selectedJob.postName} at ${selectedJob.organization}`}
                                details={jobDetails}
                                isLoading={false}
                                error={null}
                                user={user}
                                canAccessPremium={canAccessPremium}
                                requestAuth={requestAuth}
                                officialLink={selectedJob.link}
                            />;
                        case AppView.PREVIOUS_YEAR_QUESTIONS:
                            return <PreviousYearQuestions selectionPath={selectionPath} language={displaySettings.language} isOnline={isOnline} user={user} canAccessPremium={canAccessPremium} requestAuth={requestAuth} />;
                        case AppView.TOOLS:
                            return <Tools setView={handleSetView} />;
                        case AppView.CURRENT_AFFAIRS:
                            return <CurrentAffairsAnalyst language={lang} isOnline={isOnline} selectionPath={selectionPath} user={user} canAccessPremium={canAccessPremium} requestAuth={requestAuth} />;
                        case AppView.MIND_MAP:
                            return <MindMapGenerator topics={topics} language={lang} isOnline={isOnline} showPopup={setPopupConfig} user={user} canAccessPremium={canAccessPremium} requestAuth={requestAuth} isSyllabusLoading={isSyllabusLoading} onRefresh={handleRefreshSyllabus} />;
                        case AppView.GUESS_PAPER:
                            return <GuessPaperGenerator topics={topics} language={lang} isOnline={isOnline} showPopup={setPopupConfig} user={user} selectionPath={selectionPath} canAccessPremium={canAccessPremium} requestAuth={requestAuth} isSyllabusLoading={isSyllabusLoading} onRefresh={handleRefreshSyllabus} />;
                        case AppView.STUDY_ROADMAP:
                            return <StudyPlanner selectionPath={selectionPath} language={lang} isOnline={isOnline} user={user} canAccessPremium={canAccessPremium} requestAuth={requestAuth} topics={topics} isSyllabusLoading={isSyllabusLoading} onRefresh={handleRefreshSyllabus} />;
                        case AppView.TEACH_SHORTCUTS:
                            return <TeachShortcuts language={lang} isOnline={isOnline} showPopup={setPopupConfig} user={user} canAccessPremium={canAccessPremium} requestAuth={requestAuth} />;
                        case AppView.DOUBT_SOLVER:
                            return <DoubtSolver language={lang} isOnline={isOnline} user={user} canAccessPremium={canAccessPremium} requestAuth={requestAuth} />;
                        case AppView.CONCEPT_LINK_MAP:
                            return <ConceptLinkMap topics={topics} language={lang} isOnline={isOnline} showPopup={setPopupConfig} user={user} canAccessPremium={canAccessPremium} requestAuth={requestAuth} isSyllabusLoading={isSyllabusLoading} onRefresh={handleRefreshSyllabus} />;
                        case AppView.TEACH_BACK_MODE:
                            return <TeachBackMode topics={topics} language={lang} isOnline={isOnline} showPopup={setPopupConfig} user={user} canAccessPremium={canAccessPremium} requestAuth={requestAuth} isSyllabusLoading={isSyllabusLoading} onRefresh={handleRefreshSyllabus} />;
                        case AppView.SELF_SUMMARY_CHALLENGE:
                            return <SelfSummaryChallenge topics={topics} language={lang} isOnline={isOnline} showPopup={setPopupConfig} user={user} canAccessPremium={canAccessPremium} requestAuth={requestAuth} />;
                        case AppView.REAL_LIFE_EXAMPLES:
                            return <RealLifeExamples topics={topics} language={lang} isOnline={isOnline} showPopup={setPopupConfig} user={user} canAccessPremium={canAccessPremium} requestAuth={requestAuth} />;
                        case AppView.CAREER_COMPASS:
                            return <CareerCompass language={lang} isOnline={isOnline} user={user} selectionPath={selectionPath} canAccessPremium={canAccessPremium} requestAuth={requestAuth} />;
                        case AppView.AI_RESUME_BUILDER:
                            return <AiResumeBuilder language={lang} isOnline={isOnline} user={user} canAccessPremium={canAccessPremium} requestAuth={requestAuth} />;
                        case AppView.FLASHCARDS_GENERATOR:
                            return <FlashcardsGenerator topics={topics} language={lang} isOnline={isOnline} showPopup={setPopupConfig} user={user} canAccessPremium={canAccessPremium} requestAuth={requestAuth} topic={currentTopic} onTopicChange={setCurrentTopic} isSyllabusLoading={isSyllabusLoading} onRefresh={handleRefreshSyllabus} />;
                        case AppView.SCIENTIFIC_CALCULATOR:
                            return <ScientificCalculator />;
                        case AppView.ADAPTIVE_LEARNING_PATH:
                            return <AdaptiveLearningPath topics={topics} language={lang} isOnline={isOnline} user={user} selectionPath={selectionPath} setView={handleSetView} onStudyTopic={handleStudyTopic} setQuizTopic={setCurrentTopic} canAccessPremium={canAccessPremium} requestAuth={requestAuth} />;
                        case AppView.STORY_TUTOR:
                            return <StoryTutorGenerator topics={topics} language={lang} isOnline={isOnline} showPopup={setPopupConfig} user={user} canAccessPremium={canAccessPremium} requestAuth={requestAuth} isSyllabusLoading={isSyllabusLoading} onRefresh={handleRefreshSyllabus} />;
                        case AppView.LEARNING_TECHNIQUES:
                            return <LearningTechniques language={lang} isOnline={isOnline} user={user} canAccessPremium={canAccessPremium} requestAuth={requestAuth} topics={topics} selectionPath={selectionPath} />;
                        case AppView.MAP_INTERACTIVE_LEARNING:
                            return <MapInteractiveLearning onSetBackHandler={handleSetBackHandler} isOnline={isOnline} selectionPath={selectionPath} language={lang} topics={topics} />;
                        default: 
                            return <Dashboard user={user} setView={handleSetView} lastSelection={lastSelection} onChangeExam={handleChangeExam} isOnline={isOnline} />;
                    }
                })()}
            </Suspense>
        );
    }

    if (isLoading) {
        return <StartupLoading />;
    }

    if (user && isAdmin && appMode === 'admin') {
        return (
            <Suspense fallback={<StartupLoading />}>
                <AdminDashboard user={user} onSignOut={handleUserSignOut} setAppMode={setAppMode} />
            </Suspense>
        );
    }

    if (!user) {
        return (
            <>
                {notification && <NotificationBanner message={notification.message} type={notification.type} onDismiss={() => setNotification(null)} />}
                <LoginPrompt 
                    onAuthStart={() => setIsAuthInProgress(true)}
                    onAuthEnd={() => setIsAuthInProgress(false)}
                />
                <div id="recaptcha-container"></div>
            </>
        );
    }
    
    return (
        <div className={`font-${displaySettings.fontFamily} bg-slate-100 dark:bg-slate-900`}>
            <OfflineBanner isOnline={isOnline} />
            <Sidebar
                currentView={view}
                setView={handleSetView}
                isOpen={isNavMenuOpen}
                onClose={() => setIsNavMenuOpen(false)}
                jobCount={jobCount}
                onBack={handleGoBack}
            />
            
            <div className="lg:ml-64 flex flex-col min-h-screen">
                <Header 
                    user={user}
                    lastSelection={lastSelection}
                    onToggleNav={() => setIsNavMenuOpen(!isNavMenuOpen)}
                    onOpenSettings={() => setIsDisplaySettingsOpen(true)}
                    onUserSignOut={handleUserSignOut}
                    setView={handleSetView}
                    onChangeExam={handleChangeExam}
                    requestAuth={requestAuth}
                    isAdmin={isAdmin}
                    setAppMode={setAppMode}
                />
                <main className="flex-1 overflow-y-auto p-4 sm:p-6 pb-20 sm:pb-6">
                    {renderView()}
                </main>
            </div>

            <MobileTaskbar currentView={view} setView={handleSetView} jobCount={jobCount} onBack={handleGoBack} />

            <Suspense fallback={null}>
                <ExamSelectionWizard 
                    isOpen={isExamWizardOpen}
                    onClose={() => setIsExamWizardOpen(false)}
                    onSelectionComplete={handleSelectionComplete}
                />

                {popupConfig && (
                    <SelectionPopup
                        isOpen={!!popupConfig}
                        onClose={() => setPopupConfig(null)}
                        title={popupConfig.title}
                        options={popupConfig.options}
                        onSelect={(value) => {
                            popupConfig.onSelect(value);
                            setPopupConfig(null);
                        }}
                    />
                )}

                <DisplaySettingsPopup
                    isOpen={isDisplaySettingsOpen}
                    onClose={() => setIsDisplaySettingsOpen(false)}
                    settings={displaySettings}
                    onSettingsChange={handleDisplaySettingsChange}
                />

                {notification && (
                    <NotificationBanner
                        message={notification.message}
                        type={notification.type}
                        onDismiss={() => setNotification(null)}
                    />
                )}
                
                <StudyMaterialModal 
                    isOpen={isStudyModalOpen}
                    onClose={() => { setIsStudyModalOpen(false); saveComponentState('isStudyModalOpen', false, user?.uid || null); }}
                    topic={studyModalTopic?.topic || null}
                    material={studyMaterial}
                    isLoading={isStudyMaterialLoading}
                    error={studyMaterialError}
                    onRetry={handleRetryStudyMaterial}
                    language={displaySettings.language}
                    selectionPath={selectionPath}
                    isOnline={isOnline}
                    user={user}
                    onSelectRelatedTopic={handleStudyTopic}
                />
                
                <StoryTutorModal
                    isOpen={isStoryModalOpen}
                    onClose={() => setIsStoryModalOpen(false)}
                    topic={storyModalTopic}
                    language={displaySettings.language}
                    isOnline={isOnline}
                />

                <TutorialModal
                    isOpen={isTutorialModalOpen}
                    onClose={() => { setIsTutorialModalOpen(false); saveComponentState('isTutorialModalOpen', false, user?.uid || null); }}
                    tutorial={tutorial}
                    isLoading={isTutorialLoading}
                    error={tutorialError}
                    onRetry={handleRetryTutorial}
                />
            </Suspense>

            {showAuthModal && (
                <AuthModal 
                    onClose={() => setShowAuthModal(false)}
                    onAuthStart={() => setIsAuthInProgress(true)}
                    onAuthEnd={() => {
                        setIsAuthInProgress(false);
                        setShowAuthModal(false);
                    }}
                />
            )}

            <div id="recaptcha-container"></div>
        </div>
    );
};

export default App;
