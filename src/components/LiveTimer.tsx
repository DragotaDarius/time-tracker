'use client';

import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';

interface LiveTimerProps {
  startTime: string;
  className?: string;
}

export default function LiveTimer({ startTime, className = '' }: LiveTimerProps) {
  const [duration, setDuration] = useState('');

  useEffect(() => {
    const updateTimer = () => {
      const start = new Date(startTime);
      const now = new Date();
      const diff = now.getTime() - start.getTime();

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      const formattedDuration = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
      setDuration(formattedDuration);
    };

    // Update immediately
    updateTimer();

    // Update every second
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [startTime]);

  return (
    <div className="flex items-center space-x-2">
      <Badge variant="secondary" className={`text-lg font-mono bg-green-100 text-green-800 border-green-300 ${className}`}>
        {duration}
      </Badge>
      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
    </div>
  );
} 