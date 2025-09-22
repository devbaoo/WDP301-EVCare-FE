import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { isCurrentlyOpen, getNextOpeningTime } from '@/lib/timeUtils';
import { WeeklyOperatingHours } from '@/interfaces/serviceCenter';

interface RealTimeStatusProps {
  operatingHours: WeeklyOperatingHours;
  className?: string;
  showNextOpening?: boolean;
}

const RealTimeStatus: React.FC<RealTimeStatusProps> = ({
  operatingHours,
  className = "",
  showNextOpening = false
}) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isOpen, setIsOpen] = useState(false);
  const [nextOpening, setNextOpening] = useState<string | null>(null);

  useEffect(() => {
    // Update time every minute
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const checkStatus = () => {
      // Check if operatingHours is valid before processing
      if (!operatingHours) {
        setIsOpen(false);
        setNextOpening(null);
        return;
      }

      const currentlyOpen = isCurrentlyOpen(operatingHours);
      const nextOpeningTime = getNextOpeningTime(operatingHours);

      setIsOpen(currentlyOpen);
      setNextOpening(nextOpeningTime);
    };

    checkStatus();
  }, [operatingHours, currentTime]);

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <Clock className="w-4 h-4 text-orange-500 flex-shrink-0" />
      <div className="text-sm">
        <span className={`font-medium ${isOpen ? 'text-green-600' : 'text-red-600'}`}>
          {isOpen ? 'Open Now' : 'Closed'}
        </span>
        {showNextOpening && !isOpen && nextOpening && (
          <div className="text-xs text-gray-500 mt-1">
            Opens {nextOpening}
          </div>
        )}
      </div>
    </div>
  );
};

export default RealTimeStatus;
