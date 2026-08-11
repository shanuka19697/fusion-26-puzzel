import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [gameState, setGameState] = useState({
    status: 'LOBBY', // 'LOBBY' | 'PLAYING' | 'FINISHED'
    config: {
      gridDimension: 3,
      imageSrc: '/assets/monalisa.svg',
      customImageUrl: null,
      gameTitle: "Fusion '26 Puzzle Challenge"
    },
    studentsCount: 0,
    students: [],
    gameStartTime: null
  });

  useEffect(() => {
    // Automatically connect to current origin host
    const socketInstance = io(window.location.origin, {
      reconnectionAttempts: 10,
      reconnectionDelay: 1000
    });

    socketInstance.on('connect', () => {
      console.log('⚡ Connected to Socket.IO Server');
      setIsConnected(true);
    });

    socketInstance.on('disconnect', () => {
      console.log('❌ Disconnected from Socket.IO Server');
      setIsConnected(false);
    });

    // Initial state payload
    socketInstance.on('init_state', (data) => {
      setGameState((prev) => ({ ...prev, ...data }));
    });

    // Queue updated event
    socketInstance.on('queue:updated', (data) => {
      setGameState((prev) => ({
        ...prev,
        studentsCount: data.studentsCount,
        students: data.students
      }));
    });

    // Game started event
    socketInstance.on('game:started', (data) => {
      setGameState((prev) => ({
        ...prev,
        status: data.status,
        config: data.config,
        gameStartTime: data.gameStartTime
      }));
    });

    // Game ended event
    socketInstance.on('game:ended', (data) => {
      setGameState((prev) => ({
        ...prev,
        status: data.status,
        students: data.leaderboard,
        gameEndTime: data.gameEndTime
      }));
    });

    // Game reset event
    socketInstance.on('game:reset', (data) => {
      setGameState((prev) => ({
        ...prev,
        status: data.status,
        config: data.config,
        studentsCount: data.studentsCount,
        students: data.students,
        gameStartTime: null
      }));
    });

    // Config updated event
    socketInstance.on('config:updated', (newConfig) => {
      setGameState((prev) => ({ ...prev, config: newConfig }));
    });

    // Submission updated event
    socketInstance.on('submission:new', (data) => {
      setGameState((prev) => ({
        ...prev,
        students: data.leaderboard
      }));
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket, isConnected, gameState }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
