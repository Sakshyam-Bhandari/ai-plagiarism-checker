import React from 'react';

interface ScoreIndicatorProps {
  score: number;
}

const ScoreIndicator: React.FC<ScoreIndicatorProps> = ({ score }) => {
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const getScoreColor = (s: number) => {
    if (s > 75) return 'text-red-500 stroke-red-500';
    if (s > 40) return 'text-yellow-400 stroke-yellow-400';
    return 'text-green-400 stroke-green-400';
  };
  
  const colorClasses = getScoreColor(score);

  return (
    <div className="relative flex items-center justify-center w-40 h-40">
      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
        <circle
          className="text-slate-700"
          strokeWidth="10"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx="60"
          cy="60"
        />
        <circle
          className={`${colorClasses} transition-all duration-1000 ease-out`}
          strokeWidth="10"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx="60"
          cy="60"
        />
      </svg>
      <span className={`absolute text-4xl font-bold ${colorClasses.split(' ')[0]}`}>
        {Math.round(score)}%
      </span>
    </div>
  );
};

export default ScoreIndicator;