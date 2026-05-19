
import React from 'react';
import { AppView } from '../types';

interface ToolsProps {
  setView: (view: AppView) => void;
}

const ToolCard: React.FC<{
    title: string;
    description: string;
    onClick: () => void;
}> = ({ title, description, onClick }) => (
    <button 
        onClick={onClick}
        className="group w-full text-left p-6 bg-white dark:bg-slate-800 rounded-xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm hover:border-indigo-400 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
    >
        <div className="flex items-start gap-4">
            <div className="flex-grow">
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-lg">{title}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{description}</p>
            </div>
            <span className="text-slate-400 group-hover:text-indigo-500 transition-colors self-center">→</span>
        </div>
    </button>
);

const Tools: React.FC<ToolsProps> = ({ setView }) => {
  
  const careerTools = [
     { 
        title: "Mock Interview Coach",
        description: "Practice for your interview with a COC AI-powered mock session.",
        view: AppView.INTERVIEW
    },
     { 
        title: "Career Compass",
        description: "Get COC AI-powered career advice, chart your next steps, and find upskilling resources.",
        view: AppView.CAREER_COMPASS
    },
    { 
        title: "COC AI Resume Builder",
        description: "Craft a professional, standout resume with the help of COC AI.",
        view: AppView.AI_RESUME_BUILDER
    },
     {
        title: "Job Notifications",
        description: "Find the latest government job openings from national and state sources.",
        view: AppView.JOB_NOTIFICATIONS
    },
  ];

  const studyTools = [
    {
        title: "Quiz Generator",
        description: "Generate custom quizzes based on your selected exam syllabus.",
        view: AppView.QUIZ
    },
    { 
        title: "Flashcards Generator",
        description: "Create and study with decks of digital flashcards for any topic.",
        view: AppView.FLASHCARDS_GENERATOR
    },
    { 
        title: "Doubt Solver",
        description: "Stuck on a problem? Take a photo and get an instant COC AI explanation.",
        view: AppView.DOUBT_SOLVER
    },
    { 
        title: "Scientific Calculator",
        description: "A handy calculator for all your complex calculation needs during study sessions.",
        view: AppView.SCIENTIFIC_CALCULATOR
    },
  ];

  const visualizationTools = [
      { 
        title: "Map Learning",
        description: "Interactive map-based pointer challenge for geography and history.",
        view: AppView.MAP_INTERACTIVE_LEARNING
    },
      { 
        title: "Mind Map Generator",
        description: "Visually structure and connect concepts for any topic.",
        view: AppView.MIND_MAP
    },
    { 
        title: "Concept Link Map",
        description: "Understand prerequisites and related topics for any concept.",
        view: AppView.CONCEPT_LINK_MAP
    },
  ];
  
  const advancedLearningTools = [
      { 
        title: "Subject Learning Techniques",
        description: "Discover the best evidence-based study methods tailored to your specific subject.",
        view: AppView.LEARNING_TECHNIQUES
      },
      { 
        title: "Story Tutor",
        description: "Master complex topics and solve questions through engaging stories.",
        view: AppView.STORY_TUTOR
      },
      { 
        title: "Teach-back Mode",
        description: "Reinforce learning by explaining a concept to your COC AI partner.",
        view: AppView.TEACH_BACK_MODE
    },
    { 
        title: "Self-summary Challenge",
        description: "Test your understanding by writing a summary and get expert COC AI feedback.",
        view: AppView.SELF_SUMMARY_CHALLENGE
    },
    { 
        title: "Concept to Real Life",
        description: "Discover how abstract concepts apply in the real world.",
        view: AppView.REAL_LIFE_EXAMPLES
    },
    { 
        title: "COC AI Guess Paper",
        description: "Get a set of COC AI-predicted questions based on exam patterns.",
        view: AppView.GUESS_PAPER
    },
    { 
        title: "Study Roadmap",
        description: "Generate a personalized, phase-by-phase study plan for your exam.",
        view: AppView.STUDY_ROADMAP
    },
    { 
        title: "Aptitude Shortcuts",
        description: "Learn important shortcuts, tricks, and formulas for aptitude topics.",
        view: AppView.TEACH_SHORTCUTS
    },
  ]

  return (
    <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Tools Hub</h2>
            <p className="text-slate-500 dark:text-slate-400 mt-2">Specialized COC AI tools to boost your career and learning.</p>
        </div>
        
        <div className="space-y-10">
            <div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-4">Career Development</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {careerTools.map(tool => <ToolCard key={tool.view} {...tool} onClick={() => setView(tool.view)} />)}
                </div>
            </div>
             <div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-4">Advanced Learning</h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {advancedLearningTools.map(tool => <ToolCard key={tool.view} {...tool} onClick={() => setView(tool.view)} />)}
                </div>
            </div>
             <div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-4">Visual Tools</h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {visualizationTools.map(tool => <ToolCard key={tool.view} {...tool} onClick={() => setView(tool.view)} />)}
                </div>
            </div>
            <div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-4">Study Utilities</h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {studyTools.map(tool => <ToolCard key={tool.view} {...tool} onClick={() => setView(tool.view)} />)}
                </div>
            </div>
        </div>
    </div>
  );
};

export default Tools;
