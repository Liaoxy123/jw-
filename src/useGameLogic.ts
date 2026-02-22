import { useState, useEffect, useCallback, useRef } from 'react';
import confetti from 'canvas-confetti';
import { GRID_WIDTH, GRID_HEIGHT, INITIAL_ROWS, BlockData, GameMode, GameStatus } from './constants';

export function useGameLogic() {
  const [status, setStatus] = useState<GameStatus>('menu');
  const [mode, setMode] = useState<GameMode>('classic');
  const [grid, setGrid] = useState<BlockData[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [target, setTarget] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [level, setLevel] = useState<number>(1);
  const [timeLeft, setTimeLeft] = useState<number>(10);
  const [maxTime, setMaxTime] = useState<number>(10);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const generateTarget = useCallback((currentGrid: BlockData[]) => {
    if (currentGrid.length === 0) return 10;
    
    // Pick 2-4 random blocks and sum them to ensure a solution exists
    const count = Math.min(currentGrid.length, Math.floor(Math.random() * 3) + 2);
    const shuffled = [...currentGrid].sort(() => 0.5 - Math.random());
    const sum = shuffled.slice(0, count).reduce((acc, b) => acc + b.value, 0);
    return sum;
  }, []);

  const addNewRow = useCallback(() => {
    setGrid((prev) => {
      // Check if any block is at the top (row 0)
      const isGameOver = prev.some(b => b.row === 0);
      if (isGameOver) {
        setStatus('gameover');
        return prev;
      }

      // Move existing blocks up
      const movedBlocks = prev.map(b => ({ ...b, row: b.row - 1 }));
      
      // Add new row at the bottom (row GRID_HEIGHT - 1)
      const newRow: BlockData[] = Array.from({ length: GRID_WIDTH }).map((_, col) => ({
        id: Math.random().toString(36).substr(2, 9),
        value: Math.floor(Math.random() * 9) + 1,
        row: GRID_HEIGHT - 1,
        col
      }));

      return [...movedBlocks, ...newRow];
    });

    if (mode === 'time') {
      setTimeLeft(maxTime);
    }
  }, [mode, maxTime]);

  const startGame = (selectedMode: GameMode) => {
    setMode(selectedMode);
    setStatus('playing');
    setScore(0);
    setLevel(1);
    setSelectedIds([]);
    
    const initialBlocks: BlockData[] = [];
    for (let r = GRID_HEIGHT - INITIAL_ROWS; r < GRID_HEIGHT; r++) {
      for (let c = 0; c < GRID_WIDTH; c++) {
        initialBlocks.push({
          id: Math.random().toString(36).substr(2, 9),
          value: Math.floor(Math.random() * 9) + 1,
          row: r,
          col: c
        });
      }
    }
    setGrid(initialBlocks);
    setTarget(generateTarget(initialBlocks));
    
    if (selectedMode === 'time') {
      const initialTime = 10;
      setMaxTime(initialTime);
      setTimeLeft(initialTime);
    }
  };

  const toggleBlock = (id: string) => {
    if (status !== 'playing') return;
    
    setSelectedIds(prev => {
      if (prev.includes(id)) {
        return prev.filter(i => i !== id);
      }
      return [...prev, id];
    });
  };

  // Check sum
  useEffect(() => {
    if (status !== 'playing') return;

    const selectedBlocks = grid.filter(b => selectedIds.includes(b.id));
    const currentSum = selectedBlocks.reduce((acc, b) => acc + b.value, 0);

    if (currentSum === target) {
      // Success!
      setScore(prev => prev + (selectedIds.length * 10 * level));
      
      // Trigger confetti for big clears
      if (selectedIds.length >= 3) {
        confetti({
          particleCount: 40,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#10b981', '#3b82f6', '#ffffff']
        });
      }

      setGrid(prev => {
        const nextGrid = prev.filter(b => !selectedIds.includes(b.id));
        // After clearing, we might need to update the target
        setTarget(generateTarget(nextGrid));
        return nextGrid;
      });
      setSelectedIds([]);

      if (mode === 'classic') {
        addNewRow();
      }
    } else if (currentSum > target) {
      // Over sum, reset selection
      setSelectedIds([]);
    }
  }, [selectedIds, target, grid, status, mode, level, addNewRow, generateTarget]);

  // Timer logic for Time Mode
  useEffect(() => {
    if (status === 'playing' && mode === 'time') {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 0) {
            addNewRow();
            return maxTime;
          }
          return prev - 0.1;
        });
      }, 100);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [status, mode, addNewRow, maxTime]);

  // Difficulty scaling
  useEffect(() => {
    const newLevel = Math.floor(score / 500) + 1;
    if (newLevel !== level) {
      setLevel(newLevel);
      if (mode === 'time') {
        setMaxTime(Math.max(4, 10 - (newLevel - 1) * 0.5));
      }
    }
  }, [score, level, mode]);

  return {
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
  };
}
