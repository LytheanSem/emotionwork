/**
 * Utility functions for generating available time slots for booking
 */

export interface TimeSlot {
  date: string;
  timeSlots: string[];
}

/**
 * Parse YYYY-MM-DD string as local date to avoid timezone issues
 * @param dateString - Date in YYYY-MM-DD format
 */
function parseYMD(dateString: string): Date {
  const [year, month, day] = dateString.split("-").map(Number);
  return new Date(year, month - 1, day);
}

/**
 * Format date to YYYY-MM-DD string using local date methods
 * @param date - Date object
 */
function formatDateToYMD(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Generates time slots for the next 7 weekdays (Monday-Friday)
 * Operational hours: 7am to 7pm with 12pm-1pm lunch break
 * Each slot is 1 hour in length
 * Excludes weekends (Saturday and Sunday)
 */
export function generateTimeSlots(bookedSlots: string[] = []): TimeSlot[] {
  const slots: TimeSlot[] = [];
  const now = new Date();

  // DST-safe helper function for adding days
  const addDays = (date: Date, days: number): Date => {
    const newDate = new Date(date);
    newDate.setDate(newDate.getDate() + days);
    return newDate;
  };

  // Always start from tomorrow (no same-day booking)
  const startDate = new Date(now);
  startDate.setDate(now.getDate() + 1);

  let currentDate = new Date(startDate);
  let weekdayCount = 0;

  // Find the next 7 weekdays (Monday-Friday)
  while (weekdayCount < 7) {
    const dayOfWeek = currentDate.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday

    // Skip weekends (Saturday = 6, Sunday = 0)
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      // Since we don't allow same-day booking, isToday is always false
      const timeSlots = generateTimeSlotsForDate(currentDate, false, bookedSlots);

      if (timeSlots.length > 0) {
        slots.push({
          date: formatDateToYMD(currentDate), // YYYY-MM-DD format using local date
          timeSlots,
        });
      }
      weekdayCount++;
    }

    // Move to next day (DST-safe)
    currentDate = addDays(currentDate, 1);
  }

  return slots;
}

/**
 * Generates time slots for a specific date
 * @param date - The date to generate slots for
 * @param isToday - Whether this is today (to filter out past times)
 * @param bookedSlots - Array of booked slot IDs in format "date-time"
 */
function generateTimeSlotsForDate(date: Date, isToday: boolean, bookedSlots: string[] = []): string[] {
  const timeSlots: string[] = [];
  const now = new Date();

  const dateString = formatDateToYMD(date);

  // Morning slots: 7am to 12pm
  for (let hour = 7; hour < 12; hour++) {
    if (isToday) {
      const slotTime = new Date(date);
      slotTime.setHours(hour, 0, 0, 0);

      // Skip if the slot time has already passed
      if (slotTime <= now) {
        continue;
      }
    }

    const timeString = formatTime(hour);
    const slotId = `${dateString}-${timeString}`;

    // Skip if slot is already booked
    if (bookedSlots.includes(slotId)) {
      continue;
    }

    timeSlots.push(timeString);
  }

  // Afternoon slots: 1pm to 7pm (lunch break 12pm-1pm)
  for (let hour = 13; hour < 19; hour++) {
    if (isToday) {
      const slotTime = new Date(date);
      slotTime.setHours(hour, 0, 0, 0);

      // Skip if the slot time has already passed
      if (slotTime <= now) {
        continue;
      }
    }

    const timeString = formatTime(hour);
    const slotId = `${dateString}-${timeString}`;

    // Skip if slot is already booked
    if (bookedSlots.includes(slotId)) {
      continue;
    }

    timeSlots.push(timeString);
  }

  return timeSlots;
}

/**
 * Formats hour to 12-hour time format
 * @param hour - Hour in 24-hour format (0-23)
 */
function formatTime(hour: number): string {
  const period = hour >= 12 ? "PM" : "AM";
  const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return `${displayHour}:00 ${period}`;
}

/**
 * Checks if a specific date and time slot is still available
 * @param date - Date in YYYY-MM-DD format
 * @param time - Time in 12-hour format (e.g., "9:00 AM")
 */
export function isTimeSlotAvailable(date: string, time: string): boolean {
  const slotDate = parseYMD(date);
  const now = new Date();

  // Check if the date is in the past
  if (slotDate < new Date(now.getFullYear(), now.getMonth(), now.getDate())) {
    return false;
  }

  // If it's today, check if the time has passed
  if (
    slotDate.getFullYear() === now.getFullYear() &&
    slotDate.getMonth() === now.getMonth() &&
    slotDate.getDate() === now.getDate()
  ) {
    const slotHour = parseTimeToHour(time);
    const currentHour = now.getHours();

    // If current time is past the slot time, it's not available
    if (currentHour > slotHour) {
      return false;
    }
  }

  return true;
}

/**
 * Parses time string to 24-hour format hour
 * @param time - Time in 12-hour format (e.g., "9:00 AM")
 */
function parseTimeToHour(time: string): number {
  const [timePart, period] = time.split(" ");
  const [hour] = timePart.split(":").map(Number);

  if (period === "PM" && hour !== 12) {
    return hour + 12;
  } else if (period === "AM" && hour === 12) {
    return 0;
  }

  return hour;
}

/**
 * Gets the next available time slot
 */
export function getNextAvailableSlot(): { date: string; time: string } | null {
  const slots = generateTimeSlots();

  for (const slot of slots) {
    for (const time of slot.timeSlots) {
      if (isTimeSlotAvailable(slot.date, time)) {
        return { date: slot.date, time };
      }
    }
  }

  return null;
}

/**
 * Formats date for display
 * @param dateString - Date in YYYY-MM-DD format
 */
export function formatDateForDisplay(dateString: string): string {
  const date = parseYMD(dateString);
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * Gets the current operational status
 */
export function getOperationalStatus(): {
  isOpen: boolean;
  nextOpenTime?: string;
  message: string;
} {
  const now = new Date();
  const currentHour = now.getHours();

  // Check if we're in lunch break
  if (currentHour === 12) {
    return {
      isOpen: false,
      nextOpenTime: "1:00 PM",
      message: "We are currently on lunch break. We will be back at 1:00 PM.",
    };
  }

  // Closed before 7am, after 7pm, or weekends
  const isWeekend = now.getDay() === 0 || now.getDay() === 6;
  if (currentHour < 7 || currentHour >= 19 || isWeekend) {
    const nextOpen = new Date(now);

    // Compute next open day at 7:00 AM local, skipping weekends
    if (currentHour < 7 && !isWeekend) {
      nextOpen.setHours(7, 0, 0, 0);
    } else {
      // move to next day
      nextOpen.setDate(nextOpen.getDate() + 1);
      nextOpen.setHours(7, 0, 0, 0);

      // skip weekends
      while (nextOpen.getDay() === 0 || nextOpen.getDay() === 6) {
        nextOpen.setDate(nextOpen.getDate() + 1);
      }
    }

    const timeStr = nextOpen.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

    const isSameDay =
      nextOpen.getFullYear() === now.getFullYear() &&
      nextOpen.getMonth() === now.getMonth() &&
      nextOpen.getDate() === now.getDate();

    const dayPart = isSameDay ? "today" : nextOpen.toLocaleDateString("en-US", { weekday: "long" });

    return {
      isOpen: false,
      nextOpenTime: timeStr,
      message: `We are currently closed. We will be open ${dayPart} at ${timeStr}.`,
    };
  }

  return {
    isOpen: true,
    message: "We are currently open and accepting bookings.",
  };
}
