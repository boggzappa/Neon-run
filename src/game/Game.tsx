import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, ArrowRight, ArrowUp, RotateCcw, Play, ChevronRight, Trophy, Heart } from 'lucide-react';
import { GameEngine } from './engine';
import { LEVELS } from './levels';
import { GameState, GameStatus } from './types';

const INITIAL_LIVES = 5;

export const Game: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<GameEngine | null>(null);
  const [gameState, setGameState] = useState<GameState>({
    status: 'START',
    currentLevelIndex: 0,
    lives: INITIAL_LIVES,
    score: 0,
    totalCoins: 0,
  });

  const level = LEVELS[gameState.currentLevelIndex];

  const handleStateChange = useCallback((newState: Partial<GameState>) => {
    setGameState(prev => {
      const updated = { ...prev, ...newState };
      
      // Handle life loss - Disabled: lives are now unlimited
      if (newState.lives !== undefined && newState.lives === -1) {
        // Return updated without changing lives or status
        return updated;
      }

      return updated;
    });
  }, []);

  useEffect(() => {
    if (gameState.status === 'PLAYING' && canvasRef.current && !engineRef.current) {
      engineRef.current = new GameEngine(canvasRef.current, level, gameState.score, handleStateChange);
      engineRef.current.start();
    }

    return () => {
      if (engineRef.current) {
        engineRef.current.stop();
        engineRef.current = null;
      }
    };
  }, [gameState.status, gameState.currentLevelIndex, level, handleStateChange]);

  const startGame = () => {
    setGameState({
      status: 'PLAYING',
      currentLevelIndex: 0,
      lives: INITIAL_LIVES,
      score: 0,
      totalCoins: 0,
    });
  };

  const nextLevel = () => {
    if (gameState.currentLevelIndex + 1 < LEVELS.length) {
      setGameState(prev => ({
        ...prev,
        status: 'PLAYING',
        currentLevelIndex: prev.currentLevelIndex + 1,
        totalCoins: 0, // Reset for new level progress
      }));
    } else {
      setGameState(prev => ({ ...prev, status: 'WIN' }));
    }
  };

  const restartLevel = () => {
    setGameState(prev => ({ ...prev, status: 'PLAYING' }));
  };

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!engineRef.current) return;
      if (e.key === 'ArrowLeft' || e.key === 'a') engineRef.current.input.left = true;
      if (e.key === 'ArrowRight' || e.key === 'd') engineRef.current.input.right = true;
      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === ' ') engineRef.current.input.up = true;
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (!engineRef.current) return;
      if (e.key === 'ArrowLeft' || e.key === 'a') engineRef.current.input.left = false;
      if (e.key === 'ArrowRight' || e.key === 'd') engineRef.current.input.right = false;
      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === ' ') engineRef.current.input.up = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const setMobileInput = (key: 'left' | 'right' | 'up', value: boolean) => {
    if (engineRef.current) {
      engineRef.current.input[key] = value;
    }
  };

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center bg-slate-950 font-sans overflow-hidden text-white select-none touch-none">
      {/* HUD */}
      {gameState.status === 'PLAYING' && (
        <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-10 pointer-events-none">
          <div className="flex flex-col gap-1">
            <h2 className="text-xl font-bold tracking-tight text-cyan-400 uppercase italic">
              {level.name}
            </h2>
            <div className="flex items-center gap-4 text-sm font-mono text-cyan-200">
              <span className="flex items-center gap-1">
                <Heart size={16} className="text-rose-500 fill-rose-500" /> ∞
              </span>
              <span>SCORE: {gameState.score.toString().padStart(6, '0')}</span>
            </div>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-xs font-mono text-cyan-400">COINS</span>
            <div className="flex gap-1">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className={`w-4 h-4 rounded-full border-2 border-yellow-400 ${
                    i < gameState.totalCoins ? 'bg-yellow-400 shadow-[0_0_8px_#fbbf24]' : 'bg-transparent opacity-30'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Game Canvas */}
      <div className="relative w-full h-full max-w-[1200px] max-h-[800px] border-y md:border-x border-cyan-900/30 shadow-[0_0_50px_rgba(6,182,212,0.1)] overflow-hidden">
        <canvas
          ref={canvasRef}
          width={800}
          height={600}
          className="w-full h-full object-contain bg-black"
        />
        
        {/* Overlay Screens */}
        <AnimatePresence mode="wait">
          {gameState.status === 'START' && (
            <motion.div
              key="start"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-950/90 backdrop-blur-sm"
            >
              <h1 className="text-6xl md:text-8xl font-black italic tracking-tighter text-cyan-400 mb-2 drop-shadow-[0_0_20px_#06b6d4]">
                NEON RUNNER
              </h1>
              <p className="text-cyan-200/60 font-mono tracking-widest mb-12 animate-pulse">PRESS START TO INFILTRATE</p>
              <button
                onClick={startGame}
                className="group relative px-12 py-4 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-none skew-x-[-12deg] transition-all"
              >
                <div className="flex items-center gap-2 skew-x-[12deg]">
                  <Play size={24} fill="currentColor" />
                  <span className="text-2xl">INITIALIZE</span>
                </div>
                <div className="absolute -inset-1 bg-cyan-400/30 blur-lg group-hover:bg-cyan-400/50 transition-all -z-10" />
              </button>
            </motion.div>
          )}

          {gameState.status === 'GAMEOVER' && (
            <motion.div
              key="gameover"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-rose-950/90 backdrop-blur-sm"
            >
              <h1 className="text-6xl md:text-8xl font-black italic text-rose-500 mb-8 tracking-tighter">TERMINATED</h1>
              <p className="text-rose-200 font-mono mb-12">SYSTEM RECOVERY REQUIRED</p>
              <button
                onClick={startGame}
                className="px-8 py-4 bg-rose-500 hover:bg-rose-400 text-white font-bold rounded-none skew-x-[-12deg] transition-all"
              >
                <div className="flex items-center gap-2 skew-x-[12deg]">
                  <RotateCcw size={24} />
                  <span>REBOOT</span>
                </div>
              </button>
            </motion.div>
          )}

          {gameState.status === 'LEVEL_COMPLETE' && (
            <motion.div
              key="complete"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-emerald-950/90 backdrop-blur-sm"
            >
              <h1 className="text-5xl md:text-7xl font-black italic text-emerald-400 mb-4 tracking-tighter">SECURED</h1>
              <div className="text-center mb-12 font-mono text-emerald-200 space-y-2">
                <p>LEVEL {gameState.currentLevelIndex + 1} CLEAR</p>
                <p className="text-2xl text-white">SCORE: {gameState.score}</p>
              </div>
              <button
                onClick={nextLevel}
                className="px-12 py-4 bg-emerald-500 hover:bg-emerald-400 text-white font-bold skew-x-[-12deg] transition-all"
              >
                <div className="flex items-center gap-2 skew-x-[12deg]">
                  <ChevronRight size={32} />
                  <span>CONTINUE</span>
                </div>
              </button>
            </motion.div>
          )}

          {gameState.status === 'WIN' && (
            <motion.div
              key="win"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-cyan-500/95"
            >
              <Trophy size={120} className="text-white mb-8 drop-shadow-2xl animate-bounce" />
              <h1 className="text-6xl md:text-8xl font-black italic text-white mb-4 tracking-tighter uppercase">LEGEND</h1>
              <p className="text-cyan-900 font-mono text-xl mb-12">ALL SECTORS BREACHED</p>
              <div className="text-2xl font-bold text-white mb-12">FINAL SCORE: {gameState.score}</div>
              <button
                onClick={startGame}
                className="px-12 py-4 bg-white text-cyan-600 font-bold skew-x-[-12deg] hover:bg-cyan-50"
              >
                <div className="flex items-center gap-2 skew-x-[12deg]">
                  <RotateCcw size={24} />
                  <span>REPLAY MISSION</span>
                </div>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Mobile Controls */}
      {gameState.status === 'PLAYING' && (
        <div className="mt-auto w-full md:hidden flex justify-between p-8 pb-12 items-end z-30">
          <div className="flex gap-4">
            <button
              onPointerDown={() => setMobileInput('left', true)}
              onPointerUp={() => setMobileInput('left', false)}
              onPointerLeave={() => setMobileInput('left', false)}
              className="w-20 h-20 bg-slate-800/80 rounded-2xl flex items-center justify-center border border-slate-700 active:bg-cyan-500 transition-colors"
            >
              <ArrowLeft size={32} />
            </button>
            <button
              onPointerDown={() => setMobileInput('right', true)}
              onPointerUp={() => setMobileInput('right', false)}
              onPointerLeave={() => setMobileInput('right', false)}
              className="w-20 h-20 bg-slate-800/80 rounded-2xl flex items-center justify-center border border-slate-700 active:bg-cyan-500 transition-colors"
            >
              <ArrowRight size={32} />
            </button>
          </div>
          <button
            onPointerDown={() => setMobileInput('up', true)}
            onPointerUp={() => setMobileInput('up', false)}
            onPointerLeave={() => setMobileInput('up', false)}
            className="w-24 h-24 bg-cyan-600/80 rounded-full flex items-center justify-center border-4 border-cyan-400 active:bg-cyan-400 transition-colors shadow-lg"
          >
            <ArrowUp size={40} />
          </button>
        </div>
      )}

      {/* Desktop Hint */}
      <div className="hidden md:block mt-4 text-slate-500 font-mono text-xs uppercase tracking-widest">
        WASD or Arrows to Move & Jump • Get to the Green Portal
      </div>
    </div>
  );
};

export default Game;
