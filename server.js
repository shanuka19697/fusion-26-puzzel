import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

const PORT = process.env.PORT || 3000;

// Game State Management
const gameState = {
  status: 'LOBBY', // 'LOBBY' | 'PLAYING' | 'FINISHED'
  config: {
    gridDimension: 3, // 3x3, 4x4, 5x5
    imageSrc: '/assets/monalisa.jpg',
    customImageUrl: null,
    gameTitle: "Fusion '26 Puzzle Challenge",
  },
  students: new Map(), // indexNumber -> studentObj
  socketToStudent: new Map(), // socketId -> indexNumber
  gameStartTime: null,
  gameEndTime: null,
  submissions: []
};

// Helper: Get sanitized list of students sorted by MCQ Score (desc) then Solve Time (asc)
function getPublicStudentsList() {
  const list = Array.from(gameState.students.values()).map(s => ({
    name: s.name,
    indexNumber: s.indexNumber,
    status: s.status,
    joinedAt: s.joinedAt,
    solveTime: s.solveTime,
    moves: s.moves,
    mcqScore: s.mcqScore || 0,
    mcqCorrectCount: s.mcqCorrectCount || 0,
    completedAt: s.completedAt,
  }));

  return list.sort((a, b) => {
    if (a.status === 'COMPLETED' && b.status === 'COMPLETED') {
      // Primary: MCQ Score descending
      if (b.mcqScore !== a.mcqScore) {
        return b.mcqScore - a.mcqScore;
      }
      // Secondary: Solve Time ascending
      return a.solveTime - b.solveTime;
    }
    if (a.status === 'COMPLETED') return -1;
    if (b.status === 'COMPLETED') return 1;
    return a.joinedAt - b.joinedAt;
  });
}

function isValidIndexNumber(indexStr) {
  if (!indexStr || typeof indexStr !== 'string') return false;
  const cleanStr = indexStr.trim().toLowerCase();
  const pattern = /^2025[\/]?t[\/]?\w{3,7}$/i;
  return pattern.test(cleanStr);
}

io.on('connection', (socket) => {
  console.log(`🔌 Client connected: ${socket.id}`);

  socket.emit('init_state', {
    status: gameState.status,
    config: gameState.config,
    studentsCount: gameState.students.size,
    gameStartTime: gameState.gameStartTime,
    students: getPublicStudentsList()
  });

  // Student Register
  socket.on('student:register', ({ name, indexNumber }) => {
    if (!name || !name.trim()) {
      return socket.emit('register:response', { success: false, error: 'Please enter your name.' });
    }

    const cleanIndex = (indexNumber || '').trim().toLowerCase();
    if (!isValidIndexNumber(cleanIndex)) {
      return socket.emit('register:response', { 
        success: false, 
        error: 'Invalid Index Number format! Must be 2025txxxxx (e.g. 2025t00123).' 
      });
    }

    const formattedIndex = cleanIndex.toUpperCase();

    let student = gameState.students.get(formattedIndex);
    if (student && student.socketId && student.socketId !== socket.id) {
      // Invalidate previous socket session for this index number
      io.to(student.socketId).emit('session:invalidated', {
        message: 'Your index number was logged in from another device or tab.'
      });
      gameState.socketToStudent.delete(student.socketId);
    }

    if (!student) {
      student = {
        id: socket.id,
        socketId: socket.id,
        name: name.trim(),
        indexNumber: formattedIndex,
        joinedAt: Date.now(),
        status: gameState.status === 'PLAYING' ? 'PLAYING' : 'QUEUED',
        solveTime: null,
        moves: 0,
        mcqScore: 0,
        mcqCorrectCount: 0,
        completedAt: null
      };
      gameState.students.set(formattedIndex, student);
    } else {
      student.socketId = socket.id;
      student.name = name.trim();
    }

    gameState.socketToStudent.set(socket.id, formattedIndex);

    socket.emit('register:response', {
      success: true,
      student: {
        name: student.name,
        indexNumber: student.indexNumber,
        status: student.status,
        solveTime: student.solveTime,
        mcqScore: student.mcqScore
      },
      gameStatus: gameState.status,
      config: gameState.config,
      gameStartTime: gameState.gameStartTime
    });

    io.emit('queue:updated', {
      studentsCount: gameState.students.size,
      students: getPublicStudentsList()
    });
  });

  // Submit Completed Puzzle Solution & MCQ Score
  socket.on('student:submit_solution', ({ moves, solveTime, mcqScore, mcqCorrectCount }) => {
    const indexNumber = gameState.socketToStudent.get(socket.id);
    if (!indexNumber) {
      return socket.emit('submit:response', { success: false, error: 'Student session not found.' });
    }

    const student = gameState.students.get(indexNumber);
    if (!student) return;

    const computedTime = gameState.gameStartTime 
      ? Math.max(0, Date.now() - gameState.gameStartTime)
      : solveTime;

    student.status = 'COMPLETED';
    student.solveTime = computedTime;
    student.moves = moves || 0;
    student.mcqScore = mcqScore || 0;
    student.mcqCorrectCount = mcqCorrectCount || 0;
    student.completedAt = Date.now();

    const studentList = getPublicStudentsList();
    const rank = studentList.findIndex(s => s.indexNumber === student.indexNumber) + 1;

    socket.emit('submit:response', {
      success: true,
      rank,
      solveTime: student.solveTime,
      moves: student.moves,
      mcqScore: student.mcqScore,
      mcqCorrectCount: student.mcqCorrectCount
    });

    io.emit('submission:new', {
      student: {
        name: student.name,
        indexNumber: student.indexNumber,
        solveTime: student.solveTime,
        moves: student.moves,
        mcqScore: student.mcqScore,
        mcqCorrectCount: student.mcqCorrectCount,
        rank
      },
      leaderboard: studentList
    });
  });

  // Admin Events
  socket.on('admin:start_game', () => {
    gameState.status = 'PLAYING';
    gameState.gameStartTime = Date.now();

    gameState.students.forEach(s => {
      if (s.status === 'QUEUED') {
        s.status = 'PLAYING';
        s.solveTime = null;
        s.moves = 0;
        s.mcqScore = 0;
      }
    });

    console.log(`🚀 GAME STARTED by Admin! (${gameState.students.size} participants)`);

    io.emit('game:started', {
      status: 'PLAYING',
      config: gameState.config,
      gameStartTime: gameState.gameStartTime
    });
  });

  socket.on('admin:reset_game', () => {
    gameState.status = 'LOBBY';
    gameState.gameStartTime = null;
    gameState.gameEndTime = null;

    // Reset queue and all student sessions so all devices log out to registration
    gameState.students.clear();
    gameState.socketToStudent.clear();

    console.log(`🔄 GAME RESET by Admin! All student sessions cleared.`);

    io.emit('game:reset', {
      status: 'LOBBY',
      config: gameState.config,
      studentsCount: 0,
      students: []
    });
  });

  socket.on('admin:end_game', () => {
    gameState.status = 'FINISHED';
    gameState.gameEndTime = Date.now();

    const finalLeaderboard = getPublicStudentsList();

    io.emit('game:ended', {
      status: 'FINISHED',
      leaderboard: finalLeaderboard,
      gameStartTime: gameState.gameStartTime,
      gameEndTime: gameState.gameEndTime
    });
  });

  socket.on('admin:update_config', (newConfig) => {
    if (newConfig.gridDimension) gameState.config.gridDimension = parseInt(newConfig.gridDimension);
    if (newConfig.imageSrc) gameState.config.imageSrc = newConfig.imageSrc;
    if (newConfig.customImageUrl) gameState.config.customImageUrl = newConfig.customImageUrl;

    io.emit('config:updated', gameState.config);
  });

  socket.on('disconnect', () => {
    console.log(`🔌 Client disconnected: ${socket.id}`);
    const indexNumber = gameState.socketToStudent.get(socket.id);
    if (indexNumber) {
      const student = gameState.students.get(indexNumber);
      // Remove student from waiting queue if they leave or close the webpage
      if (student && student.status === 'QUEUED') {
        gameState.students.delete(indexNumber);
        console.log(`🗑️ Removed disconnected student from queue: ${student.name} (${indexNumber})`);
      }
      gameState.socketToStudent.delete(socket.id);

      io.emit('queue:updated', {
        studentsCount: gameState.students.size,
        students: getPublicStudentsList()
      });
    }
  });
});

app.get('/api/server-info', (req, res) => {
  res.json({
    status: gameState.status,
    studentsCount: gameState.students.size,
    host: req.headers.host
  });
});

async function setupServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
    console.log('⚡ Vite dev middleware attached');
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.use((req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`====================================================`);
    console.log(`🎉 Fusion '26 Puzzle Server running on http://localhost:${PORT}`);
    console.log(`📱 Admin Panel: http://localhost:${PORT}/?admin=true`);
    console.log(`====================================================`);
  });
}

setupServer();
