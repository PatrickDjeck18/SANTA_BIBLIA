/**
 * Utility functions for handling dates across the application
 */

/**
 * Safely parses a date from various formats (Firebase Timestamp, ISO string, Date object, etc.)
 * @param dateInput - The date input to parse
 * @param fallbackDate - Optional fallback date if parsing fails (defaults to current time)
 * @returns A valid Date object
 */
export function parseDate(dateInput: any, fallbackDate?: Date): Date {
  // If already a valid Date object, return it
  if (dateInput instanceof Date && !isNaN(dateInput.getTime())) {
    return dateInput;
  }

  // Handle Firebase Timestamp objects
  if (dateInput && typeof dateInput.toDate === 'function') {
    try {
      const parsedDate = dateInput.toDate();
      if (parsedDate instanceof Date && !isNaN(parsedDate.getTime())) {
        return parsedDate;
      }
    } catch (error) {
      console.warn('Failed to parse Firebase Timestamp:', error);
    }
  }

  // Handle string dates (ISO strings, etc.)
  if (typeof dateInput === 'string' && dateInput.trim()) {
    try {
      const parsedDate = new Date(dateInput);
      if (!isNaN(parsedDate.getTime())) {
        return parsedDate;
      }
    } catch (error) {
      console.warn('Failed to parse string date:', dateInput, error);
    }
  }

  // Handle numeric timestamps (milliseconds)
  if (typeof dateInput === 'number' && !isNaN(dateInput)) {
    try {
      const parsedDate = new Date(dateInput);
      if (!isNaN(parsedDate.getTime())) {
        return parsedDate;
      }
    } catch (error) {
      console.warn('Failed to parse numeric timestamp:', dateInput, error);
    }
  }

  // Return fallback date or current time
  const fallback = fallbackDate || new Date();
  console.warn('Date parsing failed, using fallback date:', fallback);
  return fallback;
}

/**
 * Formats a date for display in the UI
 * @param dateInput - The date input to format
 * @param options - Intl.DateTimeFormatOptions for formatting
 * @returns Formatted date string
 */
export function formatDate(dateInput: any, options?: Intl.DateTimeFormatOptions): string {
  const date = parseDate(dateInput);
  
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options
  };

  try {
    return date.toLocaleDateString(undefined, defaultOptions);
  } catch (error) {
    console.warn('Date formatting failed:', error);
    return 'Invalid Date';
  }
}

/**
 * Formats a time for display in the UI
 * @param dateInput - The date input to format
 * @param options - Intl.DateTimeFormatOptions for formatting
 * @returns Formatted time string
 */
export function formatTime(dateInput: any, options?: Intl.DateTimeFormatOptions): string {
  const date = parseDate(dateInput);
  
  const defaultOptions: Intl.DateTimeFormatOptions = {
    hour: '2-digit',
    minute: '2-digit',
    ...options
  };

  try {
    return date.toLocaleTimeString(undefined, defaultOptions);
  } catch (error) {
    console.warn('Time formatting failed:', error);
    return 'Invalid Time';
  }
}

/**
 * Checks if a date is today
 * @param dateInput - The date input to check
 * @returns True if the date is today
 */
export function isToday(dateInput: any): boolean {
  const date = parseDate(dateInput);
  const today = new Date();
  
  return date.toDateString() === today.toDateString();
}

/**
 * Checks if a date is yesterday
 * @param dateInput - The date input to check
 * @returns True if the date is yesterday
 */
export function isYesterday(dateInput: any): boolean {
  const date = parseDate(dateInput);
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  
  return date.toDateString() === yesterday.toDateString();
}

/**
 * Gets a relative date string (Today, Yesterday, or formatted date)
 * @param dateInput - The date input to format
 * @returns Relative date string
 */
export function getRelativeDateString(dateInput: any): string {
  const date = parseDate(dateInput);
  
  if (isToday(dateInput)) {
    return 'Today';
  }
  
  if (isYesterday(dateInput)) {
    return 'Yesterday';
  }
  
  return formatDate(date);
}
