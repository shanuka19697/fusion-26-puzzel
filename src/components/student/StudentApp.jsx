import React, { useState, useEffect } from 'react';
import { useSocket } from '../../context/SocketContext';
import RegisterForm from './RegisterForm';
import WaitingQueue from './WaitingQueue';
import PuzzleCanvas from './PuzzleCanvas';
import MCQQuiz from './MCQQuiz';
import StudentLeaderboard from './StudentLeaderboard';
import { Sparkles } from 'lucide-react';

export default function StudentApp() {
  const { socket, isConnected, gameState } = useSocket();
  const [student, setStudent] = useState(null);
  const [studentResult, setStudentResult] = useState(null);
  const [puzzleData, setPuzzleData] = useState(null); // Stores { moves, solveTime }
  const [stage, setStage] = useState('REGISTER'); // REGISTER -> QUEUED -> PUZZLE -> QUIZ -> COMPLETED
  const [isConnecting, setIsConnecting] = useState(false);

  const { status, config, studentsCount, students, gameStartTime } = gameState;

  // Handle registration response from socket
  useEffect(() => {
    if (!socket) return;

    const handleRegisterResponse = (data) => {
      setIsConnecting(false);
      if (data.success) {
        setStudent(data.student);
        if (data.student.status === 'COMPLETED') {
          setStage('COMPLETED');
        } else if (data.gameStatus === 'PLAYING') {
          setStage('PUZZLE');
        } else {
          setStage('QUEUED');
        }
      } else {
        alert(data.error || 'Registration failed');
      }
    };

    const handleSubmissionResponse = (data) => {
      if (data.success) {
        setStudentResult(data);
        setStage('COMPLETED');
      }
    };

    socket.on('register:response', handleRegisterResponse);
    socket.on('submit:response', handleSubmissionResponse);

    return () => {
      socket.off('register:response', handleRegisterResponse);
      socket.off('submit:response', handleSubmissionResponse);
    };
  }, [socket]);

  // Handle game start trigger from Admin
  useEffect(() => {
    if (status === 'PLAYING' && student && stage === 'QUEUED') {
      setStage('PUZZLE');
    }
  }, [status, student, stage]);

  const handleRegister = ({ name, indexNumber }) => {
    if (!socket) return alert('Connecting to server...');
    setIsConnecting(true);
    socket.emit('student:register', { name, indexNumber });
  };

  // Called when student finishes sliding puzzle
  const handlePuzzleComplete = ({ moves, solveTime }) => {
    setPuzzleData({ moves, solveTime });
    setStage('QUIZ'); // Transition to 10 MCQ Quiz!
  };

  // Called when student finishes MCQ Quiz
  const handleQuizComplete = ({ mcqScore, mcqCorrectCount }) => {
    if (socket && puzzleData) {
      socket.emit('student:submit_solution', {
        moves: puzzleData.moves,
        solveTime: puzzleData.solveTime,
        mcqScore,
        mcqCorrectCount
      });
    }
  };

  const renderScreen = () => {
    if (!student || stage === 'REGISTER') {
      return <RegisterForm onRegister={handleRegister} isConnecting={isConnecting} />;
    }

    if (stage === 'COMPLETED' || student.status === 'COMPLETED') {
      return <StudentLeaderboard studentResult={studentResult} leaderboard={students} />;
    }

    if (stage === 'QUIZ') {
      return (
        <MCQQuiz
          onQuizComplete={handleQuizComplete}
          puzzleSolveTime={puzzleData?.solveTime}
          puzzleMoves={puzzleData?.moves}
        />
      );
    }

    if (stage === 'PUZZLE' || status === 'PLAYING') {
      return (
        <PuzzleCanvas
          config={config}
          onComplete={handlePuzzleComplete}
          gameStartTime={gameStartTime}
        />
      );
    }

    return <WaitingQueue student={student} queueCount={studentsCount} />;
  };

  return (
    <div className="student-container">
      {/* Official Arts Club Logo Header */}
      <header className="brand-header">
        <img
          src="/assets/club_logo.png"
          alt="Faculty of Technology Arts Club - University of Colombo"
          style={{
            height: '64px',
            maxWidth: '280px',
            objectFit: 'contain',
            filter: 'drop-shadow(0 0 12px rgba(139, 92, 246, 0.6))',
            marginBottom: '10px'
          }}
        />
        <div className="brand-badge" style={{ marginTop: '4px' }}>
          <Sparkles size={14} /> FUSION '26 FRESHERS WELCOME
        </div>
        <h1 className="brand-title text-gradient-purple" style={{ fontSize: '1.8rem', marginTop: '6px' }}>
          MONA LISA PUZZLE & QUIZ
        </h1>
      </header>

      {/* Dynamic Screen Component */}
      {renderScreen()}
    </div>
  );
}
