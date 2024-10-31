export const getMostRecentSunday = (date: Date) => {
  const dayOfWeek = date.getDay();
  if (dayOfWeek === 0) {
    return date;
  }
  const mostRecentSunday = new Date(date);
  mostRecentSunday.setDate(date.getDate() - dayOfWeek);
  return mostRecentSunday;
};

export const getNextSaturday = (date: Date) => {
  const dayOfWeek = date.getDay();
  if (dayOfWeek === 6) {
    return date;
  }
  const nextSaturday = new Date(date);
  const daysUntilSaturday = (6 - dayOfWeek + 7) % 7;
  nextSaturday.setDate(
    date.getDate() + (daysUntilSaturday === 0 ? 7 : daysUntilSaturday)
  );
  return nextSaturday;
};

export const getMonthName = (date: Date) =>
  date.toLocaleString('default', { month: 'long' });
