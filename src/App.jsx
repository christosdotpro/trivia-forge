import React, { useState, useEffect, useRef } from 'react';
import { 
  Trophy, 
  Settings, 
  Play, 
  RefreshCw, 
  CheckCircle2, 
  XCircle, 
  BrainCircuit, 
  ChevronRight,
  GraduationCap,
  Clock,
  Layers,
  ChevronLeft,
  Search
} from 'lucide-react';

// --- Configuration & API Utilities ---

const API_KEY = import.meta.env.VITE_API_KEY || ""; // Provided by environment
const API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent";

const MODELS = [
  { id: 'gemini-3-flash', name: 'Gemini 3 Flash (Fast & Smart)', icon: '⚡' },
  { id: 'gemini-3-pro', name: 'Gemini 3 Pro (High Reasoning)', icon: '🧠' },
  { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro (Steady)', icon: '💎' },
];

const PRESET_TOPICS = [
  "General Knowledge",
  "Science & Nature",
  "History & Politics",
  "World Geography",
  "Movies & Cinema",
  "Music & Pop Culture",
  "Sports & Athletics",
  "Technology & AI",
  "Literature & Books",
  "Food & Drink",
  "Video Games",
  "Other"
];

const COMPLEXITY_LEVELS = [
  { id: 'elementary', label: 'Elementary School', description: 'Simple facts and easy language' },
  { id: 'high-school', label: 'High School', description: 'General knowledge with some depth' },
  { id: 'university', label: 'University / Undergraduate', description: 'Specialized academic knowledge' },
  { id: 'expert', label: 'PhD / Subject Expert', description: 'Highly technical or obscure facts' },
];

// Exponential Backoff Helper
const fetchWithRetry = async (url, options, retries = 5, backoff = 1000) => {
  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      if (response.status === 429 && retries > 0) {
        await new Promise(resolve => setTimeout(resolve, backoff));
        return fetchWithRetry(url, options, retries - 1, backoff * 2);
      }
      throw new Error(`API Error: ${response.statusText}`);
    }
    return await response.json();
  } catch (err) {
    if (retries > 0) {
      await new Promise(resolve => setTimeout(resolve, backoff));
      return fetchWithRetry(url, options, retries - 1, backoff * 2);
    }
    throw err;
  }
};

const App = () => {
  // Game State
  const [gameState, setGameState] = useState('setup'); // setup, loading, playing, results
  const [config, setConfig] = useState({
    selectedTopic: 'General Knowledge',
    customTopic: '',
    count: 5,
    complexity: 'high-school',
    format: 'multiple-choice',
    model: 'gemini-3-flash'
  });

  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState([]);
  const [score, setScore] = useState(0);
  const [error, setError] = useState(null);
  const [textInput, setTextInput] = useState('');

  // Get the effective topic string
  const getEffectiveTopic = () => {
    return config.selectedTopic === 'Other' ? config.customTopic : config.selectedTopic;
  };

  // --- Core Logic ---

  const generateTrivia = async () => {
    const finalTopic = getEffectiveTopic();
    if (config.selectedTopic === 'Other' && !config.customTopic.trim()) {
      setError("Please specify your custom topic.");
      return;
    }

    setGameState('loading');
    setError(null);

    const systemPrompt = `You are the ${config.model} AI agent. 
    Your task is to generate exactly ${config.count} trivia questions.
    Topic: ${finalTopic}
    Complexity: ${config.complexity} (Target audience: ${COMPLEXITY_LEVELS.find(l => l.id === config.complexity).label})
    Format: ${config.format === 'multiple-choice' ? 'Multiple Choice (4 options)' : 'Short Text Entry'}

    Output must be a JSON array of objects.
    Each object must have:
    - "question": string
    - "answer": string (the correct answer)
    ${config.format === 'multiple-choice' ? '- "options": array of 4 strings (including the correct answer)' : ''}
    - "explanation": a brief 1-sentence explanation of why it's correct.

    Respond ONLY with the JSON code block. No conversation.`;

    const userQuery = `Generate the ${finalTopic} trivia now.`;

    try {
      const result = await fetchWithRetry(`${API_URL}?key=${API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: userQuery }] }],
          systemInstruction: { parts: [{ text: systemPrompt }] },
          generationConfig: {
            responseMimeType: "application/json"
          }
        })
      });

      const rawText = result.candidates?.[0]?.content?.parts?.[0]?.text;
      const parsedData = JSON.parse(rawText);
      
      setQuestions(parsedData);
      setGameState('playing');
      setCurrentIndex(0);
      setUserAnswers([]);
      setScore(0);
    } catch (err) {
      setError("Failed to forge the trivia. Please check your connection or try a different topic.");
      setGameState('setup');
    }
  };

  const handleAnswer = (answer) => {
    const isCorrect = answer.trim().toLowerCase() === questions[currentIndex].answer.toLowerCase();
    
    if (isCorrect) setScore(prev => prev + 1);
    
    setUserAnswers([...userAnswers, { 
      userAnswer: answer, 
      correct: isCorrect,
      correctAnswer: questions[currentIndex].answer 
    }]);

    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(currentIndex + 1);
      setTextInput('');
    } else {
      setGameState('results');
    }
  };

  // --- Component Views ---

  const SetupScreen = () => (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center p-3 bg-indigo-500/10 rounded-2xl mb-4">
          <BrainCircuit className="w-10 h-10 text-indigo-400" />
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight text-white">Trivia Forge</h1>
        <p className="text-slate-400 text-lg">Harness AI agents to create custom trivia experiences.</p>
      </div>

      <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6">
        {/* Topic Selection */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-400 flex items-center gap-2">
                <Layers className="w-4 h-4" /> Trivia Topic
              </label>
              <select 
                value={config.selectedTopic}
                onChange={(e) => setConfig({...config, selectedTopic: e.target.value})}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all appearance-none"
              >
                {PRESET_TOPICS.map(topic => (
                  <option key={topic} value={topic}>{topic}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-400 flex items-center gap-2">
                <Clock className="w-4 h-4" /> Question Count
              </label>
              <select 
                value={config.count}
                onChange={(e) => setConfig({...config, count: parseInt(e.target.value)})}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              >
                {[3, 5, 10, 15, 20].map(n => <option key={n} value={n}>{n} Questions</option>)}
              </select>
            </div>
          </div>

          {/* Conditional Custom Topic Input */}
          {config.selectedTopic === 'Other' && (
            <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
              <label className="text-sm font-medium text-slate-400 flex items-center gap-2">
                <Search className="w-4 h-4" /> Specify Custom Topic
              </label>
              <input 
                type="text" 
                value={config.customTopic}
                onChange={(e) => setConfig({...config, customTopic: e.target.value})}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                placeholder="e.g. 1980s Retro Gaming, European History..."
                autoFocus
              />
            </div>
          )}
        </div>

        {/* Agent Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-400 flex items-center gap-2">
            <BrainCircuit className="w-4 h-4" /> Intelligence Agent
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {MODELS.map(m => (
              <button
                key={m.id}
                onClick={() => setConfig({...config, model: m.id})}
                className={`p-4 rounded-xl border text-left transition-all ${
                  config.model === m.id 
                    ? 'bg-indigo-500/20 border-indigo-500 text-white shadow-[0_0_15px_rgba(99,102,241,0.3)]' 
                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'
                }`}
              >
                <div className="text-xl mb-1">{m.icon}</div>
                <div className="text-xs font-bold uppercase tracking-wider">{m.name.split(' ')[0]}</div>
                <div className="text-[10px] opacity-60">Optimized for trivia</div>
              </button>
            ))}
          </div>
        </div>

        {/* Complexity */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-400 flex items-center gap-2">
            <GraduationCap className="w-4 h-4" /> Difficulty & Depth
          </label>
          <div className="space-y-2">
            {COMPLEXITY_LEVELS.map(level => (
              <button
                key={level.id}
                onClick={() => setConfig({...config, complexity: level.id})}
                className={`w-full p-3 rounded-xl border flex items-center gap-4 text-left transition-all ${
                  config.complexity === level.id 
                    ? 'bg-indigo-500/10 border-indigo-500/50 text-white' 
                    : 'bg-slate-800/30 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${config.complexity === level.id ? 'border-indigo-400 bg-indigo-400' : 'border-slate-600'}`}>
                  {config.complexity === level.id && <div className="w-2 h-2 bg-white rounded-full" />}
                </div>
                <div>
                  <div className="text-sm font-semibold">{level.label}</div>
                  <div className="text-xs opacity-60">{level.description}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Format */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-400 flex items-center gap-2">
            <Settings className="w-4 h-4" /> Answer Format
          </label>
          <div className="flex bg-slate-800 p-1 rounded-xl border border-slate-700">
            <button 
              onClick={() => setConfig({...config, format: 'multiple-choice'})}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${config.format === 'multiple-choice' ? 'bg-indigo-500 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
            >
              Multiple Choice
            </button>
            <button 
              onClick={() => setConfig({...config, format: 'text-entry'})}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${config.format === 'text-entry' ? 'bg-indigo-500 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
            >
              Text Entry
            </button>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-400 text-sm">
            <XCircle className="w-5 h-5 flex-shrink-0" />
            {error}
          </div>
        )}

        <button 
          onClick={generateTrivia}
          className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 shadow-xl shadow-indigo-500/20 transition-all active:scale-[0.98]"
        >
          <Play className="w-5 h-5 fill-current" />
          Start Forge
        </button>
      </div>
    </div>
  );

  const LoadingScreen = () => (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8 animate-pulse">
      <div className="relative">
        <div className="w-24 h-24 border-4 border-indigo-500/20 rounded-full" />
        <div className="absolute top-0 w-24 h-24 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <BrainCircuit className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 text-indigo-400" />
      </div>
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-white">Agent {config.model} is forging...</h2>
        <p className="text-slate-400">Researching {getEffectiveTopic()} for {config.complexity} level questions.</p>
      </div>
    </div>
  );

  const QuestionScreen = () => {
    const q = questions[currentIndex];
    const progress = ((currentIndex + 1) / questions.length) * 100;

    const handleStartOver = () => {
      if (window.confirm('Are you sure you want to start over? Your progress will be lost.')) {
        setGameState('setup');
        setCurrentIndex(0);
        setUserAnswers([]);
        setScore(0);
        setTextInput('');
      }
    };

    return (
      <div className="max-w-3xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500">
        <div className="flex items-center justify-between mb-2">
          <div className="text-slate-400 text-sm font-bold uppercase tracking-widest">Question {currentIndex + 1} of {questions.length}</div>
          <div className="flex items-center gap-3">
            <div className="text-indigo-400 text-sm font-bold bg-indigo-500/10 px-3 py-1 rounded-full uppercase tracking-widest">{getEffectiveTopic()}</div>
            <button
              onClick={handleStartOver}
              className="text-slate-500 hover:text-slate-300 transition-colors p-1.5 rounded-lg hover:bg-slate-800/50"
              title="Start over"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
          <div 
            className="h-full bg-indigo-500 transition-all duration-500" 
            style={{ width: `${progress}%` }} 
          />
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 md:p-12 shadow-2xl">
          <h2 className="text-2xl md:text-3xl font-bold text-white leading-tight mb-12">
            {q.question}
          </h2>

          {config.format === 'multiple-choice' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {q.options.map((option, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAnswer(option)}
                  className="group relative p-6 bg-slate-800/50 hover:bg-indigo-500 border border-slate-700 hover:border-indigo-400 rounded-2xl text-left transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <span className="text-slate-500 group-hover:text-indigo-200 font-bold mr-3">{String.fromCharCode(65 + idx)}.</span>
                  <span className="text-white font-medium">{option}</span>
                </button>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              <input 
                autoFocus
                type="text"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && textInput && handleAnswer(textInput)}
                placeholder="Type your answer here..."
                className="w-full bg-slate-800 border-2 border-slate-700 focus:border-indigo-500 rounded-2xl p-6 text-xl text-white outline-none transition-all"
              />
              <button
                disabled={!textInput}
                onClick={() => handleAnswer(textInput)}
                className="w-full bg-indigo-600 disabled:opacity-50 hover:bg-indigo-500 py-4 rounded-xl text-white font-bold transition-all"
              >
                Submit Answer
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  const ResultsScreen = () => {
    const percentage = Math.round((score / questions.length) * 100);
    
    return (
      <div className="max-w-4xl mx-auto space-y-8 animate-in zoom-in-95 duration-500">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-10 text-center shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500" />
          
          <div className="relative z-10 space-y-4">
            <Trophy className="w-20 h-20 text-yellow-400 mx-auto animate-bounce" />
            <h2 className="text-4xl font-extrabold text-white">Forge Complete!</h2>
            <div className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400 py-4">
              {score} / {questions.length}
            </div>
            <p className="text-slate-400 text-lg">
              You mastered <span className="text-white font-bold">{percentage}%</span> of the {getEffectiveTopic()} challenge.
            </p>
            
            <div className="flex flex-wrap justify-center gap-4 pt-8">
              <button 
                onClick={() => setGameState('setup')}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-8 py-3 rounded-xl flex items-center gap-2 transition-all shadow-lg"
              >
                <RefreshCw className="w-5 h-5" /> Play Again
              </button>
              <button 
                onClick={() => {
                  generateTrivia();
                }}
                className="bg-slate-800 hover:bg-slate-700 text-white font-bold px-8 py-3 rounded-xl flex items-center gap-2 transition-all border border-slate-700"
              >
                <Play className="w-5 h-5" /> New Setup
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <CheckCircle2 className="w-6 h-6 text-indigo-400" /> Detailed Review
          </h3>
          <div className="grid gap-4">
            {questions.map((q, idx) => (
              <div key={idx} className="bg-slate-900/40 border border-slate-800/60 rounded-2xl p-6 transition-all hover:bg-slate-900/60">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <h4 className="font-bold text-white text-lg leading-snug">{q.question}</h4>
                  {userAnswers[idx].correct ? (
                    <div className="bg-green-500/20 text-green-400 p-1.5 rounded-full"><CheckCircle2 className="w-5 h-5" /></div>
                  ) : (
                    <div className="bg-red-500/20 text-red-400 p-1.5 rounded-full"><XCircle className="w-5 h-5" /></div>
                  )}
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex gap-2">
                    <span className="text-slate-500 font-medium">Your answer:</span>
                    <span className={userAnswers[idx].correct ? 'text-green-400' : 'text-red-400'}>
                      {userAnswers[idx].userAnswer}
                    </span>
                  </div>
                  {!userAnswers[idx].correct && (
                    <div className="flex gap-2">
                      <span className="text-slate-500 font-medium">Correct answer:</span>
                      <span className="text-green-400 font-bold">{userAnswers[idx].correctAnswer}</span>
                    </div>
                  )}
                  <p className="text-slate-400 italic bg-slate-800/50 p-3 rounded-lg border border-slate-700/50 mt-2">
                    {q.explanation}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 p-4 md:p-8 font-sans selection:bg-indigo-500/30">
      <div className="max-w-5xl mx-auto">
        {gameState === 'setup' && <SetupScreen />}
        {gameState === 'loading' && <LoadingScreen />}
        {gameState === 'playing' && <QuestionScreen />}
        {gameState === 'results' && <ResultsScreen />}
      </div>
    </div>
  );
};

export default App;