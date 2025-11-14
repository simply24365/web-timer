import React, { useState, useEffect, useRef, useCallback } from 'react';
import TimerDisplay from './components/TimerDisplay';

const PRESET_TIMES = [
  { label: '30s', value: 30 },
  { label: '1m', value: 60 },
  { label: '3m', value: 180 },
  { label: '5m', value: 300 },
  { label: '10m', value: 600 },
  { label: '15m', value: 900 },
  { label: '30m', value: 1800 },
  { label: '60m', value: 3600 },
];

const App: React.FC = () => {
  const [initialTime, setInitialTime] = useState(300);
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const [isRunning, setIsRunning] = useState(false);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const intervalRef = useRef<number | null>(null);

  const [customMinutes, setCustomMinutes] = useState(String(Math.floor(initialTime / 60)));
  const [customSeconds, setCustomSeconds] = useState(String(initialTime % 60).padStart(2, '0'));

  const playAlarmSound = useCallback(() => {
    if (!audioContext) return;
    
    const playBeep = (time: number, frequency: number) => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
      gainNode.gain.setValueAtTime(0.5, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.8);

      oscillator.start(time);
      oscillator.stop(time + 0.8);
    };

    const now = audioContext.currentTime;
    playBeep(now, 880); // A5
    playBeep(now + 0.5, 1046.50); // C6
    playBeep(now + 1.0, 880); // A5

  }, [audioContext]);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            clearInterval(intervalRef.current!);
            setIsRunning(false);
            playAlarmSound();
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, playAlarmSound]);
  
  const handleInitAudio = () => {
    if (!audioContext) {
      const context = new (window.AudioContext || (window as any).webkitAudioContext)();
      context.resume().then(() => {
        setAudioContext(context);
      });
    }
  };

  const handlePresetSelect = (seconds: number) => {
    setIsRunning(false);
    setInitialTime(seconds);
    setTimeLeft(seconds);
    setCustomMinutes(String(Math.floor(seconds / 60)));
    setCustomSeconds(String(seconds % 60).padStart(2, '0'));
  };

  const handleStartPause = () => {
    if (!audioContext) {
        handleInitAudio();
    }
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(initialTime);
  };

  const handleMinutesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMinutes = e.target.value.replace(/[^0-9]/g, '');
    setCustomMinutes(newMinutes);

    const totalSeconds = (parseInt(newMinutes, 10) || 0) * 60 + (parseInt(customSeconds, 10) || 0);
    setIsRunning(false);
    setInitialTime(totalSeconds);
    setTimeLeft(totalSeconds);
  };

  const handleSecondsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newSeconds = e.target.value.replace(/[^0-9]/g, '');
    if (parseInt(newSeconds, 10) > 59) {
        newSeconds = '59';
    }
    setCustomSeconds(newSeconds);
    
    const totalSeconds = (parseInt(customMinutes, 10) || 0) * 60 + (parseInt(newSeconds, 10) || 0);
    setIsRunning(false);
    setInitialTime(totalSeconds);
    setTimeLeft(totalSeconds);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 p-4 text-center">
      <main className="w-full max-w-md mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold text-cyan-400 mb-8">Focus Timer</h1>
        
        <TimerDisplay timeLeft={timeLeft} totalTime={initialTime} />
        
        <div className="my-8 space-y-6">
          <div>
            <p className="text-gray-400 text-sm mb-2">Set a custom time</p>
            <div className="flex justify-center items-center gap-2 text-3xl font-mono">
              <input
                type="number"
                value={customMinutes}
                onChange={handleMinutesChange}
                className="w-24 bg-gray-700 text-center rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-cyan-400 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                min="0"
                aria-label="Minutes"
              />
              <span className="text-gray-400">:</span>
              <input
                type="number"
                value={customSeconds}
                onChange={handleSecondsChange}
                className="w-24 bg-gray-700 text-center rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-cyan-400 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                min="0"
                max="59"
                aria-label="Seconds"
              />
            </div>
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            {PRESET_TIMES.map((preset) => (
              <button
                key={preset.value}
                onClick={() => handlePresetSelect(preset.value)}
                className={`px-4 py-2 rounded-md font-semibold transition-colors duration-200 ${
                  initialTime === preset.value
                    ? 'bg-cyan-500 text-gray-900'
                    : 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>
        
        <div className="flex justify-center space-x-4">
          <button
            onClick={handleStartPause}
            className="px-10 py-4 w-40 bg-cyan-500 text-gray-900 font-bold rounded-lg hover:bg-cyan-400 focus:outline-none focus:ring-4 focus:ring-cyan-300 transition-all duration-300 text-xl"
          >
            {isRunning ? 'Pause' : 'Start'}
          </button>
          <button
            onClick={handleReset}
            className="px-10 py-4 w-40 bg-gray-700 text-gray-200 font-bold rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-4 focus:ring-gray-500 transition-all duration-300 text-xl"
          >
            Reset
          </button>
        </div>
      </main>
      <footer className="absolute bottom-4 text-gray-500 text-sm">
        <p>Stay focused and be productive.</p>
      </footer>
    </div>
  );
};

export default App;
