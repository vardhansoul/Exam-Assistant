import React, { useState, useEffect, useMemo } from 'react';
import { AppView, ExamDetailGroup, ExamByQualification } from './types';
// Fix: Import EXAM_DATA to resolve reference errors.
import { LANGUAGES, QUALIFICATION_CATEGORIES, SELECTION_LEVELS, INDIAN_STATES, EXAM_DATA } from './constants';
import { generateExamsByQualification, getSpecificErrorMessage, generateTopicsForExam, generateExamDetails } from './services/geminiService';
import { getLastSelection, saveLastSelection } from './utils/tracking';
import QuizGenerator from './components/QuizGenerator';
import StudyHelper from './components/StudyHelper';
import MockInterview from './components/MockInterview';
import LearningTracker from './components/LearningTracker';
import SyllabusTracker from './components/SyllabusTracker';
import ResultTracker from './components/ResultTracker';
import AdmitCardTracker from './components/AdmitCardTracker';
import ApplicationTracker from './components/ApplicationTracker';
import CurrentAffairsAnalyst from './components/CurrentAffairsAnalyst';
import MindMapGenerator from './components/MindMapGenerator';
import Card from './components/Card';
import Select from './components/Select';
import Button from './components/Button';
import { BookOpenIcon } from './components/icons/BookOpenIcon';
import { ClipboardListIcon } from './components/icons/ClipboardListIcon';
import { UserGroupIcon } from './components/icons/UserGroupIcon';
import { AcademicCapIcon } from './components/icons/AcademicCapIcon';
import { ChartBarIcon } from './components/icons/ChartBarIcon';
import { ClipboardCheckIcon } from './components/icons/ClipboardCheckIcon';
import { CalendarDaysIcon } from './components/icons/CalendarDaysIcon';
import { GlobeAltIcon } from './components/icons/GlobeAltIcon';
import { InformationCircleIcon } from './components/icons/InformationCircleIcon';
import { TrophyIcon } from './components/icons/TrophyIcon';
import { DocumentTextIcon } from './components/icons/DocumentTextIcon';
import { KeyIcon } from './components/icons/KeyIcon';
import { ArrowPathIcon } from './components/icons/ArrowPathIcon';
import { RectangleGroupIcon } from './components/icons/RectangleGroupIcon';
import LoadingSpinner from './components/LoadingSpinner';
import { ChevronRightIcon } from './components/icons/ChevronRightIcon';


const FeatureCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
  disabled?: boolean;
}> = ({ icon, title, description, onClick, disabled = false }) => (
  <button onClick={onClick} disabled={disabled} className="text-left w-full h-full p-6 bg-white rounded-2xl border border-gray-200/80 shadow-md hover:shadow-xl hover:border-indigo-300 hover:-translate-y-1 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 group disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:shadow-md disabled:cursor-not-allowed">
    <div className="flex items-center justify-center w-12 h-12 bg-indigo-100 text-indigo-600 rounded-xl mb-5 transition-colors duration-300 group-hover:bg-indigo-600 group-hover:text-white">
      {icon}
    </div>
    <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
    <p className="text-gray-600 text-sm">{description}</p>
  </button>
);

const getIconForCriteria = (criteria: string) => {
    const lowerCriteria = criteria.toLowerCase();
    if (lowerCriteria.includes('age')) return <CalendarDaysIcon className="w-6 h-6 text-indigo-500" />;
    if (lowerCriteria.includes('qualification')) return <AcademicCapIcon className="w-6 h-6 text-indigo-500" />;
    if (lowerCriteria.includes('website') || lowerCriteria.includes('link')) return <GlobeAltIcon className="w-6 h-6 text-indigo-500" />;
    if (lowerCriteria.includes('date')) return <CalendarDaysIcon className="w-6 h-6 text-indigo-500" />;
    if (lowerCriteria.includes('selection') || lowerCriteria.includes('process')) return <ClipboardCheckIcon className="w-6 h-6 text-indigo-500" />;
    return <InformationCircleIcon className="w-6 h-6 text-indigo-500" />;
};

const getViewTitle = (view: AppView): string => {
    switch (view) {
        case AppView.QUIZ: return "Quiz Generator";
        case AppView.STUDY: return "AI Study Helper";
        case AppView.INTERVIEW: return "Mock Interview";
        case AppView.LEARNING_TRACKER: return "Progress & Insights";
        case AppView.SYLLABUS_TRACKER: return "Syllabus Tracker";
        case AppView.RESULT_TRACKER: return "Result Tracker";
        case AppView.ADMIT_CARD_TRACKER: return "Admit Card Tracker";
        case AppView.APPLICATION_TRACKER: return "Application Tracker";
        case AppView.CURRENT_AFFAIRS: return "Current Affairs Analyst";
        case AppView.MIND_MAP: return "Mind Map Generator";
        default: return "";
    }
};


const App: React.FC = () => {
  const [view, setView] = useState<AppView>(AppView.HOME);
  const [language, setLanguage] = useState<string>(LANGUAGES[0]);
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);

  // --- Selection State ---
  const [selectionLevel, setSelectionLevel] = useState<string>('');
  const [selectedState, setSelectedState] = useState<string>('');
  const [selectedQualification, setSelectedQualification] = useState<string>('');
  const [selectedExam, setSelectedExam] = useState<string>(''); // Exam Category
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>(''); // Specific Exam
  const [selectedTier, setSelectedTier] = useState<string>('');

  // --- State for "By Qualification" API calls ---
  const [qualificationExams, setQualificationExams] = useState<ExamByQualification[]>([]);
  const [isQualificationExamsLoading, setIsQualificationExamsLoading] = useState<boolean>(false);
  const [qualificationExamsError, setQualificationExamsError] = useState<string | null>(null);
  
  // --- State for dynamic fetching of exam details ---
  const [dynamicExamDetails, setDynamicExamDetails] = useState<{ topics: string[]; details: ExamDetailGroup[] } | null>(null);
  const [isDynamicDetailsLoading, setIsDynamicDetailsLoading] = useState<boolean>(false);
  const [dynamicDetailsError, setDynamicDetailsError] = useState<string | null>(null);

  // Load last selection on mount
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

  // Save selection on change
  useEffect(() => {
    if (selectionLevel) { // Only save if a path has been started
        saveLastSelection({
            selectionLevel,
            selectedState,
            selectedQualification,
            selectedExam,
            selectedSubCategory,
            selectedTier,
        });
    }
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

  // --- Derived data from constants and dynamic calls ---
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
    const subCategory = subCategories.find(sub => sub.name === selectedSubCategory);
    return subCategory?.tiers || [];
  }, [subCategories, selectedSubCategory]);

  const { staticTopics, staticDetails } = useMemo(() => {
      let topics: string[] | undefined;
      let details: ExamDetailGroup[] | undefined;

      const subCat = subCategories.find(sc => sc.name === selectedSubCategory);
      if (selectedTier) {
          const tier = subCat?.tiers?.find(t => t.name === selectedTier);
          topics = tier?.topics;
          details = tier?.details;
      } else {
          topics = subCat?.topics;
          details = subCat?.details;
      }
      return { staticTopics: topics, staticDetails: details };
  }, [subCategories, selectedSubCategory, selectedTier]);

  const examTopics = staticTopics ?? (dynamicExamDetails?.topics ?? []);
  const examDetails = staticDetails ?? (dynamicExamDetails?.details ?? []);
  
  const selectionPath = [
    selectionLevel === 'State Level' ? selectedState : null,
    selectedExam,
    selectedSubCategory,
    selectedTier
  ].filter(Boolean).join(' - ');


  // --- Event Handlers for Selection ---
  const handleSelectionLevelChange = (level: string) => {
    setSelectionLevel(level);
    // Reset subsequent selections
    setSelectedState('');
    setSelectedQualification('');
    setSelectedExam('');
    setSelectedSubCategory('');
    setSelectedTier('');
    setDynamicExamDetails(null);
    setDynamicDetailsError(null);
    setQualificationExams([]);
    setQualificationExamsError(null);
  };
  
  const handleResetSelection = () => {
    handleSelectionLevelChange('');
    localStorage.removeItem('govPrepAiLastSelection');
  };
  
  const handleStateChange = (state: string) => {
    setSelectedState(state);
    setSelectedExam('');
    setSelectedSubCategory('');
    setSelectedTier('');
  };

  const handleQualificationChange = (qualification: string) => {
    setSelectedQualification(qualification);
    setSelectedExam('');
    setSelectedSubCategory('');
    setSelectedTier('');
    setQualificationExams([]);
    setQualificationExamsError(null);
  };
  
  const handleExamChange = (exam: string) => {
    setSelectedExam(exam);
    setSelectedSubCategory('');
    setSelectedTier('');
  };

  const handleSubCategoryChange = (subCategory: string) => {
      setSelectedSubCategory(subCategory);
      setSelectedTier('');
      setDynamicExamDetails(null); // Clear previous dynamic data
      setDynamicDetailsError(null);
  };

  const handleTierChange = (tier: string) => {
    setSelectedTier(tier);
    setDynamicExamDetails(null); // Clear previous dynamic data
    setDynamicDetailsError(null);
  };

  // --- Effect for "By Qualification" API call ---
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
  
  // --- Effect for dynamic detail fetching ---
  useEffect(() => {
    const shouldFetchDynamically = (selectionLevel === 'National Level' || selectionLevel === 'State Level') && selectedSubCategory && !staticTopics && !staticDetails;
    
    // For 'By Qualification', selectedExam holds category and selectedSubCategory holds exam name
    const shouldFetchForQualification = selectionLevel === 'Exams by Qualification' && selectedSubCategory && selectedExam;

    if (shouldFetchDynamically || shouldFetchForQualification) {
        const fetchDynamicDetails = async () => {
            setIsDynamicDetailsLoading(true);
            setDynamicDetailsError(null);
            try {
                const [topics, details] = await Promise.all([
                    generateTopicsForExam(selectedExam, selectedSubCategory, selectedTier, language),
                    generateExamDetails(selectedExam, selectedSubCategory, selectedTier, language)
                ]);
                if (topics.length === 0 && details.length === 0) {
                     setDynamicDetailsError(`The AI could not find detailed information for "${selectedSubCategory}". This might be a very specific or less common exam.`);
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSubCategory, selectedExam, selectedTier, language, selectionLevel, staticTopics, staticDetails]);


  const navigateHome = () => {
      setView(AppView.HOME);
  }

  const renderContent = () => {
    const isExamSelected = !!selectedSubCategory;

    switch (view) {
      case AppView.QUIZ:
        return <QuizGenerator topics={examTopics} language={language} isOnline={isOnline}/>;
      case AppView.STUDY:
        return <StudyHelper topics={examTopics} language={language} isOnline={isOnline} />;
      case AppView.INTERVIEW:
        return <MockInterview language={language} isOnline={isOnline} />;
      case AppView.LEARNING_TRACKER:
        return <LearningTracker />;
      case AppView.SYLLABUS_TRACKER:
        return <SyllabusTracker selectedExam={selectedExam} language={language} isOnline={isOnline} />;
      case AppView.RESULT_TRACKER:
        return <ResultTracker selection={{ selectedExam, selectedSubCategory, selectedTier }} language={language} isOnline={isOnline} />;
      case AppView.ADMIT_CARD_TRACKER:
        return <AdmitCardTracker selection={{ selectedExam, selectedSubCategory, selectedTier }} language={language} isOnline={isOnline} />;
      case AppView.APPLICATION_TRACKER:
        return <ApplicationTracker />;
      case AppView.CURRENT_AFFAIRS:
        return <CurrentAffairsAnalyst language={language} isOnline={isOnline} selectionPath={selectionPath} />;
      case AppView.MIND_MAP:
        return <MindMapGenerator topics={examTopics} language={language} isOnline={isOnline} />;
      case AppView.HOME:
      default:
        // Helper component for the new card-based selection
        const SelectionCard: React.FC<{
          title: string;
          subtitle?: string;
          onClick: () => void;
        }> = ({ title, subtitle, onClick }) => (
          <button
            onClick={onClick}
            className="w-full h-full p-4 text-center bg-white rounded-xl border-2 border-gray-200 hover:border-indigo-500 hover:bg-indigo-50/50 hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-400 flex flex-col justify-center"
          >
            <h4 className="font-bold text-gray-800 text-base leading-tight">{title}</h4>
            {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
          </button>
        );

        const handleBreadcrumbClick = (stepKey: string) => {
            switch(stepKey) {
                case 'root':
                    handleResetSelection();
                    break;
                case 'level':
                    setSelectedState('');
                    setSelectedQualification('');
                    setSelectedExam('');
                    setSelectedSubCategory('');
                    setSelectedTier('');
                    break;
                case 'state':
                case 'qualification':
                case 'exam_nat': // Exam category on national path
                    setSelectedExam('');
                    setSelectedSubCategory('');
                    setSelectedTier('');
                    break;
                case 'exam_state': // Exam category on state path
                    setSelectedSubCategory('');
                    setSelectedTier('');
                    break;
                case 'subcat_nat':
                case 'subcat_qual':
                    setSelectedSubCategory('');
                    setSelectedTier('');
                    break;
                case 'subcat_state':
                    setSelectedTier('');
                    break;
                default:
                    break;
            }
        };

        const ExamSelectorWizard = () => {
            let stepTitle = '';
            const breadcrumbItems: {label: string, key: string}[] = [{ label: 'Start', key: 'root' }];

            // Build breadcrumbs
            if (selectionLevel) {
                breadcrumbItems.push({ label: selectionLevel, key: 'level' });
                if (selectionLevel === 'State Level') {
                    if (selectedState) breadcrumbItems.push({ label: selectedState, key: 'state' });
                    if (selectedExam) breadcrumbItems.push({ label: selectedExam, key: 'exam_state' });
                    if (selectedSubCategory) breadcrumbItems.push({ label: selectedSubCategory, key: 'subcat_state' });
                } else if (selectionLevel === 'National Level') {
                    if (selectedExam) breadcrumbItems.push({ label: selectedExam, key: 'exam_nat' });
                    if (selectedSubCategory) breadcrumbItems.push({ label: selectedSubCategory, key: 'subcat_nat' });
                } else if (selectionLevel === 'Exams by Qualification') {
                     if (selectedQualification) breadcrumbItems.push({ label: selectedQualification, key: 'qualification' });
                     if (selectedSubCategory) breadcrumbItems.push({ label: selectedSubCategory, key: 'subcat_qual' });
                }
            }

            const renderStepContent = () => {
                if (!selectionLevel) {
                    stepTitle = 'Step 1: How would you like to find an exam?';
                    return (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {SELECTION_LEVELS.map(level => (
                                <SelectionCard key={level} title={level} onClick={() => handleSelectionLevelChange(level)} />
                            ))}
                        </div>
                    );
                }

                if (selectionLevel === 'Exams by Qualification') {
                     stepTitle = 'Select your qualification and exam';
                     return (
                         <div className="space-y-6">
                             <Select
                                 label="Step 2: Select Your Qualification"
                                 options={QUALIFICATION_CATEGORIES}
                                 value={selectedQualification}
                                 onChange={e => handleQualificationChange(e.target.value)}
                                 placeholder="Select your qualification..."
                             />
                             {isQualificationExamsLoading && <p className="text-sm text-gray-500 mt-2 animate-pulse">Finding matching exams...</p>}
                             {qualificationExamsError && <p className="text-sm text-red-500 mt-2 bg-red-50 p-2 rounded-md">{qualificationExamsError}</p>}
                             {selectedQualification && !isQualificationExamsLoading && (
                                  <Select
                                    label="Step 3: Select Specific Exam"
                                    options={qualificationExams.map(exam => exam.examName)}
                                    value={selectedSubCategory}
                                    onChange={e => {
                                        const selectedName = e.target.value;
                                        const examObject = qualificationExams.find(exam => exam.examName === selectedName);
                                        if (examObject) {
                                            setSelectedExam(examObject.examCategory);
                                            handleSubCategoryChange(examObject.examName);
                                        }
                                    }}
                                    disabled={qualificationExams.length === 0}
                                    placeholder={qualificationExams.length === 0 && !qualificationExamsError ? "No exams found for this qualification." : "Select an exam..."}
                                  />
                             )}
                         </div>
                     );
                }
                
                if (selectionLevel === 'State Level') {
                    if (!selectedState) {
                        stepTitle = 'Step 2: Select a State';
                        return (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                {INDIAN_STATES.map(state => <SelectionCard key={state.name} title={state.name} subtitle={state.capital} onClick={() => handleStateChange(state.name)} />)}
                            </div>
                        );
                    }
                    if (!selectedExam) {
                        stepTitle = 'Step 3: Select Exam Category';
                        if (examCategories.length === 0) return <p>No exam categories found for {selectedState}.</p>;
                        return (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">{examCategories.map(cat => <SelectionCard key={cat.name} title={cat.name} onClick={() => handleExamChange(cat.name)} />)}</div>
                        );
                    }
                    if (!selectedSubCategory) {
                        stepTitle = 'Step 4: Select Specific Exam';
                        if (subCategories.length === 0) return <p>No specific exams found for {selectedExam}.</p>;
                        return (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">{subCategories.map(sub => <SelectionCard key={sub.name} title={sub.name} onClick={() => handleSubCategoryChange(sub.name)} />)}</div>
                        );
                    }
                    if (tiers.length > 0 && !selectedTier) {
                        stepTitle = 'Step 5: Select Tier/Stage';
                        return (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">{tiers.map(tier => <SelectionCard key={tier.name} title={tier.name} onClick={() => handleTierChange(tier.name)} />)}</div>
                        );
                    }
                }
                
                if (selectionLevel === 'National Level') {
                    if (!selectedExam) {
                        stepTitle = 'Step 2: Select Exam Category';
                        return (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">{examCategories.map(cat => <SelectionCard key={cat.name} title={cat.name} onClick={() => handleExamChange(cat.name)} />)}</div>
                        );
                    }
                    if (!selectedSubCategory) {
                        stepTitle = 'Step 3: Select Specific Exam';
                        if (subCategories.length === 0) return <p>No specific exams found for {selectedExam}.</p>;
                        return (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">{subCategories.map(sub => <SelectionCard key={sub.name} title={sub.name} onClick={() => handleSubCategoryChange(sub.name)} />)}</div>
                        );
                    }
                    if (tiers.length > 0 && !selectedTier) {
                        stepTitle = 'Step 4: Select Tier/Stage';
                        return (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">{tiers.map(tier => <SelectionCard key={tier.name} title={tier.name} onClick={() => handleTierChange(tier.name)} />)}</div>
                        );
                    }
                }
                return null; // All selections made
            };

            const stepContent = renderStepContent();

            return (
                <Card className="mb-12">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h3 className="text-2xl font-bold text-gray-800">{stepTitle || 'Exam Selector'}</h3>
                            <div className="flex items-center flex-wrap text-sm text-gray-500 mt-2">
                                {breadcrumbItems.map((item, index) => (
                                    <React.Fragment key={item.key}>
                                        <button onClick={() => handleBreadcrumbClick(item.key)} className="hover:underline hover:text-indigo-600 disabled:text-gray-500 disabled:no-underline" disabled={index === breadcrumbItems.length - 1}>
                                            {item.label}
                                        </button>
                                        {index < breadcrumbItems.length - 1 && <ChevronRightIcon className="w-4 h-4 mx-1 flex-shrink-0" />}
                                    </React.Fragment>
                                ))}
                            </div>
                        </div>
                        {selectionLevel && (
                             <button onClick={handleResetSelection} className="text-sm text-indigo-600 hover:underline font-semibold flex items-center gap-1 flex-shrink-0 ml-4">
                                <ArrowPathIcon className="w-4 h-4" />
                                Reset
                            </button>
                        )}
                    </div>
                    {stepContent && <div className="mt-6 border-t pt-6">{stepContent}</div>}
                </Card>
            );
        };
        
        return (
          <>
            <div className="text-center mb-12">
                <h2 className="text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight">AI Exam Assistant</h2>
                <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">Your personal toolkit for government exam success. Select your exam below to get started.</p>
                 {!isOnline && <p className="mt-4 text-orange-600 font-semibold bg-orange-100 p-3 rounded-lg inline-block">Offline Mode: Some features may be limited.</p>}
            </div>
            
            {isExamSelected && view === AppView.HOME && (
                <div className="mb-8 p-4 bg-indigo-100 border-l-4 border-indigo-500 rounded-r-lg shadow-sm">
                    <h3 className="font-bold text-indigo-800">Currently Selected Exam:</h3>
                    <p className="text-indigo-700 mt-1">{selectionPath}</p>
                </div>
            )}

            <ExamSelectorWizard />
            
            {isDynamicDetailsLoading && (
                <div className="my-12">
                    <Card className="text-center">
                        <h3 className="text-xl font-semibold text-gray-700 mb-4">Fetching Exam Details...</h3>
                        <p className="text-gray-500 mb-6">The AI is gathering the latest information for {selectedSubCategory}.</p>
                        <LoadingSpinner />
                    </Card>
                </div>
            )}

            {dynamicDetailsError && (
                <div className="my-12">
                    <Card className="text-center">
                        <h3 className="text-2xl font-bold text-red-600 mb-4">Error</h3>
                        <p className="text-gray-600">{dynamicDetailsError}</p>
                    </Card>
                </div>
            )}

            { !isDynamicDetailsLoading && !dynamicDetailsError && selectedSubCategory && (examDetails.length > 0) && (
              <div className="my-12">
                <Card>
                  <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">Exam Details: {selectedSubCategory} {selectedTier && `(${selectedTier})`}</h3>
                   <div className="space-y-10">
                    {examDetails.map((group) => (
                      <div key={group.groupTitle}>
                        <h4 className="text-xl font-bold text-gray-800 pb-3 mb-6 border-b-2 border-indigo-100">{group.groupTitle}</h4>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          {group.details.map((detail, index) => (
                            <div key={index} className="bg-gray-50 p-5 rounded-xl flex items-start space-x-4 border border-gray-200">
                              <div className="flex-shrink-0 mt-1">
                                {getIconForCriteria(detail.criteria)}
                              </div>
                              <div>
                                <h5 className="text-md font-bold text-gray-800">{detail.criteria}</h5>
                                <div className="mt-1 text-sm text-gray-600 whitespace-pre-wrap">
                                  {(detail.criteria.toLowerCase().includes('link') || detail.criteria.toLowerCase().includes('website')) && detail.details.startsWith('http')
                                    ? <a href={detail.details} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline break-all">{detail.details}</a>
                                    : detail.details
                                  }
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            )}

            <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <FeatureCard
                icon={<GlobeAltIcon className="w-6 h-6" />}
                title="Current Affairs Analyst"
                description="Get real-time, sourced summaries on any topic and ask follow-up questions."
                onClick={() => setView(AppView.CURRENT_AFFAIRS)}
              />
              <FeatureCard
                icon={<ClipboardListIcon className="w-6 h-6" />}
                title="Quiz Generator"
                description="Create custom quizzes on any topic to test your knowledge."
                onClick={() => setView(AppView.QUIZ)}
                disabled={!isExamSelected}
              />
              <FeatureCard
                icon={<BookOpenIcon className="w-6 h-6" />}
                title="Study Helper"
                description="Get AI-generated notes and summaries for complex topics."
                onClick={() => setView(AppView.STUDY)}
                disabled={!isExamSelected}
              />
               <FeatureCard
                icon={<RectangleGroupIcon className="w-6 h-6" />}
                title="Mind Map Generator"
                description="Visually explore connections between concepts with AI-generated mind maps."
                onClick={() => setView(AppView.MIND_MAP)}
                disabled={!isExamSelected}
              />
              <FeatureCard
                icon={<UserGroupIcon className="w-6 h-6" />}
                title="Mock Interview"
                description="Practice with a realistic, AI-driven mock interview experience."
                onClick={() => setView(AppView.INTERVIEW)}
              />
               <FeatureCard
                icon={<ChartBarIcon className="w-6 h-6" />}
                title="Progress & Insights"
                description="Track quiz history, detect weak areas, and view study consistency."
                onClick={() => setView(AppView.LEARNING_TRACKER)}
              />
               <FeatureCard
                icon={<ClipboardCheckIcon className="w-6 h-6" />}
                title="Syllabus Tracker"
                description="Get an AI-generated syllabus and track your topic completion."
                onClick={() => setView(AppView.SYLLABUS_TRACKER)}
                disabled={!isExamSelected}
              />
              <FeatureCard
                icon={<TrophyIcon className="w-6 h-6" />}
                title="Result Tracker"
                description="Get real-time updates on exam result announcements."
                onClick={() => setView(AppView.RESULT_TRACKER)}
                disabled={!isExamSelected}
              />
              <FeatureCard
                icon={<DocumentTextIcon className="w-6 h-6" />}
                title="Admit Card Tracker"
                description="Find out when admit cards are released and get download links."
                onClick={() => setView(AppView.ADMIT_CARD_TRACKER)}
                disabled={!isExamSelected}
              />
              <FeatureCard
                icon={<KeyIcon className="w-6 h-6" />}
                title="Application Tracker"
                description="Securely save your application IDs and passwords locally."
                onClick={() => setView(AppView.APPLICATION_TRACKER)}
              />
            </div>
          </>
        );
    }
  };

  const viewTitle = useMemo(() => getViewTitle(view), [view]);

  return (
    <div className="min-h-full bg-gray-50 text-gray-800">
       {!isOnline && (
        <div className="bg-red-600 text-white text-center py-2 font-semibold text-sm">
          You are currently offline. Content may be cached.
        </div>
      )}
      <header className="bg-white/80 backdrop-blur-lg border-b border-gray-200 sticky top-0 z-20">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center">
              <button onClick={navigateHome} className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
                Gov<span className="text-indigo-600">Prep</span> AI
              </button>
            </div>
            {view !== AppView.HOME && (
                <div className="hidden sm:block">
                    <h2 className="text-xl font-bold text-gray-700">{viewTitle}</h2>
                </div>
            )}
            <div className="flex items-center gap-4">
              <div>
                <select
                  value={language}
                  onChange={e => setLanguage(e.target.value)}
                  className="bg-white border border-gray-300 rounded-md py-1.5 px-3 text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                  aria-label="Select language"
                >
                  {LANGUAGES.map(lang => (
                    <option key={lang} value={lang}>{lang}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </nav>
      </header>
      <main>
        <div className="max-w-5xl mx-auto py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
          {view !== AppView.HOME && (
            <div className="mb-6">
                <Button onClick={navigateHome} variant="secondary">
                      &larr; Back to Home
                </Button>
            </div>
          )}
          {renderContent()}
        </div>
      </main>
       <footer className="text-center py-6 text-sm text-gray-500">
            <p>Powered by AI. Built for Aspirants.</p>
        </footer>
    </div>
  );
};

export default App;