
import React, { useState, useMemo, useEffect } from 'react';
import { type LastSelection } from '../types';
import { EXAM_DATA, INDIAN_STATES, QUALIFICATION_CATEGORIES, SCHOOL_CLASSES, SCHOOL_STREAMS, SCHOOL_SUBJECTS, SELECTION_LEVELS } from '../constants';
import ArrowLeftIcon from './icons/ArrowLeftIcon';
import ArrowPathIcon from './icons/ArrowPathIcon';

interface WizardProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectionComplete: (selection: LastSelection) => void;
}

interface View {
  title: string;
  options: { value: string, label: string }[];
  onSelect: (value: string) => void;
}

interface HistoryItem {
  view: View;
  selectionState: Partial<LastSelection>;
}

const ExamSelectionWizard: React.FC<WizardProps> = ({ isOpen, onClose, onSelectionComplete }) => {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [selection, setSelection] = useState<Partial<LastSelection>>({});
  const [searchTerm, setSearchTerm] = useState('');

  const generateNextView = (currentSelection: Partial<LastSelection>): View | null => {
    const { selectionLevel, selectedState, selectedExam, selectedSubCategory, selectedQualification } = currentSelection;
    
    if (!selectionLevel) {
      return {
        title: 'Select Your Focus Area',
        options: SELECTION_LEVELS.map(l => ({ value: l, label: l })),
        onSelect: (value) => advance({ ...currentSelection, selectionLevel: value }),
      };
    }
    
    switch (selectionLevel) {
        case 'National Level': {
            if (!selectedExam) return {
                title: 'National Exams',
                options: EXAM_DATA.national.map(e => ({ value: e.name, label: e.name })),
                onSelect: (value) => advance({ ...currentSelection, selectedExam: value }),
            };
            const exam = EXAM_DATA.national.find(e => e.name === selectedExam);
            if (!selectedSubCategory) return {
                title: selectedExam,
                options: exam?.subCategories?.map(sc => ({ value: sc.name, label: sc.name })) || [],
                onSelect: (value) => advance({ ...currentSelection, selectedSubCategory: value }),
            };
            const subCategory = exam?.subCategories?.find(sc => sc.name === selectedSubCategory);
            if (subCategory?.tiers?.length) return {
                title: selectedSubCategory,
                options: subCategory.tiers.map(t => ({ value: t.name, label: t.name })),
                onSelect: (value) => complete({ ...currentSelection, selectedTier: value }),
            };
            // Handle one level of nested sub-categories by treating them as the final tier.
            if (subCategory?.subCategories?.length) return {
                title: selectedSubCategory,
                options: subCategory.subCategories.map(ssc => ({ value: ssc.name, label: ssc.name })),
                onSelect: (value) => complete({ ...currentSelection, selectedTier: value }),
            };
            break;
        }
        case 'State Level': {
            if (!selectedState) return {
                title: 'Select State',
                options: INDIAN_STATES.map(s => ({ value: s.name, label: s.name })),
                onSelect: (value) => advance({ ...currentSelection, selectedState: value }),
            };
            const stateExams = EXAM_DATA.state[selectedState as keyof typeof EXAM_DATA.state];
            if (!selectedExam) return {
                title: selectedState,
                options: stateExams.map(e => ({ value: e.name, label: e.name })),
                onSelect: (value) => advance({ ...currentSelection, selectedExam: value }),
            };
            const exam = stateExams.find(e => e.name === selectedExam);
            if (!selectedSubCategory) return {
                title: selectedExam,
                options: exam?.subCategories?.map(sc => ({ value: sc.name, label: sc.name })) || [],
                onSelect: (value) => advance({ ...currentSelection, selectedSubCategory: value }),
            };
            const subCategory = exam?.subCategories?.find(sc => sc.name === selectedSubCategory);
            if (subCategory?.tiers?.length) return {
                title: selectedSubCategory,
                options: subCategory.tiers.map(t => ({ value: t.name, label: t.name })),
                onSelect: (value) => complete({ ...currentSelection, selectedTier: value }),
            };
            break;
        }
        case 'Entrance Exams': {
             if (!selectedExam) return {
                title: 'Entrance Exams',
                options: EXAM_DATA.entrance.map(e => ({ value: e.name, label: e.name })),
                onSelect: (value) => advance({ ...currentSelection, selectedExam: value }),
            };
            const exam = EXAM_DATA.entrance.find(e => e.name === selectedExam);
            if (!selectedSubCategory) return {
                title: selectedExam,
                options: exam?.subCategories?.map(sc => ({ value: sc.name, label: sc.name })) || [],
                onSelect: (value) => advance({ ...currentSelection, selectedSubCategory: value }),
            };
            break;
        }
        case 'Exams by Qualification': {
            if (!selectedQualification) {
                return {
                    title: 'Select Your Qualification',
                    options: QUALIFICATION_CATEGORIES.map(q => ({ value: q, label: q })),
                    onSelect: (value) => complete({ ...currentSelection, selectedQualification: value }),
                };
            }
            break;
        }
        case 'School Syllabus (NCERT)': {
            if (!selectedExam) { // selectedExam will hold class
                return {
                    title: 'Select Class',
                    options: SCHOOL_CLASSES.map(c => ({ value: c, label: c })),
                    onSelect: (value) => advance({ ...currentSelection, selectedExam: value }),
                };
            }
            const classNum = parseInt(selectedExam.replace('Class ', ''));
            if (classNum > 10 && !selectedSubCategory) { // selectedSubCategory will hold stream
                return {
                    title: 'Select Stream',
                    options: SCHOOL_STREAMS.map(s => ({ value: s, label: s })),
                    onSelect: (value) => advance({ ...currentSelection, selectedSubCategory: value }),
                };
            }
            let subjectKey = '';
            if (classNum <= 8) subjectKey = 'junior';
            else if (classNum <= 10) subjectKey = 'secondary';
            else subjectKey = `${selectedExam}_${selectedSubCategory}`;
            
            const subjects = SCHOOL_SUBJECTS[subjectKey] || [];
            return {
                title: 'Select Subject',
                options: subjects.map(s => ({ value: s, label: s })),
                onSelect: (value) => complete({ ...currentSelection, selectedTier: value }), // selectedTier will hold subject
            };
        }
    }
    // If no more steps are generated, it means the current path is complete.
    complete(currentSelection);
    return null;
  };

  const advance = (newSelection: Partial<LastSelection>) => {
    setSearchTerm('');
    const nextView = generateNextView(newSelection);
    if (nextView) {
      setSelection(newSelection);
      setHistory(prev => [...prev, { view: nextView, selectionState: newSelection }]);
    }
  };

  const complete = (finalSelection: Partial<LastSelection>) => {
    const fullSelection: LastSelection = {
        selectionLevel: '', selectedState: '', selectedQualification: '',
        selectedExam: '', selectedSubCategory: '', selectedTier: '',
        ...finalSelection,
    };
    onSelectionComplete(fullSelection);
    reset();
  };
  
  const reset = () => {
    setHistory([]);
    setSelection({});
    setSearchTerm('');
  };
  
  const initWizard = () => {
      const initialSelection = {};
      const firstView = generateNextView(initialSelection);
      if (firstView) {
          setHistory([{ view: firstView, selectionState: initialSelection }]);
          setSelection(initialSelection);
          setSearchTerm('');
      }
  };

  useEffect(() => {
      if (isOpen && history.length === 0) {
          initWizard();
      } else if (!isOpen) {
          reset();
      }
  }, [isOpen]);

  const goBack = () => {
    if (history.length <= 1) return;
    
    setSearchTerm('');
    const newHistory = history.slice(0, -1);
    setHistory(newHistory);
    
    // Restore selection state from the previous history item
    const previousState = newHistory[newHistory.length - 1].selectionState;
    setSelection(previousState);
  };
  
  const handleStartOver = () => {
      initWizard();
  };

  const currentViewItem = history[history.length - 1];
  const currentView = currentViewItem?.view;

  const filteredOptions = useMemo(() => {
    if (!searchTerm || !currentView) return currentView?.options || [];
    return currentView.options.filter(option =>
      option.label.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [currentView, searchTerm]);


  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-100 dark:bg-slate-900 z-50 flex flex-col animate-slide-up">
      <div className="w-full h-full flex flex-col">
        <header className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center flex-shrink-0 bg-white dark:bg-slate-800">
          <div className="flex items-center gap-2">
            {history.length > 1 && (
                <>
                    <button onClick={goBack} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center gap-1 transition-colors" aria-label="Go back">
                        <ArrowLeftIcon className="w-5 h-5" />
                        <span className="hidden sm:inline text-sm font-medium">Back</span>
                    </button>
                    <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-1" />
                </>
            )}
            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 truncate">{currentView?.title}</h3>
          </div>
          <div className="flex items-center gap-2">
            {history.length > 1 && (
                <button onClick={handleStartOver} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 flex items-center gap-1 mr-1 transition-colors" title="Start Over">
                    <ArrowPathIcon className="w-5 h-5" />
                    <span className="hidden sm:inline text-xs font-medium">Start Over</span>
                </button>
            )}
            <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
          </div>
        </header>

        {(currentView?.options?.length || 0) > 8 && (
            <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex-shrink-0 bg-white dark:bg-slate-800">
                <input
                    type="search"
                    placeholder="Search options..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 rounded-xl text-lg focus:ring-2 focus:ring-indigo-300"
                />
            </div>
        )}

        <div className="overflow-y-auto p-4 flex-grow">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {filteredOptions.map(option => (
              <button
                key={option.value}
                onClick={() => currentView.onSelect(option.value)}
                className="w-full p-5 text-left bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/40 transition-all flex justify-between items-center shadow-sm group"
              >
                <span className="font-semibold text-lg text-slate-700 dark:text-slate-200 group-hover:text-indigo-700 dark:group-hover:text-indigo-300">{option.label}</span>
                <span className="text-slate-400 dark:text-slate-500 group-hover:translate-x-1 transition-transform">&rarr;</span>
              </button>
            ))}
            {filteredOptions.length === 0 && <p className="text-slate-500 dark:text-slate-400 text-center col-span-full py-20 text-lg">No results for "{searchTerm}".</p>}
          </div>
        </div>
      </div>
       <style>{`
            @keyframes slide-up { 
                from { transform: translateY(100%); } 
                to { transform: translateY(0); }
            }
            .animate-slide-up { animation: slide-up 0.3s ease-out forwards; }
        `}</style>
    </div>
  );
};

export default ExamSelectionWizard;
