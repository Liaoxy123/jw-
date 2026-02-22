/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Trophy, 
  Timer, 
  Play, 
  RotateCcw, 
  Hash, 
  Zap, 
  Target,
  ChevronRight,
  Info
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useGameLogic } from './useGameLogic';
import { GRID_WIDTH, GRID_HEIGHT, cn } from './constants';

export default function App() {
  const {
    status,
    mode,
    grid,
    selectedIds,
    target,
    score,
    level,
    timeLeft,
    maxTime,
    startGame,
    toggleBlock,
    setStatus
  } = useGameLogic();

  const handleStart = (m: 'classic' | 'time') => {
    startGame(m);
  };

  const currentSum = grid
    .filter(b => selectedIds.includes(b.id))
    .reduce((acc, b) => acc + b.value, 0);

  return (
    <div className="game-container min-h-screen bg-white text-zinc-900 selection:bg-emerald-500/30">
      <AnimatePresence mode="wait">
        {status === 'menu' && (
          <motion.div
            key="menu"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="z-10 flex flex-col items-center max-w-md w-full px-6"
          >
            <div className="mb-8 text-center">
              <motion.div 
                initial={{ y: -20 }}
                animate={{ y: 0 }}
                className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 mb-4"
              >
                <Hash className="w-8 h-8 text-emerald-600" />
              </motion.div>
              <h1 className="text-5xl font-bold tracking-tighter mb-1 bg-gradient-to-b from-zinc-900 to-zinc-500 bg-clip-text text-transparent">
                数字堆叠
              </h1>
              <p className="text-zinc-400 font-medium uppercase tracking-widest text-[10px]">
                数学生存益智游戏
              </p>
            </div>

            <div className="grid gap-3 w-full">
              <button
                onClick={() => handleStart('classic')}
                className="group relative flex items-center justify-between p-5 rounded-2xl bg-zinc-50 border border-zinc-200 hover:border-emerald-500/50 transition-all duration-300 overflow-hidden"
              >
                <div className="absolute inset-0 bg-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                    <Zap className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-bold text-base">经典模式</h3>
                    <p className="text-xs text-zinc-500">消除方块以生存</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-zinc-300 group-hover:text-emerald-600 transition-colors" />
              </button>

              <button
                onClick={() => handleStart('time')}
                className="group relative flex items-center justify-between p-5 rounded-2xl bg-zinc-50 border border-zinc-200 hover:border-blue-500/50 transition-all duration-300 overflow-hidden"
              >
                <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600">
                    <Timer className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-bold text-base">计时挑战</h3>
                    <p className="text-xs text-zinc-500">与时间赛跑</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-zinc-300 group-hover:text-blue-600 transition-colors" />
              </button>
            </div>

            <div className="mt-8 p-4 rounded-xl bg-zinc-50 border border-zinc-100 flex gap-3 items-start">
              <Info className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5" />
              <p className="text-[11px] text-zinc-500 leading-relaxed">
                选择数字使其总和等于目标值。方块无需相邻。不要让方块堆积到顶部！
              </p>
            </div>
          </motion.div>
        )}

        {status === 'playing' && (
          <motion.div
            key="playing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="z-10 flex flex-col items-center w-full max-w-4xl"
          >
            {/* Header HUD */}
            <div className="w-full flex items-center justify-between mb-6 px-4">
              <div className="flex flex-col p-2 border-2 border-blue-400/30 rounded-xl bg-blue-50/50 min-w-[80px]">
                <span className="text-[9px] uppercase tracking-[0.2em] text-blue-600 font-bold mb-1">得分</span>
                <span className="text-xl font-mono font-bold text-zinc-900">{score.toLocaleString()}</span>
              </div>

              <div className="flex flex-col items-center">
                <div className="relative">
                  <div className="absolute -inset-3 bg-emerald-500/10 blur-xl rounded-full pulse-target" />
                  <div className="relative flex flex-col items-center justify-center w-20 h-20 rounded-full bg-white border-2 border-emerald-500/30 shadow-sm">
                    <span className="text-[9px] uppercase tracking-widest text-emerald-600/70 font-bold">目标值</span>
                    <span className="text-3xl font-mono font-bold text-emerald-600">{target}</span>
                  </div>
                </div>
              </div>

              <div className={cn(
                "flex flex-col items-end p-2 border-2 rounded-xl min-w-[80px] transition-all duration-300",
                currentSum === 0 ? "border-zinc-200 bg-zinc-50" : 
                currentSum < target ? "border-emerald-400/50 bg-emerald-50/50" :
                "border-red-400/50 bg-red-50/50"
              )}>
                <span className={cn(
                  "text-[9px] uppercase tracking-[0.2em] font-bold mb-1",
                  currentSum === 0 ? "text-zinc-400" : 
                  currentSum < target ? "text-emerald-600" :
                  "text-red-600"
                )}>当前和</span>
                <span className={cn(
                  "text-xl font-mono font-bold",
                  currentSum === 0 ? "text-zinc-900" : 
                  currentSum < target ? "text-emerald-600" :
                  "text-red-600"
                )}>{currentSum}</span>
              </div>
            </div>

            {/* Timer Bar (Time Mode) */}
            {mode === 'time' && (
              <div className="w-full max-w-[320px] h-1 bg-zinc-100 rounded-full mb-6 overflow-hidden border border-zinc-200">
                <motion.div 
                  className="h-full bg-blue-500"
                  initial={false}
                  animate={{ width: `${(timeLeft / maxTime) * 100}%` }}
                  transition={{ duration: 0.1, ease: "linear" }}
                />
              </div>
            )}

            {/* Game Grid */}
            <div 
              className="grid-container p-1.5"
              style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${GRID_WIDTH}, 1fr)`,
                gridTemplateRows: `repeat(${GRID_HEIGHT}, 1fr)`,
                gap: '5px',
                width: 'min(90vw, 320px)',
                aspectRatio: `${GRID_WIDTH} / ${GRID_HEIGHT}`
              }}
            >
              {/* Grid Background Lines */}
              <div className="absolute inset-0 grid pointer-events-none opacity-[0.03]"
                style={{
                  gridTemplateColumns: `repeat(${GRID_WIDTH}, 1fr)`,
                  gridTemplateRows: `repeat(${GRID_HEIGHT}, 1fr)`,
                }}
              >
                {Array.from({ length: GRID_WIDTH * GRID_HEIGHT }).map((_, i) => (
                  <div key={i} className="border border-black" />
                ))}
              </div>

              <AnimatePresence>
                {grid.map((block) => (
                  <motion.button
                    key={block.id}
                    layout
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ 
                      scale: 1, 
                      opacity: 1,
                      gridRow: block.row + 1,
                      gridColumn: block.col + 1
                    }}
                    exit={{ scale: 0, opacity: 0, rotate: 45 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => toggleBlock(block.id)}
                    className={cn(
                      "relative flex items-center justify-center rounded-md font-mono text-lg font-bold transition-all duration-200",
                      selectedIds.includes(block.id) 
                        ? "bg-emerald-500 text-white shadow-md z-10" 
                        : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200 hover:text-zinc-700"
                    )}
                  >
                    {block.value}
                  </motion.button>
                ))}
              </AnimatePresence>
            </div>

            {/* Controls */}
            <div className="mt-6 flex gap-4">
              <button 
                onClick={() => setStatus('menu')}
                className="p-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-zinc-400 hover:text-zinc-900 hover:border-zinc-300 transition-all"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}

        {status === 'gameover' && (
          <motion.div
            key="gameover"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="z-10 flex flex-col items-center text-center p-8 rounded-3xl bg-white border border-zinc-200 shadow-xl max-w-xs w-full"
          >
            <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-500 mb-6">
              <Trophy className="w-8 h-8" />
            </div>
            <h2 className="text-3xl font-bold mb-2">游戏结束</h2>
            <p className="text-zinc-400 mb-6 uppercase tracking-widest text-[10px] font-bold">方块堆积到了顶部</p>
            
            <div className="flex justify-center w-full mb-6">
              <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-100 flex flex-col items-center min-w-[120px]">
                <span className="block text-[10px] text-zinc-400 uppercase font-bold mb-1">最终得分</span>
                <span className="text-3xl font-mono font-bold text-zinc-900">{score}</span>
              </div>
            </div>

            <button
              onClick={() => setStatus('menu')}
              className="w-full py-3.5 rounded-2xl bg-emerald-500 text-white font-bold text-base hover:bg-emerald-600 transition-colors shadow-md flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4 fill-current" />
              再试一次
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
