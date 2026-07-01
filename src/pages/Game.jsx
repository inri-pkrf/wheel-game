import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Maximize2, Minimize2, Home, Hand, ArrowRight, Flame } from 'lucide-react';
import { categories } from '@/data/questions';
import Wheel from '@/components/game/Wheel';
import TelemetryBar from '@/components/game/TelemetryBar';
import QuestionPopup from '@/components/game/QuestionPopup';
import FeedbackCard from '@/components/game/FeedbackCard';
import SummaryScreen from '@/components/game/SummaryScreen';
import IdleWarning from '@/components/game/IdleWarning';
import ScoreBurst from '@/components/game/ScoreBurst';
import DifficultySelect from '@/components/game/DifficultySelect';
import { playCorrect, playWrong, playTimerWarning } from '@/utils/wheelSounds';
import IntroScreen from '@/components/game/IntroScreen';

const DIFFICULTY_ROUNDS = { easy: 5, medium: 8, hard: 11 };
const IDLE_TIMEOUT = 10 * 60 * 1000;
const WARNING_DURATION = 30;

export default function Game() {
  const [gameState, setGameState] = useState('idle');
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(0);
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [askedQuestionIds, setAskedQuestionIds] = useState(new Set());
  const [usedCategoryIndices, setUsedCategoryIndices] = useState(new Set());
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isCorrect, setIsCorrect] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [highlightIndex, setHighlightIndex] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [scoreBurstTrigger, setScoreBurstTrigger] = useState(0);
  const [scoreBurstPoints, setScoreBurstPoints] = useState(10);
  const [streak, setStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [difficulty, setDifficulty] = useState(null);
  const [showIntro, setShowIntro] = useState(true);
  const [roundHistory, setRoundHistory] = useState([]);

  // Idle timer
  const lastInteractionRef = useRef(Date.now());
  const showIdleWarningRef = useRef(false);
  const [showIdleWarning, setShowIdleWarning] = useState(false);
  const [idleCountdown, setIdleCountdown] = useState(WARNING_DURATION);

  const resetIdleTimer = useCallback(() => {
    lastInteractionRef.current = Date.now();
    if (showIdleWarningRef.current) {
      showIdleWarningRef.current = false;
      setShowIdleWarning(false);
    }
  }, []);

  // Interaction listeners + idle check
  useEffect(() => {
    window.addEventListener('touchstart', resetIdleTimer, { passive: true });
    window.addEventListener('click', resetIdleTimer);

    const interval = setInterval(() => {
      const elapsed = Date.now() - lastInteractionRef.current;
      if (elapsed >= IDLE_TIMEOUT && !showIdleWarningRef.current) {
        showIdleWarningRef.current = true;
        setShowIdleWarning(true);
        setIdleCountdown(WARNING_DURATION);
      }
    }, 1000);

    return () => {
      window.removeEventListener('touchstart', resetIdleTimer);
      window.removeEventListener('click', resetIdleTimer);
      clearInterval(interval);
    };
  }, [resetIdleTimer]);

  // Countdown when warning shown
  useEffect(() => {
    if (!showIdleWarning) return;
    const timer = setInterval(() => {
      setIdleCountdown((prev) => {
        if (prev <= 1) {
          resetGame();
          showIdleWarningRef.current = false;
          setShowIdleWarning(false);
          lastInteractionRef.current = Date.now();
          return WARNING_DURATION;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [showIdleWarning]);

  // Fullscreen state tracking
  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.().catch(() => {});
    } else {
      document.exitFullscreen?.().catch(() => {});
    }
  };

  const TOTAL_ROUNDS = difficulty ? DIFFICULTY_ROUNDS[difficulty] : 5;
  const currentCategory = currentCategoryIndex !== null ? categories[currentCategoryIndex] : null;
  const isNormalQuestion = currentCategory?.type === 'normal';
  const currentQuestionTime = isNormalQuestion ? 0 : 30;
  const hasTimer = !isNormalQuestion;

  // Question timer — reset when a new question appears
  useEffect(() => {
    if (gameState === 'question' && hasTimer) {
      setTimeLeft(currentQuestionTime);
    }
  }, [gameState, currentQuestion]);

  // Countdown — timestamp-based for accuracy
  useEffect(() => {
    if (gameState !== 'question' || !hasTimer) return;
    const startTime = Date.now();
    const totalSeconds = currentQuestionTime;
    const interval = setInterval(() => {
      const elapsed = (Date.now() - startTime) / 1000;
      const remaining = Math.max(0, Math.ceil(totalSeconds - elapsed));
      setTimeLeft(remaining);
      if (remaining <= 0) clearInterval(interval);
    }, 200);
    return () => clearInterval(interval);
  }, [gameState, hasTimer, currentQuestionTime]);

  // Timer warning sound — last 5 seconds
  useEffect(() => {
    if (gameState === 'question' && hasTimer && timeLeft <= 5 && timeLeft > 0) {
      playTimerWarning();
    }
  }, [timeLeft, gameState, hasTimer]);

  // Auto-submit on timeout
  const handleSubmitRef = useRef(null);
  useEffect(() => {
    if (gameState === 'question' && timeLeft === 0 && hasTimer && currentQuestion) {
      handleSubmitRef.current(true);
    }
  }, [timeLeft, gameState, hasTimer, currentQuestion]);

  const handleIntroStart = () => {
    setShowIntro(false);
    lastInteractionRef.current = Date.now();
  };

  const handleIntroBack = () => {
    setShowIntro(false);
    lastInteractionRef.current = Date.now();
  };

  const handleDifficultyBack = () => {
    setShowIntro(true);
    lastInteractionRef.current = Date.now();
  };

  const handleSelectDifficulty = (level) => {
    setDifficulty(level);
    setGameState('idle');
    lastInteractionRef.current = Date.now();
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.().catch(() => {});
    }
  };

  const handleSpinStart = () => {
    setGameState('spinning');
  };

  const handleSpinComplete = (categoryIndex) => {
    setCurrentCategoryIndex(categoryIndex);
    setHighlightIndex(categoryIndex);
    setGameState('revealing');
    const category = categories[categoryIndex];
    const available = category.questions.filter((q) => !askedQuestionIds.has(q.id));
    let question;
    if (available.length > 0) {
      question = available[Math.floor(Math.random() * available.length)];
    } else {
      question = category.questions[Math.floor(Math.random() * category.questions.length)];
    }
    // Shuffle answers so the correct one isn't always first
    const shuffledAnswers = [...question.answers];
    const correctAnswer = shuffledAnswers[question.correct];
    for (let j = shuffledAnswers.length - 1; j > 0; j--) {
      const k = Math.floor(Math.random() * (j + 1));
      [shuffledAnswers[j], shuffledAnswers[k]] = [shuffledAnswers[k], shuffledAnswers[j]];
    }
    const shuffledQuestion = { ...question, answers: shuffledAnswers, correct: shuffledAnswers.indexOf(correctAnswer) };
    const questionTime = category.type === 'normal' ? 0 : 30;
    setTimeout(() => {
      setCurrentQuestion(shuffledQuestion);
      setTimeLeft(questionTime);
      setGameState('question');
    }, 800);
  };

  const handleSubmitAnswer = (isTimeout = false) => {
    if (!isTimeout && selectedAnswer === null) return;
    const correct = selectedAnswer !== null && selectedAnswer === currentQuestion.correct;
    setIsCorrect(correct);
    const cat = currentCategory;
    const isBonus = cat?.type === 'bonus';
    const isTrick = cat?.type === 'trick';

    if (correct) {
      const basePoints = isBonus ? 20 : 10;
      const speedBonus = (isTimeout || !hasTimer) ? 0 : Math.ceil(timeLeft / 5);
      const streakBonus = streak >= 1 ? streak * 2 : 0;
      const totalPoints = basePoints + speedBonus + streakBonus;
      setScore((s) => s + totalPoints);
      setCorrectCount((c) => c + 1);
      setScoreBurstPoints(totalPoints);
      setScoreBurstTrigger((s) => s + 1);
      setStreak((s) => s + 1);
      playCorrect();
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#FF6B00', '#FF8C42', '#F0F4FF', '#0A2463'],
      });
    } else {
      const penalty = isTrick ? 20 : 0;
      if (penalty > 0) {
        setScore((s) => Math.max(0, s - penalty));
        setScoreBurstPoints(-penalty);
        setScoreBurstTrigger((s) => s + 1);
      }
      setStreak(0);
      playWrong();
    }
    setRoundHistory((prev) => [...prev, {
      name: currentCategory.name,
      icon: currentCategory.icon,
      color: currentCategory.color,
      isCorrect: correct,
      type: currentCategory.type,
      question: currentQuestion.question,
      correctAnswer: currentQuestion.answers[currentQuestion.correct],
      selectedAnswerText: selectedAnswer !== null ? currentQuestion.answers[selectedAnswer] : null,
      showInSummary: !correct,
    }]);
    setGameState('feedback');
  };

  handleSubmitRef.current = handleSubmitAnswer;

  const handleNextRound = () => {
    setAskedQuestionIds((prev) => new Set([...prev, currentQuestion.id]));
    setUsedCategoryIndices((prev) => {
      const next = new Set(prev);
      if (currentCategoryIndex !== null) next.add(currentCategoryIndex);
      return next;
    });
    setSelectedAnswer(null);
    setHighlightIndex(null);
    const newRound = round + 1;
    setRound(newRound);
    if (newRound >= TOTAL_ROUNDS) {
      setGameState('summary');
    } else {
      setGameState('idle');
    }
  };

  const resetGame = useCallback(() => {
    setGameState('idle');
    setScore(0);
    setRound(0);
    setCorrectCount(0);
    setAskedQuestionIds(new Set());
    setUsedCategoryIndices(new Set());
    setSelectedAnswer(null);
    setCurrentQuestion(null);
    setCurrentCategoryIndex(null);
    setHighlightIndex(null);
    setIsCorrect(false);
    setStreak(0);
    setTimeLeft(30);
    setRoundHistory([]);
    setDifficulty(null);
  }, []);

  const handlePlayAgain = () => {
    resetGame();
    lastInteractionRef.current = Date.now();
  };

  const handleBackToDifficulty = () => {
    resetGame();
  };

  return (
    <div className="fixed inset-0 overflow-hidden bg-[#0D1B3E] text-white" dir="rtl">
      {/* Background layers */}
      <div className="absolute inset-0 grid-bg opacity-40" />
      <div
        className="absolute inset-0 transition-all duration-1000"
        style={{ background: `radial-gradient(circle at 50% 50%, ${currentCategory?.color || '#FF6B00'} 0%, transparent 50%)`, opacity: 0.08 }}
      />
      <div
        className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full opacity-20 blur-3xl pointer-events-none transition-all duration-1000"
        style={{ background: `radial-gradient(circle, ${currentCategory?.color || '#FF6B00'}, transparent 70%)` }}
      />
      <div
        className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full opacity-15 blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, #0A2463, transparent 70%)' }}
      />

      {/* Telemetry bar */}
      <TelemetryBar score={score} round={round} totalRounds={TOTAL_ROUNDS} streak={streak} hideScore={!difficulty} />

      {/* Score burst animation */}
      <ScoreBurst trigger={scoreBurstTrigger} points={scoreBurstPoints} />

      {/* Intro screen */}
      <AnimatePresence>
        {showIntro && (
          <IntroScreen
            onStart={handleIntroStart}
            onBack={handleIntroBack}
            onToggleFullscreen={toggleFullscreen}
            isFullscreen={isFullscreen}
          />
        )}
      </AnimatePresence>

      {/* Difficulty selection */}
      <AnimatePresence>
        {!showIntro && !difficulty && (
          <DifficultySelect
            onSelect={handleSelectDifficulty}
            onBack={handleDifficultyBack}
            onToggleFullscreen={toggleFullscreen}
            isFullscreen={isFullscreen}
          />
        )}
      </AnimatePresence>

      {/* Main content - wheel always visible */}
      {difficulty && (
        <div className="absolute inset-0 flex flex-col items-center justify-center pt-10 pb-10 px-2">
          <div className="w-full max-w-[1000px]">
            <Wheel
              categories={categories}
              onSpinComplete={handleSpinComplete}
              onSpinStart={handleSpinStart}
              isIdle={gameState === 'idle'}
              highlightIndex={highlightIndex}
              usedCategoryIndices={[...usedCategoryIndices]}
            />
          </div>

          {/* Idle: swipe hint */}
          <AnimatePresence>
            {gameState === 'idle' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="mt-4 flex flex-col items-center gap-4"
              >
                <div className="flex items-center gap-3 text-[#FF8C42] text-2xl font-bold">
                  <span>סובבו את הגלגל</span>
                  <Hand className="w-8 h-8" />
                </div>
                {streak >= 2 && (
                  <div className="flex items-center gap-2 text-[#FF8C42] text-xl font-bold">
                    <Flame className="w-6 h-6" />
                    <span>רצף של {streak} תשובות נכונות!</span>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Spinning indicator */}
          {gameState === 'spinning' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-4 text-2xl text-[#FF8C42] font-bold"
            >
              <motion.span
                animate={{ opacity: [1, 0.4, 1] }}
                transition={{ repeat: Infinity, duration: 1 }}
              >
                מסובב את הגלגל...
              </motion.span>
            </motion.div>
          )}

          {/* Revealing: category name */}
          {gameState === 'revealing' && currentCategory && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-4 flex items-center gap-3 flex-wrap justify-center"
            >
              {currentCategory.type === 'normal' && (
                <span className="flex items-center gap-2 text-3xl font-bold text-[#FF8C42] text-glow-orange">
                  <span>מי אני</span>
                  <span>{currentCategory.icon}</span>
                </span>
              )}
              {currentCategory.type === 'bonus' && (
                <span className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FFD700]/30 border border-[#FFD700]/50 text-[#FFD700] font-bold text-xl">
                  בונוס
                  <span>⭐</span>
                </span>
              )}
              {currentCategory.type === 'trick' && (
                <span className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-500/30 border border-red-500/50 text-red-400 font-bold text-xl">
                  מכשילה
                  <span>⚠️</span>
                </span>
              )}
            </motion.div>
          )}

          {/* Category type label — shown below wheel while question/feedback is active */}
          {(gameState === 'question' || gameState === 'feedback') && currentCategory && currentCategory.type !== 'normal' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-4 flex items-center gap-2 flex-wrap justify-center"
            >
              {currentCategory.type === 'bonus' && (
                <span className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FFD700]/30 border border-[#FFD700]/50 text-[#FFD700] font-bold text-xl">
                  בונוס
                  <span role="img" aria-label="בונוס">⭐</span>
                </span>
              )}
              {currentCategory.type === 'trick' && (
                <span className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-500/30 border border-red-500/50 text-red-400 font-bold text-xl">
                  מכשילה
                  <span role="img" aria-label="מכשילה">⚠️</span>
                </span>
              )}
            </motion.div>
          )}
        </div>
      )}

      {/* Question popup */}
      <QuestionPopup
        show={gameState === 'question'}
        category={currentCategory}
        question={currentQuestion}
        selectedAnswer={selectedAnswer}
        onSelectAnswer={setSelectedAnswer}
        onSubmit={handleSubmitAnswer}
        timeLeft={timeLeft}
        questionTime={currentQuestionTime}
        showTimer={hasTimer}
      />

      {/* Feedback card */}
      <FeedbackCard
        show={gameState === 'feedback'}
        isCorrect={isCorrect}
        question={currentQuestion}
        selectedAnswer={selectedAnswer}
        onNext={handleNextRound}
        round={round}
        totalRounds={TOTAL_ROUNDS}
        categoryType={currentCategory?.type}
      />

      {/* Summary screen */}
      <SummaryScreen
        show={gameState === 'summary'}
        score={score}
        correctCount={correctCount}
        totalRounds={TOTAL_ROUNDS}
        onPlayAgain={handlePlayAgain}
        roundHistory={roundHistory}
      />

      {/* Idle warning */}
      <IdleWarning
        show={showIdleWarning}
        countdown={idleCountdown}
        onDismiss={resetIdleTimer}
      />

      {/* Bottom-left buttons — always visible */}
      <div className="fixed bottom-4 left-4 z-30 flex items-center gap-2">
        <button
          onClick={handleBackToDifficulty}
          className="glass-card rounded-2xl flex items-center justify-center text-[#D1D9F0] hover:text-[#FF8C42] transition-colors"
          style={{ width: 'clamp(55px, 8vw, 85px)', height: 'clamp(55px, 8vw, 85px)' }}
          aria-label="חזרה לבחירת רמה"
        >
          <ArrowRight className="w-7 h-7" />
        </button>
        <button
          onClick={toggleFullscreen}
          className="glass-card rounded-2xl flex items-center justify-center text-[#D1D9F0] hover:text-[#FF8C42] transition-colors"
          style={{ width: 'clamp(55px, 8vw, 85px)', height: 'clamp(55px, 8vw, 85px)' }}
          aria-label="מסך מלא"
        >
          {isFullscreen ? <Minimize2 className="w-7 h-7" /> : <Maximize2 className="w-7 h-7" />}
        </button>
      </div>

      {/* Home button — bottom-right */}
      <a
        href="https://totem-smart-flow.base44.app/"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-4 right-4 z-30 flex items-center justify-center rounded-full text-white hover:brightness-110 transition-all"
        style={{ width: 'clamp(55px, 8vw, 85px)', height: 'clamp(55px, 8vw, 85px)', backgroundColor: 'rgba(247, 179, 124, 0.9)' }}
        aria-label="חזרה לדף הבית"
      >
        <Home className="w-7 h-7" />
      </a>
    </div>
  );
}