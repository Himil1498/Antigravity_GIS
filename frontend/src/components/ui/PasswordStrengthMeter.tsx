import React, { useMemo } from 'react';

interface PasswordStrengthMeterProps {
  password: string;
}

interface StrengthResult {
  score: number;       // 0-4
  label: string;
  color: string;
  bgColor: string;
  textColor: string;
}

const calculateStrength = (password: string): StrengthResult => {
  if (!password) {
    return { score: 0, label: '', color: '', bgColor: '', textColor: '' };
  }

  let score = 0;

  // 1. Length Check (Hard Requirement: 8 chars)
  if (password.length >= 8) {
    score += 1; // Base score
    if (password.length >= 12) score += 1; // Bonus for length
  } else {
    // If less than 8 chars, it can never be better than "Weak" (1)
    return { 
      score: 1, 
      label: 'Poor', 
      color: 'bg-red-500', 
      bgColor: 'bg-red-500/10 dark:bg-red-500/20', 
      textColor: 'text-red-600 dark:text-red-400' 
    };
  }

  // 2. Complexity Matrix (Only if 8+ chars)
  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSymbol = /[^a-zA-Z0-9]/.test(password);

  if (hasLower && hasUpper) score += 1;
  if (hasNumber) score += 1;
  if (hasSymbol) score += 1;

  // Cap the UI score at 4 (representing levels 1-4)
  // Logic: 
  // Score 1: 8 chars (Weak)
  // Score 2: 8 chars + some variety (Fair)
  // Score 3: 10+ chars + more variety (Good)
  // Score 4: 12+ chars + full variety (Strong/Excellent)
  const finalScore = Math.min(Math.max(score - 0, 1), 4);

  const levels: Record<number, Omit<StrengthResult, 'score'>> = {
    0: { label: '',       color: '',                     bgColor: '',                                    textColor: '' },
    1: { label: 'Weak',   color: 'bg-red-500',           bgColor: 'bg-red-500/10 dark:bg-red-500/20',     textColor: 'text-red-600 dark:text-red-400' },
    2: { label: 'Fair',   color: 'bg-amber-500',         bgColor: 'bg-amber-500/10 dark:bg-amber-500/20',  textColor: 'text-amber-600 dark:text-amber-400' },
    3: { label: 'Good',   color: 'bg-blue-500',          bgColor: 'bg-blue-500/10 dark:bg-blue-500/20',    textColor: 'text-blue-600 dark:text-blue-400' },
    4: { label: 'Strong', color: 'bg-emerald-500',       bgColor: 'bg-emerald-500/10 dark:bg-emerald-500/20', textColor: 'text-emerald-600 dark:text-emerald-400' },
  };

  return { score: finalScore, ...levels[finalScore] };
};

const PasswordStrengthMeter: React.FC<PasswordStrengthMeterProps> = ({ password }) => {
  const strength = useMemo(() => calculateStrength(password), [password]);

  if (!password) return null;

  return (
    <div className="mt-2 space-y-1.5 animate-fadeIn">
      {/* Segmented strength bar */}
      <div className="flex gap-1">
        {[1, 2, 3, 4].map((level) => (
          <div
            key={level}
            className={`h-1 flex-1 rounded-full transition-all duration-300 ${
              level <= strength.score
                ? strength.color
                : 'bg-gray-200 dark:bg-gray-700'
            }`}
          />
        ))}
      </div>

      {/* Label + hints */}
      <div className="flex items-center justify-between">
        <span className={`text-[10px] font-bold uppercase tracking-wider ${strength.textColor}`}>
          {strength.label}
        </span>
        {strength.score < 3 && (
          <span className="text-[10px] text-gray-400 dark:text-gray-500 font-medium">
            {strength.score < 2
              ? 'Add uppercase, numbers & symbols'
              : 'Add more length or symbols'}
          </span>
        )}
        {strength.score >= 3 && (
          <span className="text-[10px] text-gray-400 dark:text-gray-500 font-medium flex items-center gap-0.5">
            <svg className="w-3 h-3 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            {strength.score === 4 ? 'Excellent!' : 'Looking good'}
          </span>
        )}
      </div>
    </div>
  );
};

export default PasswordStrengthMeter;
