import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Clock, HelpCircle, CheckCircle, XCircle, ArrowRight, Award, Sparkles } from 'lucide-react';

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

export default function MCQQuiz({ onQuizComplete, puzzleSolveTime, puzzleMoves }) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const [timeLeft, setTimeLeft] = useState(SECONDS_PER_QUESTION);
  const [score, setScore] = useState(0);
  const [userAnswers, setUserAnswers] = useState([]);

  const currentQ = QUESTIONS[currentIdx];

  // 20-second Timer per question
  useEffect(() => {
    setTimeLeft(SECONDS_PER_QUESTION);
    setIsRevealed(false);
    setSelectedOption(null);

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // Auto reveal on timeout if user hasn't selected
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
    }
  };

  const handleSelectOption = (index) => {
    if (isRevealed) return; // Prevent multiple clicks after reveal
    setSelectedOption(index);
    setIsRevealed(true);
  };

  const handleNextQuestion = () => {
    const chosenIdx = selectedOption;
    const isCorrect = chosenIdx === currentQ.correctIndex;
    const addedScore = isCorrect ? 10 : 0;
    const newScore = score + addedScore;
    setScore(newScore);

    const updatedAnswers = [
      ...userAnswers,
      {
        questionId: currentQ.id,
        chosenIdx,
        isCorrect
      }
    ];
    setUserAnswers(updatedAnswers);

    setSelectedOption(null);
    setIsRevealed(false);

    if (currentIdx + 1 < QUESTIONS.length) {
      setCurrentIdx((prev) => prev + 1);
    } else {
      // Quiz complete!
      confetti({
        particleCount: 150,
        spread: 90,
        origin: { y: 0.5 }
      });
      if (onQuizComplete) {
        onQuizComplete({
          mcqScore: newScore, // Max 100 points
          mcqCorrectCount: updatedAnswers.filter((a) => a.isCorrect).length,
          totalQuestions: QUESTIONS.length,
          userAnswers: updatedAnswers
        });
      }
    }
  };

  return (
    <div className="glass-panel" style={{ width: '100%', maxWidth: '480px', padding: '24px 20px', margin: '0 auto' }}>
      {/* Header Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div className="brand-badge" style={{ margin: 0 }}>
          <HelpCircle size={14} /> QUESTION {currentIdx + 1} OF {QUESTIONS.length}
        </div>

        {/* 20 Second Countdown Clock */}
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

      {/* Question Text */}
      <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: 800, marginBottom: '20px', lineHeight: 1.3 }}>
        {currentQ.question}
      </h3>

      {/* Options List with Correct / Wrong Color Highlighting */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
        {currentQ.options.map((optionText, optIdx) => {
          const isSelected = selectedOption === optIdx;
          const isCorrect = optIdx === currentQ.correctIndex;

          let optionStyle = {
            background: 'rgba(15, 23, 42, 0.7)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            color: 'var(--text-main)'
          };

          if (isRevealed) {
            if (isCorrect) {
              // Highlight Correct Answer in Green
              optionStyle = {
                background: 'rgba(34, 197, 94, 0.25)',
                border: '2px solid #22c55e',
                color: '#4ade80',
                boxShadow: '0 0 15px rgba(34, 197, 94, 0.3)'
              };
            } else if (isSelected && !isCorrect) {
              // Highlight User's Wrong Selection in Red
              optionStyle = {
                background: 'rgba(239, 68, 68, 0.25)',
                border: '2px solid #ef4444',
                color: '#fca5a5',
                boxShadow: '0 0 15px rgba(239, 68, 68, 0.3)'
              };
            }
          } else if (isSelected) {
            optionStyle = {
              background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.4), rgba(6, 182, 212, 0.4))',
              border: '2px solid #38bdf8',
              color: '#ffffff'
            };
          }

          return (
            <button
              key={optIdx}
              onClick={() => handleSelectOption(optIdx)}
              disabled={isRevealed}
              style={{
                width: '100%',
                padding: '14px 18px',
                borderRadius: '12px',
                textAlign: 'left',
                fontFamily: 'var(--font-body)',
                fontSize: '0.95rem',
                fontWeight: 600,
                cursor: isRevealed ? 'default' : 'pointer',
                transition: 'all 0.25s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                ...optionStyle
              }}
            >
              <span>{String.fromCharCode(65 + optIdx)}. {optionText}</span>
              {isRevealed && isCorrect && (
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', fontWeight: 800 }}>
                  <CheckCircle size={18} color="#4ade80" /> +10 PTS
                </span>
              )}
              {isRevealed && isSelected && !isCorrect && (
                <XCircle size={18} color="#ef4444" />
              )}
            </button>
          );
        })}
      </div>

      {/* Feedback Alert Banner */}
      {isRevealed && (
        <div style={{
          padding: '12px 16px',
          borderRadius: '12px',
          marginBottom: '20px',
          fontSize: '0.9rem',
          fontWeight: 700,
          textAlign: 'center',
          background: selectedOption === currentQ.correctIndex 
            ? 'rgba(34, 197, 94, 0.2)' 
            : 'rgba(239, 68, 68, 0.2)',
          border: selectedOption === currentQ.correctIndex 
            ? '1px solid #22c55e' 
            : '1px solid #ef4444',
          color: selectedOption === currentQ.correctIndex 
            ? '#4ade80' 
            : '#fca5a5'
        }}>
          {selectedOption === currentQ.correctIndex
            ? '🎉 Correct Answer! (+10 Points)'
            : selectedOption !== null
              ? `❌ Wrong! Correct answer is: ${String.fromCharCode(65 + currentQ.correctIndex)}. ${currentQ.options[currentQ.correctIndex]}`
              : `⏰ Time's Up! Correct answer is: ${String.fromCharCode(65 + currentQ.correctIndex)}. ${currentQ.options[currentQ.correctIndex]}`
          }
        </div>
      )}

      {/* Action Submit / Next Button */}
      <button
        className="btn-primary"
        style={{ width: '100%' }}
        onClick={handleNextQuestion}
        disabled={!isRevealed}
      >
        <span>{currentIdx + 1 === QUESTIONS.length ? 'FINISH & SEE RANK 🏆' : 'NEXT QUESTION'}</span>
        <ArrowRight size={18} />
      </button>
    </div>
  );
}
