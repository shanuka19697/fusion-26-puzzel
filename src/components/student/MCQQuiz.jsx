import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Clock, HelpCircle, CheckCircle, XCircle, ArrowRight, Award, Sparkles, Volume2, VolumeX } from 'lucide-react';
import { sounds } from '../../utils/audio';

const QUESTIONS = [
  {
    id: 1,
    question: "What is the official title of today's Faculty of Technology Arts Club Fresher Welcome?",
    options: ["Fusion '26", "TechFest '26", "Artistry '26", "Spark '26"],
    correctIndex: 0
  },
  {
    id: 2,
    question: "Leonardo da Vinci's original 'Mona Lisa' painting is permanently displayed in which museum?",
    options: ["The Louvre, Paris", "The British Museum, London", "The Met, New York", "Uffizi Gallery, Florence"],
    correctIndex: 0
  },
  {
    id: 3,
    question: "Which two primary colors mixed together yield the color Green?",
    options: ["Blue and Yellow", "Red and Blue", "Yellow and Red", "Purple and Yellow"],
    correctIndex: 0
  },
  {
    id: 4,
    question: "What does the technological abbreviation 'AI' stand for?",
    options: ["Artificial Intelligence", "Automated Input", "Applied Integration", "Advanced Interface"],
    correctIndex: 0
  },
  {
    id: 5,
    question: "Who painted the famous artwork 'The Starry Night'?",
    options: ["Vincent van Gogh", "Pablo Picasso", "Michelangelo", "Claude Monet"],
    correctIndex: 0
  },
  {
    id: 6,
    question: "In computer programming, HTML stands for:",
    options: [
      "HyperText Markup Language",
      "High-Tech Media Language",
      "Hyperlink Transfer Mode Logic",
      "Home Tool Management Line"
    ],
    correctIndex: 0
  },
  {
    id: 7,
    question: "In music, an Octave consists of how many full musical notes?",
    options: ["8 Notes", "6 Notes", "10 Notes", "12 Notes"],
    correctIndex: 0
  },
  {
    id: 8,
    question: "Which art movement was co-founded by Pablo Picasso in the early 20th century?",
    options: ["Cubism", "Surrealism", "Impressionism", "Pop Art"],
    correctIndex: 0
  },
  {
    id: 9,
    question: "What is the capital city of Sri Lanka?",
    options: [
      "Sri Jayawardenepura Kotte",
      "Colombo",
      "Kandy",
      "Galle"
    ],
    correctIndex: 0
  },
  {
    id: 10,
    question: "Which Sri Lankan University hosts the Faculty of Technology for 'Fusion 26'?",
    options: [
      "University of Colombo",
      "University of Moratuwa",
      "University of Peradeniya",
      "University of Kelaniya"
    ],
    correctIndex: 0
  }
];

const SECONDS_PER_QUESTION = 20;

// Kahoot/Quizizz Option Styling Badges & Colors
const OPTION_STYLES = [
  { shape: '▲', label: 'A', bg: 'linear-gradient(135deg, #ef4444, #b91c1c)', border: '#fca5a5' }, // Red Triangle
  { shape: '◆', label: 'B', bg: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', border: '#93c5fd' }, // Blue Diamond
  { shape: '●', label: 'C', bg: 'linear-gradient(135deg, #f59e0b, #b45309)', border: '#fde68a' }, // Gold Circle
  { shape: '■', label: 'D', bg: 'linear-gradient(135deg, #10b981, #047857)', border: '#6ee7b7' }  // Green Square
];

export default function MCQQuiz({ onQuizComplete, puzzleSolveTime, puzzleMoves }) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const [timeLeft, setTimeLeft] = useState(SECONDS_PER_QUESTION);
  const [score, setScore] = useState(0);
  const [speedBonus, setSpeedBonus] = useState(0);
  const [userAnswers, setUserAnswers] = useState([]);
  const [isMuted, setIsMuted] = useState(false);

  const currentQ = QUESTIONS[currentIdx];

  // 20-second Timer per question with Kahoot audio ticks
  useEffect(() => {
    setTimeLeft(SECONDS_PER_QUESTION);
    setIsRevealed(false);
    setSelectedOption(null);
    setSpeedBonus(0);

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 5 && prev > 1 && !isMuted) {
          sounds.playTick(); // Play ticking sound in last 5 seconds
        }
        if (prev <= 1) {
          clearInterval(timer);
          handleTimeoutReveal();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentIdx]);

  const handleTimeoutReveal = () => {
    if (!isRevealed) {
      setIsRevealed(true);
      if (!isMuted) sounds.playWrong();
    }
  };

  const handleSelectOption = (index) => {
    if (isRevealed) return;
    if (!isMuted) sounds.playClick();

    setSelectedOption(index);
    setIsRevealed(true);

    const isCorrect = index === currentQ.correctIndex;
    if (isCorrect) {
      // Calculate speed bonus: up to +50 extra pts for fast answers!
      const bonus = Math.floor((timeLeft / SECONDS_PER_QUESTION) * 50);
      setSpeedBonus(bonus);
      if (!isMuted) sounds.playCorrect();
    } else {
      if (!isMuted) sounds.playWrong();
    }
  };

  const handleNextQuestion = () => {
    const chosenIdx = selectedOption;
    const isCorrect = chosenIdx === currentQ.correctIndex;
    
    // Kahoot Score Math: Base 100 pts + Speed Bonus
    const addedScore = isCorrect ? (100 + speedBonus) : 0;
    const newScore = score + addedScore;
    setScore(newScore);

    const updatedAnswers = [
      ...userAnswers,
      {
        questionId: currentQ.id,
        chosenIdx,
        isCorrect,
        pointsEarned: addedScore
      }
    ];
    setUserAnswers(updatedAnswers);

    setSelectedOption(null);
    setIsRevealed(false);

    if (currentIdx + 1 < QUESTIONS.length) {
      setCurrentIdx((prev) => prev + 1);
    } else {
      // Quiz complete!
      if (!isMuted) sounds.playVictory();
      confetti({
        particleCount: 180,
        spread: 100,
        origin: { y: 0.5 }
      });
      if (onQuizComplete) {
        onQuizComplete({
          mcqScore: newScore, // Max 1500 points
          mcqCorrectCount: updatedAnswers.filter((a) => a.isCorrect).length,
          totalQuestions: QUESTIONS.length,
          userAnswers: updatedAnswers
        });
      }
    }
  };

  const toggleMute = () => {
    sounds.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  return (
    <div className="glass-panel" style={{ width: '100%', maxWidth: '480px', padding: '24px 20px', margin: '0 auto' }}>
      {/* Header Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div className="brand-badge" style={{ margin: 0 }}>
          <HelpCircle size={14} /> QUESTION {currentIdx + 1} OF {QUESTIONS.length}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Mute/Unmute Audio Toggle */}
          <button
            onClick={toggleMute}
            style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}
          >
            {isMuted ? <VolumeX size={20} color="#ef4444" /> : <Volume2 size={20} color="#38bdf8" />}
          </button>

          {/* 20 Second Kahoot Countdown Clock */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontFamily: 'var(--font-heading)',
            fontWeight: 800,
            fontSize: '1.1rem',
            color: timeLeft <= 5 ? '#ef4444' : '#38bdf8',
            background: 'rgba(15, 23, 42, 0.8)',
            padding: '6px 14px',
            borderRadius: '20px',
            border: timeLeft <= 5 ? '1px solid #ef4444' : '1px solid rgba(6, 182, 212, 0.4)',
            boxShadow: timeLeft <= 5 ? '0 0 15px rgba(239, 68, 68, 0.4)' : 'none'
          }}>
            <Clock size={18} className={timeLeft <= 5 ? 'animate-pulse-glow' : ''} />
            <span>{timeLeft}s</span>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', marginBottom: '20px', overflow: 'hidden' }}>
        <div
          style={{
            height: '100%',
            width: `${((currentIdx + 1) / QUESTIONS.length) * 100}%`,
            background: 'linear-gradient(90deg, #8b5cf6, #06b6d4)',
            transition: 'width 0.3s ease'
          }}
        />
      </div>

      {/* Live Score Counter Pill */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '10px' }}>
        <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#fbbf24', background: 'rgba(251, 191, 36, 0.15)', padding: '4px 12px', borderRadius: '12px', border: '1px solid rgba(251, 191, 36, 0.4)' }}>
          ⚡ Score: {score} Pts
        </span>
      </div>

      {/* Question Text */}
      <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: 800, marginBottom: '20px', lineHeight: 1.3 }}>
        {currentQ.question}
      </h3>

      {/* Kahoot/Quizizz Style Vibrant Option Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
        {currentQ.options.map((optionText, optIdx) => {
          const isSelected = selectedOption === optIdx;
          const isCorrect = optIdx === currentQ.correctIndex;
          const styleConfig = OPTION_STYLES[optIdx];

          let customStyle = {
            background: styleConfig.bg,
            border: `2px solid ${styleConfig.border}`,
            color: '#ffffff',
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.3)'
          };

          if (isRevealed) {
            if (isCorrect) {
              customStyle = {
                background: 'linear-gradient(135deg, #22c55e, #15803d)',
                border: '3px solid #4ade80',
                color: '#ffffff',
                boxShadow: '0 0 25px rgba(34, 197, 94, 0.6)',
                transform: 'scale(1.02)'
              };
            } else if (isSelected && !isCorrect) {
              customStyle = {
                background: 'linear-gradient(135deg, #ef4444, #991b1b)',
                border: '3px solid #fca5a5',
                color: '#ffffff',
                opacity: 0.7
              };
            } else {
              customStyle.opacity = 0.4;
            }
          }

          return (
            <button
              key={optIdx}
              onClick={() => handleSelectOption(optIdx)}
              disabled={isRevealed}
              style={{
                width: '100%',
                padding: '16px 20px',
                borderRadius: '14px',
                textAlign: 'left',
                fontFamily: 'var(--font-body)',
                fontSize: '1rem',
                fontWeight: 700,
                cursor: isRevealed ? 'default' : 'pointer',
                transition: 'all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                ...customStyle
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '1.2rem', opacity: 0.9 }}>{styleConfig.shape}</span>
                <span>{optionText}</span>
              </div>

              {isRevealed && isCorrect && (
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem', fontWeight: 900 }}>
                  <CheckCircle size={20} color="#ffffff" /> +{100 + speedBonus} PTS
                </span>
              )}
              {isRevealed && isSelected && !isCorrect && (
                <XCircle size={20} color="#ffffff" />
              )}
            </button>
          );
        })}
      </div>

      {/* Feedback & Speed Bonus Alert Banner */}
      {isRevealed && (
        <div style={{
          padding: '12px 16px',
          borderRadius: '12px',
          marginBottom: '20px',
          fontSize: '0.9rem',
          fontWeight: 800,
          textAlign: 'center',
          background: selectedOption === currentQ.correctIndex 
            ? 'rgba(34, 197, 94, 0.25)' 
            : 'rgba(239, 68, 68, 0.25)',
          border: selectedOption === currentQ.correctIndex 
            ? '1.5px solid #22c55e' 
            : '1.5px solid #ef4444',
          color: selectedOption === currentQ.correctIndex 
            ? '#4ade80' 
            : '#fca5a5'
        }}>
          {selectedOption === currentQ.correctIndex
            ? `🎉 Correct! +100 PTS ${speedBonus > 0 ? `(+${speedBonus}⚡ Speed Bonus!)` : ''}`
            : selectedOption !== null
              ? `❌ Incorrect! Correct answer was: ${OPTION_STYLES[currentQ.correctIndex].label}. ${currentQ.options[currentQ.correctIndex]}`
              : `⏰ Time's Up! Correct answer was: ${OPTION_STYLES[currentQ.correctIndex].label}. ${currentQ.options[currentQ.correctIndex]}`
          }
        </div>
      )}

      {/* Action Submit / Next Button */}
      <button
        className="btn-primary"
        style={{ width: '100%', padding: '16px', fontSize: '1.05rem' }}
        onClick={handleNextQuestion}
        disabled={!isRevealed}
      >
        <span>{currentIdx + 1 === QUESTIONS.length ? 'SEE FINAL LEADERBOARD 🏆' : 'NEXT QUESTION'}</span>
        <ArrowRight size={20} />
      </button>
    </div>
  );
}
