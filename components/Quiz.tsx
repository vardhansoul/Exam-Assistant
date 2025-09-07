
import React, { useState } from 'react';
import type { Quiz as QuizType } from '../types';
import Button from './Button';
import Card from './Card';
import { saveQuizResult } from '../utils/tracking';


interface QuizProps {
  quiz: QuizType;
  topic: string;
  onFinish: () => void;
}

const Quiz: React.FC<QuizProps> = ({ quiz, topic, onFinish }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [showResults, setShowResults] = useState(false);
  const [resultsSaved, setResultsSaved] = useState(false);

  if (!quiz || !quiz.questions || quiz.questions.length === 0) {
    return (
      <Card className="text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Quiz Generation Error</h2>
        <p className="text-gray-600 mb-6">The AI couldn't create questions for this topic. Please try again or choose another topic.</p>
        <Button onClick={onFinish}>Return</Button>
      </Card>
    );
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];

  const handleAnswerSelect = (answer: string) => {
    setSelectedAnswers(prev => ({ ...prev, [currentQuestionIndex]: answer }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      setShowResults(true);
    }
  };

  const calculateScore = () => {
    return quiz.questions.reduce((score, question, index) => {
      return selectedAnswers[index] === question.correctAnswer ? score + 1 : score;
    }, 0);
  };
  
  const score = calculateScore();
  
  if (showResults && !resultsSaved) {
      saveQuizResult({
          topic: topic,
          score: score,
          totalQuestions: quiz.questions.length,
          date: new Date().toISOString(),
      });
      setResultsSaved(true);
  }


  if (showResults) {
    const percentage = Math.round((score / quiz.questions.length) * 100);
    return (
      <Card className="text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Quiz Completed!</h2>
        <p className="text-gray-600 mb-8">Topic: {topic}</p>
        <p className="text-7xl font-extrabold text-indigo-600 mb-2">{score} <span className="text-4xl text-gray-500">/ {quiz.questions.length}</span></p>
        <p className="text-2xl font-semibold mb-8 text-gray-700">{percentage}%</p>
        <div className="w-full bg-gray-200 rounded-full h-4 mb-8">
            <div className="bg-green-500 h-4 rounded-full" style={{ width: `${percentage}%` }}></div>
        </div>
        <Button onClick={onFinish}>Try Another Quiz</Button>
      </Card>
    );
  }

  return (
    <Card>
      <div className="mb-6 border-b border-gray-200 pb-4">
        <p className="text-sm text-gray-500">Topic: {topic}</p>
        <p className="text-sm font-medium text-indigo-600">Question {currentQuestionIndex + 1} of {quiz.questions.length}</p>
      </div>
      <div>
        <h3 className="text-xl font-semibold text-gray-800 mt-1">{currentQuestion.question}</h3>
        {currentQuestion.questionEnglish && currentQuestion.question.toLowerCase() !== currentQuestion.questionEnglish.toLowerCase() && (
            <p className="text-md text-gray-500 mt-2">{currentQuestion.questionEnglish}</p>
        )}
      </div>
      <div className="space-y-4 mt-8">
        {currentQuestion.options.map((option, index) => {
          const isSelected = selectedAnswers[currentQuestionIndex] === option;
          const englishOption = currentQuestion.optionsEnglish && currentQuestion.optionsEnglish[index];
          const areDifferent = englishOption && option.toLowerCase() !== englishOption.toLowerCase();

          const buttonClasses = isSelected
            ? 'bg-indigo-100 border-indigo-500 ring-2 ring-indigo-300 text-indigo-800'
            : 'bg-white hover:bg-indigo-50/70 border-gray-300';

          return (
            <button
              key={option}
              onClick={() => handleAnswerSelect(option)}
              className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 transform hover:scale-[1.02] ${buttonClasses}`}
            >
              <span className="font-semibold">{option}</span>
              {areDifferent && <span className="text-sm text-gray-500 block mt-1">{englishOption}</span>}
            </button>
          );
        })}
      </div>
      <div className="mt-8 text-right">
        <Button onClick={handleNext} disabled={!selectedAnswers[currentQuestionIndex]}>
          {currentQuestionIndex < quiz.questions.length - 1 ? 'Next Question' : 'Finish Quiz'}
        </Button>
      </div>
    </Card>
  );
};

export default Quiz;