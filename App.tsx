



import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { AppView, ExamDetailGroup, ExamByQualification, SyllabusTopic, UserProfile } from './types';
import { LANGUAGES, QUALIFICATION_CATEGORIES, SELECTION_LEVELS, INDIAN_STATES, EXAM_DATA, CBSE_10_SUBJECTS } from './constants';
import { generateExamsByQualification, getSpecificErrorMessage, generateTopicsForExam, generateExamDetails } from './services/geminiService';
import { getLastSelection, saveLastSelection, getSyllabusProgress, getTrackingData } from './utils/tracking';
import TopicExplorer from './components/TopicExplorer';
import StudyHelper from './components/StudyHelper';
import QuizGenerator from './components/QuizGenerator';
import MockInterview from './components/MockInterview';
import LearningTracker from './components/LearningTracker';
import SyllabusTracker from './components/SyllabusTracker';
import ResultTracker from './components/ResultTracker';
import AdmitCardTracker from './components/AdmitCardTracker';
import ApplicationTracker from './components/ApplicationTracker';
import MindMapGenerator from './components/MindMapGenerator';
import GuessPaperGenerator from './components/GuessPaperGenerator';
import StudyPlanner from './components/StudyPlanner';
import TeachShortcuts from './components/TeachShortcuts';
import Card from './components/Card';
import Select from './components/Select';
import Button from './components/Button';
import LoadingSpinner from './components/LoadingSpinner';

// New Icons
import { HomeIcon } from './components/icons/HomeIcon';
import { BeakerIcon } from './components/icons/BeakerIcon';
import { BookOpenIcon } from './components/icons/BookOpenIcon';
import { ChartPieIcon } from './components/icons/ChartPieIcon';
import { UserGroupIcon } from './components/icons/UserGroupIcon';
import { ClipboardListIcon } from './components/icons/ClipboardListIcon';
import { RectangleGroupIcon } from './components/icons/RectangleGroupIcon';
import { DocumentSparklesIcon } from './components/icons/DocumentSparklesIcon';
import { TrophyIcon } from './components/icons/TrophyIcon';
import { CalendarDaysIcon } from './components/icons/CalendarDaysIcon';
import { KeyIcon } from './components/icons/KeyIcon';
import { Bars3Icon } from './components/icons/Bars3Icon';
import { XMarkIcon } from './components/icons/XMarkIcon';
import { AcademicCapIcon } from './components/icons/AcademicCapIcon';
import { SparklesIcon } from './components/icons/SparklesIcon';
import { LightBulbIcon } from './components/icons/LightBulbIcon';
import { auth } from './firebase';
// Use Firebase compat imports to resolve module errors.
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';


const App: React.FC = () => {
  const [view, setView] = useState<AppView>(AppView.HOME);
  const [language, setLanguage] = useState<string>(LANGUAGES[0]);
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [authInitialized, setAuthInitialized] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  
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

  const handleLogin = async () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    try {
        setAuthError(null);
        await auth.signInWithPopup(provider);
    } catch (error: any) {
        console.error("Error signing in with Google", error);
        if (error.code === 'auth/operation-not-supported-in-this-environment') {
            setAuthError("Sign-in is not supported in this environment. Please open the app in a new browser tab.");
        } else {
            setAuthError("An error occurred during sign-in. Please try again.");
        }
    }
  };

  const handleLogout = async () => {
    try {
        await auth.signOut();
    } catch (error) {
        console.error("Error signing out", error);
    }
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((firebaseUser) => {
        if (firebaseUser) {
            const newUser: UserProfile = {
                id: firebaseUser.uid,
                name: firebaseUser.displayName || 'User',
                email: firebaseUser.email || '',
                picture: firebaseUser.photoURL || '',
            };
            setUser(newUser);
        } else {
            setUser(null);
        }
        setAuthInitialized(true);
    });
    
    const lastSelection = getLastSelection();
    if (lastSelection) {
      setSelectionLevel(lastSelection.selectionLevel);
      setSelectedState(lastSelection.selectedState);
      setSelectedQualification(lastSelection.selectedQualification);
      setSelectedExam(lastSelection.selectedExam);
      setSelectedSubCategory(lastSelection.selectedSubCategory);
      setSelectedTier(lastSelection.selectedTier);
    }

    return () => unsubscribe();
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
    if (selectionLevel === '10th Class (CBSE)') {
      return [selectionLevel, selectedSubCategory].filter(Boolean).join(' - ');
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
    const shouldFetchForCBSE = selectionLevel === '10th Class (CBSE)' && selectedSubCategory;

    if (shouldFetchDynamically || shouldFetchForQualification || shouldFetchForCBSE) {
      const fetchDynamicDetails = async () => {
        setIsDynamicDetailsLoading(true);
        setDynamicDetailsError(null);
        try {
          const [topics, details] = await Promise.all([
            generateTopicsForExam(selectedExam, selectedSubCategory, selectedTier, language),
            generateExamDetails(selectedExam, selectedSubCategory, selectedTier, language)
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

  const MainContent = () => {
    switch (view) {
      case AppView.STUDY: return <TopicExplorer topics={examTopics} language={language} isOnline={isOnline} />;
      case AppView.STUDY_HELPER: return <StudyHelper topics={examTopics} language={language} isOnline={isOnline} preselectedTopic={preselectedTopic} onClearPreselectedTopic={handleClearPreselectedTopic} />;
      case AppView.QUIZ: return <QuizGenerator topics={examTopics} language={language} isOnline={isOnline} preselectedTopic={preselectedTopic} onClearPreselectedTopic={handleClearPreselectedTopic} />;
      case AppView.LEARNING_TRACKER: return <LearningTracker topics={examTopics} selectionPath={selectionPath} />;
      case AppView.INTERVIEW: return <MockInterview language={language} isOnline={isOnline} />;
      case AppView.SYLLABUS_TRACKER: return <SyllabusTracker selectedExam={selectionPath} language={language} isOnline={isOnline} />;
      case AppView.MIND_MAP: return <MindMapGenerator topics={examTopics} language={language} isOnline={isOnline} />;
      case AppView.GUESS_PAPER: return <GuessPaperGenerator topics={examTopics} language={language} isOnline={isOnline} />;
      case AppView.RESULT_TRACKER: return <ResultTracker selection={{ selectedExam, selectedSubCategory, selectedTier }} language={language} isOnline={isOnline} />;
      case AppView.ADMIT_CARD_TRACKER: return <AdmitCardTracker selection={{ selectedExam, selectedSubCategory, selectedTier }} language={language} isOnline={isOnline} />;
      case AppView.APPLICATION_TRACKER: return <ApplicationTracker />;
      case AppView.AI_STUDY_PLAN: return <StudyPlanner setView={setView} setPreselectedTopic={setPreselectedTopic} selectionPath={selectionPath} availableTopics={examTopics} language={language} isOnline={isOnline} />;
      case AppView.TEACH_SHORTCUTS: return <TeachShortcuts language={language} isOnline={isOnline} />;
      case AppView.HOME:
      default: return <Dashboard />;
    }
  };

  const Dashboard = () => {
    const syllabusKey = selectionPath ? `${selectionPath}-${language}` : '';
    const syllabusProgressData = useMemo(() => getSyllabusProgress(), []);
    const currentSyllabusProgress = syllabusProgressData[syllabusKey] || { checkedIds: [], syllabus: [] };

    const countTopics = useCallback((topics: SyllabusTopic[]): number => {
      return topics.reduce((acc, topic) => acc + 1 + (topic.children ? countTopics(topic.children) : 0), 0);
    }, []);

    const totalTopics = useMemo(() => countTopics(currentSyllabusProgress.syllabus), [currentSyllabusProgress.syllabus, countTopics]);
    const progressPercentage = totalTopics > 0 ? Math.round((currentSyllabusProgress.checkedIds.length / totalTopics) * 100) : 0;
  
    const performanceStats = useMemo(() => {
        const progress = getTrackingData();

        const topicScores: Record<string, { totalScore: number; totalAttempts: number; totalPossible: number }> = {};
        progress.quizHistory.forEach(result => {
            if (!topicScores[result.topic]) topicScores[result.topic] = { totalScore: 0, totalAttempts: 0, totalPossible: 0 };
            topicScores[result.topic].totalScore += result.score;
            topicScores[result.topic].totalAttempts += 1;
            topicScores[result.topic].totalPossible += result.totalQuestions;
        });

        const masteredTopics = new Set<string>();
        for (const topic in topicScores) {
            const d = topicScores[topic];
            const avg = d.totalPossible > 0 ? (d.totalScore / d.totalPossible) : 0;
            if (d.totalAttempts >= 2 && avg >= 0.8) masteredTopics.add(topic);
        }
        
        const totalQuizzes = progress.quizHistory.length;
        const totalScore = progress.quizHistory.reduce((sum, q) => sum + (q.score / q.totalQuestions) * 100, 0);
        const averageScore = totalQuizzes > 0 ? Math.round(totalScore / totalQuizzes) : 0;

        return {
            averageScore,
            topicsStudied: progress.studiedTopics.length,
            topicsMastered: masteredTopics.size,
        };
    }, []);

    const allTools = [
      { view: AppView.QUIZ, icon: <BeakerIcon className="w-6 h-6" />, title: 'Quiz Generator', desc: 'Create custom quizzes.', disabled: !isExamSelected },
      { view: AppView.INTERVIEW, icon: <UserGroupIcon className="w-6 h-6" />, title: 'Mock Interview', desc: 'Practice with an AI interviewer.', disabled: selectionLevel === '10th Class (CBSE)' },
      { view: AppView.SYLLABUS_TRACKER, icon: <ClipboardListIcon className="w-6 h-6" />, title: 'Syllabus Tracker', desc: 'Generate and track syllabus progress.', disabled: !selectionPath },
      { view: AppView.MIND_MAP, icon: <RectangleGroupIcon className="w-6 h-6" />, title: 'Mind Maps', desc: 'Visualize complex topics.', disabled: !isExamSelected },
      { view: AppView.GUESS_PAPER, icon: <DocumentSparklesIcon className="w-6 h-6" />, title: 'Guess Paper', desc: 'AI-predicted exam questions.', disabled: !isExamSelected },
      { view: AppView.TEACH_SHORTCUTS, icon: <LightBulbIcon className="w-6 h-6" />, title: 'Aptitude Shortcuts', desc: 'Learn problem-solving tricks.', disabled: false },
      { view: AppView.RESULT_TRACKER, icon: <TrophyIcon className="w-6 h-6" />, title: 'Result Tracker', desc: 'Check real-time result status.', disabled: !isExamSelected || selectionLevel === '10th Class (CBSE)' },
      { view: AppView.ADMIT_CARD_TRACKER, icon: <CalendarDaysIcon className="w-6 h-6" />, title: 'Admit Card Tracker', desc: 'Track admit card availability.', disabled: !isExamSelected || selectionLevel === '10th Class (CBSE)' },
      { view: AppView.APPLICATION_TRACKER, icon: <KeyIcon className="w-6 h-6" />, title: 'Application Tracker', desc: 'Save application credentials.', disabled: selectionLevel === '10th Class (CBSE)' },
    ];
  
    const StatDisplay: React.FC<{ label: string; value: string | number; }> = ({ label, value }) => (
      <div className="text-center p-2">
        <p className="text-sm font-semibold text-slate-600">{label}</p>
        <p className="text-3xl font-bold text-slate-800 mt-1">{value}</p>
      </div>
    );

    return (
      <div className="space-y-6">
        {!isExamSelected ? (
          <ExamSelectionWizard />
        ) : (
          <>
            <Card>
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-slate-600">Your Progress for:</h3>
                  <p className="text-lg font-bold text-slate-800 mt-1 truncate max-w-[200px] sm:max-w-xs md:max-w-md" title={selectionPath}>{selectionPath}</p>
                </div>
                <button onClick={handleResetSelection} className="text-sm text-indigo-600 hover:underline font-semibold flex-shrink-0 ml-4 whitespace-nowrap">Change Exam</button>
              </div>
              <div className="mt-6 pt-6 border-t grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 divide-x divide-slate-200">
                <StatDisplay label="Syllabus Progress" value={`${progressPercentage}%`} />
                <StatDisplay label="Avg. Quiz Score" value={`${performanceStats.averageScore}%`} />
                <StatDisplay label="Topics Studied" value={performanceStats.topicsStudied} />
                <StatDisplay label="Topics Mastered" value={performanceStats.topicsMastered} />
              </div>
            </Card>

            <Card className="!p-6 bg-indigo-50 border-indigo-200 hover:shadow-xl hover:border-indigo-300 transition-all duration-300">
                <button onClick={() => setView(AppView.AI_STUDY_PLAN)} className="w-full text-left">
                    <div className="flex flex-col sm:flex-row sm:items-center">
                        <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center bg-indigo-100 rounded-full mr-4 mb-3 sm:mb-0">
                            <SparklesIcon className="w-7 h-7 text-indigo-600" />
                        </div>
                        <div className="flex-grow">
                            <h3 className="text-xl font-bold text-slate-800">Your Personalized AI Study Plan</h3>
                            <p className="text-slate-600 mt-1">Get a custom weekly plan based on your progress and weak areas.</p>
                        </div>
                        <div className="mt-4 sm:mt-0 sm:ml-4 flex-shrink-0">
                           <span className="px-5 py-2.5 rounded-lg font-semibold bg-indigo-600 text-white shadow-md">Generate Plan</span>
                        </div>
                    </div>
                </button>
            </Card>
  
            <div className="mt-6">
              <h2 className="text-xl font-bold text-slate-800 mb-4">All Tools</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {allTools.map(tool => (
                  <button key={tool.title} onClick={() => setView(tool.view)} disabled={tool.disabled} className="text-left p-4 bg-white rounded-xl border border-slate-200 shadow-sm hover:border-indigo-400 hover:-translate-y-1 transition-all duration-200 disabled:opacity-50 disabled:hover:translate-y-0 disabled:cursor-not-allowed">
                    <div className="w-10 h-10 flex items-center justify-center bg-indigo-100 text-indigo-600 rounded-lg mb-3">{tool.icon}</div>
                    <h4 className="font-bold text-slate-900">{tool.title}</h4>
                    <p className="text-xs text-slate-500 mt-1">{tool.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    );
  };

  const ExamSelectionWizard = () => {
    
    const SelectionCard: React.FC<{title: string; subtitle?: string; onClick: () => void;}> = ({ title, subtitle, onClick }) => (
      <button onClick={onClick} className="w-full h-full p-4 text-center bg-white rounded-xl border-2 border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/50 hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-400 flex flex-col justify-center">
        <h4 className="font-bold text-slate-800 text-base leading-tight">{title}</h4>
        {subtitle && <p className="text-sm text-slate-500 mt-1">{subtitle}</p>}
      </button>
    );

    const renderStep1_Level = () => (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 h-28">
           {SELECTION_LEVELS.map(level => (
               <SelectionCard key={level} title={level} onClick={() => handleSelectionLevelChange(level)} />
           ))}
        </div>
    );

    const renderStep2_StateOrQual = () => (
        <>
            {selectionLevel === 'State Level' && <Select label="Choose your state" options={INDIAN_STATES.map(s => s.name)} value={selectedState} onChange={e => setSelectedState(e.target.value)} placeholder="Select a state..." />}
            {selectionLevel === 'Exams by Qualification' && <Select label="Choose your qualification" options={QUALIFICATION_CATEGORIES} value={selectedQualification} onChange={e => setSelectedQualification(e.target.value)} placeholder="Select a qualification..." />}
        </>
    );

    const renderStep_CBSE_Subject = () => (
        <Select 
            label="Choose your subject" 
            options={CBSE_10_SUBJECTS} 
            value={selectedSubCategory} 
            onChange={e => {
                setSelectedExam('CBSE 10th');
                handleSubCategoryChange(e.target.value);
            }} 
            placeholder="Select a subject..." 
        />
    );
    
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
            <Select label="Select a sub-category or specific exam" options={subCategories.map(s => s.name)} value={selectedSubCategory} onChange={e => handleSubCategoryChange(e.target.value)} placeholder="Select..." />
        ) : (isDynamicDetailsLoading ? <LoadingSpinner/> : <p className="text-slate-500">This exam has no further sub-categories. You can now use the tools.</p>)
    );

    const renderStep5_Tier = () => (
        tiers && tiers.length > 0 ? (
            <Select label="Select a tier or stage (if applicable)" options={tiers.map(t => t.name)} value={selectedTier} onChange={e => setSelectedTier(e.target.value)} placeholder="Select a tier..." />
        ) : null
    );

    const renderWizardSteps = () => {
        if (!selectionLevel) {
            return renderStep1_Level();
        }
        if (selectionLevel === '10th Class (CBSE)') {
            if (!selectedSubCategory) return renderStep_CBSE_Subject();
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
      <Card>
          <h2 className="text-2xl font-bold text-slate-900">Welcome, {user ? user.name.split(' ')[0] : 'Guest'}!</h2>
          <p className="text-slate-600 mt-1 mb-6">Let's get started by selecting your preparation path.</p>
          
          <div className="space-y-6">
              {renderWizardSteps()}
              {dynamicDetailsError && <p className="text-red-500 bg-red-100 p-3 rounded-md">{dynamicDetailsError}</p>}
          </div>
          
          {selectionLevel && (
              <div className="mt-6 pt-4 border-t">
                  <Button variant="secondary" onClick={handleResetSelection}>Start Over</Button>
              </div>
          )}
      </Card>
    );
  };
  
  const NavItem: React.FC<{ view: AppView; label: string; icon: React.ReactNode; currentView: AppView; setView: (v: AppView) => void; isSidebar?: boolean; disabled?: boolean; }> = 
  ({ view, label, icon, currentView, setView, isSidebar = false, disabled = false }) => {
    const isActive = view === currentView;
    const baseClasses = `flex transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed`;
    const activeClasses = isSidebar ? 'bg-indigo-100 text-indigo-700' : 'text-indigo-600';
    const inactiveClasses = isSidebar ? 'text-slate-600 hover:bg-slate-200 hover:text-slate-900' : 'text-slate-500';
    const layoutClasses = isSidebar ? 'items-center p-3 rounded-lg w-full text-left' : 'flex-col items-center justify-center flex-1 py-2';
    
    return (
      <button onClick={() => { setView(view); setIsSidebarOpen(false); }} disabled={disabled} className={`${baseClasses} ${layoutClasses} ${isActive ? activeClasses : inactiveClasses}`}>
        <div className={isSidebar ? 'mr-3' : 'mb-1'}>{icon}</div>
        <span className="text-xs font-semibold">{label}</span>
      </button>
    );
  };
  
  const navItems = [
    { view: AppView.HOME, label: "Dashboard", icon: <HomeIcon className="w-6 h-6" /> },
    { view: AppView.STUDY, label: "Explore", icon: <BookOpenIcon className="w-6 h-6" />, disabled: !isExamSelected },
    { view: AppView.LEARNING_TRACKER, label: "Insights", icon: <ChartPieIcon className="w-6 h-6" /> },
  ];

  return (
    <div className="flex h-full bg-slate-100">
      {/* Sidebar for md and up */}
      <aside className={`fixed lg:relative inset-y-0 left-0 z-40 w-64 bg-white border-r border-slate-200 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 transition-transform duration-300 ease-in-out`}>
        <div className="flex items-center justify-between p-4 border-b border-slate-200 h-16">
          <h1 className="text-xl font-bold text-slate-800">Club of Competition</h1>
          <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-1 text-slate-500 hover:text-slate-800">
              <XMarkIcon className="w-6 h-6" />
          </button>
        </div>
        <nav className="p-4 space-y-2">
            {navItems.map(item => <NavItem key={item.label} {...item} currentView={view} setView={setView} isSidebar />)}
        </nav>
      </aside>

      <div className="flex-1 flex flex-col h-full w-full">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-lg shadow-sm">
          <div className="flex items-center justify-between p-2 sm:p-4 h-16">
            <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-1 text-slate-500">
                <Bars3Icon className="w-6 h-6" />
            </button>
            <div className="text-sm font-semibold text-indigo-700 bg-indigo-100 px-3 py-1.5 rounded-full truncate max-w-[150px] sm:max-w-xs md:max-w-md" title={selectionPath}>
              {selectionPath ? selectionPath : 'No Exam Selected'}
            </div>
             <div className="flex items-center gap-2 sm:gap-4">
                 <Select 
                    label=""
                    options={LANGUAGES}
                    value={language}
                    onChange={e => setLanguage(e.target.value)}
                    className="text-sm !py-2 !px-3 max-w-[120px] sm:max-w-xs"
                />
                 {authInitialized && (
                    user ? (
                        <div className="flex items-center gap-2 group relative">
                            <img src={user.picture} alt={user.name} className="w-8 h-8 rounded-full" referrerPolicy="no-referrer" />
                            <button onClick={handleLogout} className="hidden sm:block text-sm font-semibold text-slate-600 hover:text-indigo-600 px-2 py-1 rounded-md hover:bg-slate-100">
                                Logout
                            </button>
                        </div>
                    ) : (
                        <div className="relative">
                            <Button onClick={handleLogin} variant="secondary">Login with Google</Button>
                            {authError && <p role="alert" className="absolute top-full right-0 mt-1 w-48 text-xs text-red-600 text-right">{authError}</p>}
                        </div>
                    )
                 )}
             </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
            <div className="pb-16 lg:pb-0">
                <MainContent />
            </div>
        </main>
      </div>

      {/* Bottom Nav for mobile */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 lg:hidden flex justify-around bg-white border-t border-slate-200 shadow-[0_-2px_5px_rgba(0,0,0,0.05)]">
        {navItems.map(item => (
            <NavItem key={item.label} {...item} currentView={view} setView={setView} />
        ))}
      </nav>
    </div>
  );
};

export default App;