import React, { useState, useEffect } from 'react';
import { generateMicroTopics, generateStudyNotes, generateStoryForTopic, getSpecificErrorMessage } from '../services/geminiService';
import { getStudyNotesFromCache, markTopicAsStudied } from '../utils/tracking';
import type { StudyMaterial } from '../types';
import LoadingSpinner from './LoadingSpinner';
import Card from './Card';
import Button from './Button';
import Select from './Select';


interface TopicExplorerProps {
    topics: string[];
    language: string;
    onStartQuiz: (topic: string) => void;
    isOnline: boolean;
}

const TopicExplorer: React.FC<TopicExplorerProps> = ({ topics, language, onStartQuiz, isOnline }) => {
    const [mainTopic, setMainTopic] = useState<string>(topics.length > 0 ? topics[0] : '');
    const [microTopics, setMicroTopics] = useState<string[] | null>(null);
    const [selectedMicroTopic, setSelectedMicroTopic] = useState<string | null>(null);
    const [tutorialContent, setTutorialContent] = useState<StudyMaterial | null>(null);
    const [isLoadingTopics, setIsLoadingTopics] = useState<boolean>(false);
    const [isLoadingTutorial, setIsLoadingTutorial] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [stories, setStories] = useState<string[]>([]);
    const [isStoryLoading, setIsStoryLoading] = useState<boolean>(false);

    useEffect(() => {
        // If the available topics change and the currently selected topic is no longer in the list,
        // update the selection to the first available topic.
        if (topics.length > 0 && !topics.includes(mainTopic)) {
            setMainTopic(topics[0]);
        } else if (topics.length === 0) {
            setMainTopic('');
        }
    }, [topics, mainTopic]);

    const handleExploreTopics = async () => {
        if (!isOnline) {
             setError("You are offline. Please connect to the internet to explore new topics.");
             return;
        }
        setIsLoadingTopics(true);
        setError(null);
        setMicroTopics(null);
        setSelectedMicroTopic(null);
        setTutorialContent(null);
        try {
            const topics = await generateMicroTopics(mainTopic, language);
            setMicroTopics(topics);
        } catch (err) {
            setError(getSpecificErrorMessage(err));
        }
        setIsLoadingTopics(false);
    };

    const handleSelectMicroTopic = async (topic: string) => {
        setSelectedMicroTopic(topic);
        setIsLoadingTutorial(true);
        setTutorialContent(null);
        setStories([]);
        setIsStoryLoading(false);
        setError(null);

        if (!isOnline) {
            const cachedMaterial = getStudyNotesFromCache(topic, language);
            if (cachedMaterial) {
                setTutorialContent(cachedMaterial);
                setError("You are offline. Showing the last saved version of this tutorial.");
            } else {
                setError(`You are offline and no saved version is available for ${topic}. Please connect to the internet.`);
            }
            setIsLoadingTutorial(false);
            return;
        }

        try {
            markTopicAsStudied(topic);
            const notes = await generateStudyNotes(topic, language);
            setTutorialContent(notes);
        } catch (err) {
            setError(`Could not load tutorial for ${topic}. Reason: ${getSpecificErrorMessage(err)}`);
        }
        setIsLoadingTutorial(false);
    };

    const handleGenerateStory = async () => {
        if (!selectedMicroTopic || !isOnline) return;
        setIsStoryLoading(true);
        try {
            const generatedStory = await generateStoryForTopic(selectedMicroTopic, language);
            setStories(prevStories => [...prevStories, generatedStory]);
        } catch (err) {
            const errorMessage = getSpecificErrorMessage(err);
            setStories(prevStories => [...prevStories, `Error: ${errorMessage}`]);
        }
        setIsStoryLoading(false);
    };

    const formatNotes = (text: string) => {
        return text.split('\n').map((line, index) => {
            if (line.startsWith('Error:')) {
                return <p key={index} className="my-1 font-semibold text-red-600">{line}</p>;
            }
            if (line.startsWith('###')) {
                return <h3 key={index} className="text-lg font-semibold mt-4 mb-2">{line.replace('###', '').trim()}</h3>;
            }
            if (line.startsWith('##')) {
                return <h2 key={index} className="text-xl font-bold mt-6 mb-3">{line.replace('##', '').trim()}</h2>;
            }
            if (line.startsWith('#')) {
                return <h1 key={index} className="text-2xl font-extrabold mt-8 mb-4">{line.replace('#', '').trim()}</h1>;
            }
            if (line.startsWith('* ')) {
                return <li key={index} className="ml-5 list-disc">{line.replace('* ', '').trim()}</li>;
            }
            if (line.includes('**')) {
                const parts = line.split('**');
                return <p key={index}>{parts.map((part, i) => i % 2 === 1 ? <strong key={i}>{part}</strong> : part)}</p>
            }
            return <p key={index} className="my-1">{line}</p>;
        });
    };

    const renderInitialView = () => (
        <>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-6">Explore Micro-Topic Tutorials</h2>
            <p className="text-gray-600 mb-6">Select a broad subject, and the AI will break it down into smaller, manageable topics for you to study.</p>
            {error && <p className="text-red-500 bg-red-100 p-3 rounded-md mb-4">{error}</p>}
            <div className="space-y-4">
                <Select label="Select Subject" options={topics} value={mainTopic} onChange={e => setMainTopic(e.target.value)} disabled={topics.length === 0} />
            </div>
            <div className="mt-8">
                <Button onClick={handleExploreTopics} className="w-full" disabled={!isOnline || isLoadingTopics || topics.length === 0}>
                    {isLoadingTopics ? 'Exploring...' : (isOnline ? 'Explore Topics' : 'Offline')}
                </Button>
            </div>
        </>
    );
    
    if (isLoadingTopics) {
         return (
             <Card className="text-center">
                <h2 className="text-xl font-semibold text-gray-700 mb-4">Generating Micro-Topics...</h2>
                <p className="text-gray-500 mb-6">The AI is breaking down {mainTopic} for you.</p>
                <LoadingSpinner />
            </Card>
         );
    }

    return (
        <Card>
            {!microTopics ? renderInitialView() : (
                <div>
                    <div className="flex justify-between items-center border-b pb-3 mb-4">
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Explore: {mainTopic}</h2>
                        <Button onClick={() => setMicroTopics(null)} variant="secondary">Change Subject</Button>
                    </div>
                    {error && <p className="text-orange-500 bg-orange-100 p-3 rounded-md mb-4">{error}</p>}
                    <div className="md:grid md:grid-cols-3 md:gap-8">
                        {/* Micro-topics list */}
                        <div className="md:col-span-1 mb-6 md:mb-0">
                            <h3 className="text-lg font-semibold mb-3">Micro-Topics</h3>
                            <ul className="space-y-2 max-h-48 md:max-h-[60vh] overflow-y-auto pr-2">
                                {microTopics.map(topic => (
                                    <li key={topic}>
                                        <button
                                            onClick={() => handleSelectMicroTopic(topic)}
                                            className={`w-full text-left p-3 rounded-md transition-colors text-sm ${selectedMicroTopic === topic ? 'bg-indigo-600 text-white font-semibold' : 'bg-slate-100 hover:bg-indigo-100'}`}
                                        >
                                            {topic}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        {/* Tutorial Content */}
                        <div className="md:col-span-2">
                             <h3 className="text-lg font-semibold mb-3">Tutorial</h3>
                            <div className="p-4 border border-gray-200 rounded-lg bg-slate-50 min-h-[24rem] md:min-h-[60vh] max-h-[60vh] overflow-y-auto">
                               {isLoadingTutorial && (
                                   <div className="flex flex-col justify-center items-center h-full">
                                        <LoadingSpinner />
                                        <p className="mt-4 text-gray-600">Loading tutorial for {selectedMicroTopic}...</p>
                                   </div>
                               )}
                               {!isLoadingTutorial && tutorialContent && (
                                   <>
                                        {tutorialContent.imageUrl && (
                                            <img
                                                src={tutorialContent.imageUrl}
                                                alt={`Visual representation of ${selectedMicroTopic}`}
                                                className="w-full h-auto rounded-lg mb-4 object-cover max-h-72"
                                            />
                                        )}
                                        <div className="prose max-w-none">
                                            {formatNotes(tutorialContent.notes)}
                                        </div>
                                        <div className="mt-6 text-center border-t pt-6">
                                            <Button onClick={() => onStartQuiz(selectedMicroTopic as string)} disabled={!isOnline}>
                                                {isOnline ? 'Test My Knowledge' : 'Offline'}
                                            </Button>
                                        </div>
                                        <div className="mt-6 border-t pt-4">
                                            {!isStoryLoading && (
                                                <div className="text-center">
                                                    <Button onClick={handleGenerateStory} variant="secondary" disabled={!isOnline || isStoryLoading}>
                                                        {stories.length === 0 ? 'Teach with a Story' : 'Teach with Another Story'}
                                                    </Button>
                                                </div>
                                            )}
                                            {isStoryLoading && (
                                                <div className="text-center">
                                                    <LoadingSpinner />
                                                    <p className="mt-2 text-gray-500">Crafting a memorable story...</p>
                                                </div>
                                            )}
                                            {stories.length > 0 && (
                                                <div className="mt-4">
                                                    <h3 className="text-xl font-bold mt-2 mb-3 text-center">Stories to Remember</h3>
                                                    {stories.map((story, index) => (
                                                        <div key={index} className={`prose max-w-none text-left p-4 rounded-md bg-white mt-4 ${index > 0 ? 'border-t' : ''}`}>
                                                            {formatNotes(story)}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                   </>
                               )}
                               {!isLoadingTutorial && !tutorialContent && !error && (
                                   <div className="flex justify-center items-center h-full">
                                        <p className="text-gray-500">Select a micro-topic from the left to view the tutorial.</p>
                                   </div>
                               )}
                               {!isLoadingTutorial && !tutorialContent && error && !error.startsWith("You are offline") && (
                                   <div className="flex justify-center items-center h-full">
                                        <p className="text-red-500 p-4 bg-red-50 rounded-md">{error}</p>
                                   </div>
                               )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </Card>
    );
};

export default TopicExplorer;