import React, { useState, useEffect } from "react";
import { ClockIcon } from "@heroicons/react/24/outline";

interface CountdownProps {
  expiresAt: Date;
  onExpire?: () => void;
}

const Countdown: React.FC<CountdownProps> = ({ expiresAt, onExpire }) => {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    expired: boolean;
  } | null>(null);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const difference = expiresAt.getTime() - now.getTime();

      if (difference <= 0) {
        setTimeLeft({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          expired: true,
        });
        if (onExpire) onExpire();
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((difference / 1000 / 60) % 60);
      const seconds = Math.floor((difference / 1000) % 60);

      setTimeLeft({ days, hours, minutes, seconds, expired: false });
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [expiresAt, onExpire]);

  if (!timeLeft) return null;

  if (timeLeft.expired) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 mt-1">
        Time expired
      </span>
    );
  }

  let displayText = "";
  if (timeLeft.days > 0) displayText += `${timeLeft.days}d `;
  if (timeLeft.hours > 0 || timeLeft.days > 0)
    displayText += `${timeLeft.hours}h `;
  displayText += `${timeLeft.minutes}m ${timeLeft.seconds}s`;

  const colorClass =
    timeLeft.days <= 1
      ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
      : timeLeft.days <= 7
        ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
        : "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";

  return (
    <div className="mt-1">
      <span
        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${colorClass}`}
      >
        <ClockIcon className="h-3 w-3 mr-1" />
        {displayText} remaining
      </span>
    </div>
  );
};

export default Countdown;

