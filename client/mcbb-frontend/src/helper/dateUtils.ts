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

/**
 * Get the date one year ago
 * @returns string The date one year ago as a string
 */
export const oneYearAgo = () => {
  // Get the current date
  const currentDate = new Date();

  // Subtract one year
  const lastYearDate = new Date(
    currentDate.setFullYear(currentDate.getFullYear() - 1)
  );

  // Format the date as YYYY-MM-DD
  const yearAgoString = lastYearDate.toISOString().split('T')[0];

  return yearAgoString;
};
