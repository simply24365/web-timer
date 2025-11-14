import React from 'react';

interface TimerDisplayProps {
  timeLeft: number;
  totalTime: number;
}

const TimerDisplay: React.FC<TimerDisplayProps> = ({ timeLeft, totalTime }) => {
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const radius = 90;
  const stroke = 10;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const progress = totalTime > 0 ? timeLeft / totalTime : 0;
  const strokeDashoffset = circumference - progress * circumference;

  return (
    <div className="relative w-64 h-64 md:w-80 md:h-80 mx-auto">
      <svg
        height="100%"
        width="100%"
        viewBox="0 0 200 200"
        className="transform -rotate-90"
      >
        <circle
          stroke="#374151" // gray-700
          fill="transparent"
          strokeWidth={stroke}
          r={normalizedRadius}
          cx={radius + stroke}
          cy={radius + stroke}
        />
        <circle
          stroke="#22d3ee" // cyan-400
          fill="transparent"
          strokeWidth={stroke}
          strokeDasharray={circumference + ' ' + circumference}
          style={{ strokeDashoffset, transition: 'stroke-dashoffset 1s linear' }}
          r={normalizedRadius}
          cx={radius + stroke}
          cy={radius + stroke}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
        <span className="text-5xl md:text-6xl font-mono font-bold text-gray-100">
          {formatTime(timeLeft)}
        </span>
      </div>
    </div>
  );
};

export default TimerDisplay;
