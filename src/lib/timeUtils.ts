/**
 * Utility functions for time-related operations
 */

export interface OperatingHours {
  open: string;
  close: string;
  isOpen: boolean;
}

export interface WeeklyOperatingHours {
  monday: OperatingHours;
  tuesday: OperatingHours;
  wednesday: OperatingHours;
  thursday: OperatingHours;
  friday: OperatingHours;
  saturday: OperatingHours;
  sunday: OperatingHours;
}

/**
 * Get current day of week (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
 */
export const getCurrentDayOfWeek = (): number => {
  return new Date().getDay();
};

/**
 * Get current time in HH:MM format
 */
export const getCurrentTime = (): string => {
  const now = new Date();
  return now.toTimeString().slice(0, 5); // HH:MM format
};

/**
 * Convert time string (HH:MM) to minutes since midnight
 */
export const timeToMinutes = (timeString?: string): number => {
  if (!timeString || typeof timeString !== 'string') return NaN;
  const parts = timeString.split(':');
  if (parts.length < 2) return NaN;
  const hours = Number(parts[0]);
  const minutes = Number(parts[1]);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return NaN;
  return hours * 60 + minutes;
};

/**
 * Check if current time is within operating hours
 */
export const isCurrentlyOpen = (operatingHours: WeeklyOperatingHours): boolean => {
  const currentDay = getCurrentDayOfWeek();
  const currentTime = getCurrentTime();
  
  // Map day numbers to day names
  const dayMap = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const currentDayName = dayMap[currentDay] as keyof WeeklyOperatingHours;
  
  const todayHours = operatingHours?.[currentDayName];
  
  // If the center is marked as closed for today or missing config
  if (!todayHours || !todayHours.isOpen || !todayHours.open || !todayHours.close) {
    return false;
  }
  
  const currentMinutes = timeToMinutes(currentTime);
  const openMinutes = timeToMinutes(todayHours.open);
  const closeMinutes = timeToMinutes(todayHours.close);

  if (Number.isNaN(currentMinutes) || Number.isNaN(openMinutes) || Number.isNaN(closeMinutes)) {
    return false;
  }
  
  // Handle case where close time is next day (e.g., 23:00 - 02:00)
  if (closeMinutes < openMinutes) {
    return currentMinutes >= openMinutes || currentMinutes < closeMinutes;
  }
  
  // Normal case where close time is same day
  return currentMinutes >= openMinutes && currentMinutes < closeMinutes;
};

/**
 * Get next opening time
 */
export const getNextOpeningTime = (operatingHours: WeeklyOperatingHours): string | null => {
  const currentDay = getCurrentDayOfWeek();
  const dayMap = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  
  // Check next 7 days
  for (let i = 0; i < 7; i++) {
    const checkDay = (currentDay + i) % 7;
    const dayName = dayMap[checkDay] as keyof WeeklyOperatingHours;
    const dayHours = operatingHours?.[dayName];
    
    if (dayHours && dayHours.isOpen && dayHours.open) {
      if (i === 0) {
        // Today - check if it opens later today
        const currentTime = getCurrentTime();
        const currentMinutes = timeToMinutes(currentTime);
        const openMinutes = timeToMinutes(dayHours.open);
        if (Number.isNaN(currentMinutes) || Number.isNaN(openMinutes)) {
          continue;
        }
        
        if (currentMinutes < openMinutes) {
          return `Today at ${dayHours.open}`;
        }
      } else {
        // Future day
        const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        return `${dayNames[checkDay]} at ${dayHours.open}`;
      }
    }
  }
  
  return null;
};

/**
 * Get time until next opening
 */
export const getTimeUntilNextOpening = (operatingHours: WeeklyOperatingHours): string | null => {
  const currentDay = getCurrentDayOfWeek();
  const currentTime = getCurrentTime();
  const dayMap = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  
  // Check next 7 days
  for (let i = 0; i < 7; i++) {
    const checkDay = (currentDay + i) % 7;
    const dayName = dayMap[checkDay] as keyof WeeklyOperatingHours;
    const dayHours = operatingHours?.[dayName];
    
    if (dayHours && dayHours.isOpen && dayHours.open) {
      if (i === 0) {
        // Today - check if it opens later today
        const currentMinutes = timeToMinutes(currentTime);
        const openMinutes = timeToMinutes(dayHours.open);
        if (Number.isNaN(currentMinutes) || Number.isNaN(openMinutes)) {
          continue;
        }
        
        if (currentMinutes < openMinutes) {
          const minutesUntilOpen = openMinutes - currentMinutes;
          const hours = Math.floor(minutesUntilOpen / 60);
          const minutes = minutesUntilOpen % 60;
          
          if (hours > 0) {
            return `${hours}h ${minutes}m`;
          } else {
            return `${minutes}m`;
          }
        }
      } else {
        // Future day - calculate time until that day
        const currentDate = new Date();
        const targetDate = new Date(currentDate);
        targetDate.setDate(currentDate.getDate() + i);
        const parts = dayHours.open.split(':');
        const h = Number(parts[0]);
        const m = Number(parts[1]);
        if (Number.isNaN(h) || Number.isNaN(m)) {
          continue;
        }
        targetDate.setHours(h, m, 0, 0);
        
        const timeDiff = targetDate.getTime() - currentDate.getTime();
        const hours = Math.floor(timeDiff / (1000 * 60 * 60));
        const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
        
        if (hours > 0) {
          return `${hours}h ${minutes}m`;
        } else {
          return `${minutes}m`;
        }
      }
    }
  }
  
  return null;
};
