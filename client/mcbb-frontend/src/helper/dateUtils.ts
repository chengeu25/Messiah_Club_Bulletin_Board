/**
 * Returns a new date with the specified number of days subtracted from it
 * @param date The date to subtract days from
 * @param days The number of days to subtract
 * @returns The new date
 */
export const subtractDays = (date: Date, days: number) => {
  const result = new Date(date); // Create a new Date object to avoid mutating the original date
  result.setDate(result.getDate() - days); // Subtract the days
  return result; // Return the new date
};

/**
 * Get the name of the day of the week of a date
 * @param date The date to get the day name from
 * @returns The day name of the date
 */
export const getDayName = (date: Date) => {
  const daysOfWeek = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday'
  ];
  const dayIndex = date.getDay(); // getDay() returns a number from 0 (Sunday) to 6 (Saturday)
  return daysOfWeek[dayIndex];
};
