import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import {
  format,
  formatDistanceToNowStrict,
  isToday as fnsIsToday,
  formatISO,
  isValid,
  type FormatOptions,
  type Locale,
} from 'date-fns';
import { enUS } from 'date-fns/locale';
import { toDate, formatInTimeZone, toZonedTime, type ToDateOptionsWithTZ } from 'date-fns-tz';

/**
 * Interface for format options with time zone support
 */
interface FormatOptionsWithTZ extends Omit<FormatOptions, 'locale'> {
  locale?: FormatOptions['locale'] & Pick<Locale, 'code'>;
  timeZone?: string;
  originalDate?: Date | string | number;
}

/**
 * Utility to merge class names with Tailwind CSS support
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Date utility functions using date-fns and date-fns-tz
 */
type DateInput = string | number | Date;

/**
 * Convert input to a valid Date object with optional time zone support.
 * @param input - A string, number, or Date
 * @param options - Optional time zone or parsing options
 * @throws Error if the input is invalid or results in an invalid Date
 */
function toDateWithTZ(input: DateInput, options: ToDateOptionsWithTZ = {}): Date {
  if (input == null) {
    throw new Error('Invalid date input: input cannot be null or undefined');
  }
  try {
    // If input is a string with microseconds, truncate to milliseconds
    let normalizedInput = input;
    if (typeof input === 'string' && input.includes('T') && input.includes('.')) {
      const [datePart, timePart] = input.split('.');
      const milliseconds = timePart.slice(0, 3); // Take first 3 digits for milliseconds
      normalizedInput = `${datePart}.${milliseconds}Z`; // Assume UTC for ISO strings
    }
    const date = toDate(normalizedInput, options);
    if (!isValid(date)) {
      throw new Error('Invalid date input: resulted in an invalid Date object');
    }
    return date;
  } catch (error) {
    throw new Error(`Failed to parse date: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Validate a time zone string
 * @param timeZone - The time zone to validate (e.g., 'Europe/Tallinn')
 * @returns True if valid, false otherwise
 */
function isValidTimeZone(timeZone?: string): boolean {
  if (!timeZone) return true; // No time zone is valid (uses local time)
  try {
    Intl.DateTimeFormat('en-US', { timeZone }).format(new Date());
    return true;
  } catch {
    return false;
  }
}

/**
 * Format a date to a relative time string (e.g., "now", "5 minutes ago").
 * @param input - A valid date input
 * @param timeZone - Optional time zone (e.g., 'Europe/Tallinn' for EEST)
 */
export function formatRelativeTime(input: DateInput, timeZone?: string): string {
  const date = toDateWithTZ(input);
  const now = new Date();

  if (timeZone && !isValidTimeZone(timeZone)) {
    throw new Error(`Invalid time zone: ${timeZone}`);
  }

  // Convert dates to the specified time zone (if provided) or use local time
  const zonedDate = timeZone ? toZonedTime(date, timeZone) : date;
  const zonedNow = timeZone ? toZonedTime(now, timeZone) : now;

  // Use a small threshold (5 seconds) for "now"
  const diffInSeconds = Math.abs((zonedNow.getTime() - zonedDate.getTime()) / 1000);
  if (diffInSeconds <= 5) return 'now';

  return formatDistanceToNowStrict(zonedDate, {
    addSuffix: true,
    locale: enUS,
  });
}

/**
 * Format a date to a localized date string (e.g., "May 17, 2025").
 * @param input - A valid date input
 * @param timeZone - Optional time zone
 */
export function formatDate(input: DateInput, timeZone?: string): string {
  const date = toDateWithTZ(input);
  if (timeZone && !isValidTimeZone(timeZone)) {
    throw new Error(`Invalid time zone: ${timeZone}`);
  }
  return formatInTimeZone(date, timeZone ?? 'UTC', 'MMM d, yyyy', {
    // locale(Component: enUS)
  });
}

/**
 * Format a date to a localized date and time string (e.g., "May 17, 2025, 8:30 PM").
 * @param input - A valid date input
 * @param timeZone - Optional time zone
 */
export function formatDateTime(input: DateInput, timeZone?: string): string {
  const date = toDateWithTZ(input);
  if (timeZone && !isValidTimeZone(timeZone)) {
    throw new Error(`Invalid time zone: ${timeZone}`);
  }
  return formatInTimeZone(date, timeZone ?? 'UTC', 'MMM d, yyyy, h:mm a', {
    locale: enUS,
  });
}

/**
 * Check if a given date is today (in the specified time zone or local time).
 * @param input - A valid date input
 * @param timeZone - Optional time zone
 */
export function isToday(input: DateInput, timeZone?: string): boolean {
  const date = toDateWithTZ(input);
  if (timeZone && !isValidTimeZone(timeZone)) {
    throw new Error(`Invalid time zone: ${timeZone}`);
  }
  const zonedDate = timeZone ? toZonedTime(date, timeZone) : date;
  return fnsIsToday(zonedDate);
}

/**
 * Format a date to ISO format (YYYY-MM-DD).
 * @param input - A valid date input
 * @param timeZone - Optional time zone
 */
export function formatISODate(input: DateInput, timeZone?: string): string {
  const date = toDateWithTZ(input);
  if (timeZone && !isValidTimeZone(timeZone)) {
    throw new Error(`Invalid time zone: ${timeZone}`);
  }
  return formatInTimeZone(date, timeZone ?? 'UTC', 'yyyy-MM-dd', {
    locale: enUS,
  });
}