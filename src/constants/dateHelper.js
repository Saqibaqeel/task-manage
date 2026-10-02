export const parseDateValue = (value) => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value || ''));
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const isLeapYear = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  const daysInMonth = [31, isLeapYear ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

  if (month < 1 || month > 12 || day < 1 || day > daysInMonth[month - 1]) {
    return null;
  }

  const date = new Date(0);
  date.setFullYear(year, month - 1, day);
  date.setHours(0, 0, 0, 0);
  return date;
};

export const formatDate = (value) => {
  if (!value) return null;

  const valueString = String(value);
  const isDateOnlyValue = /^\d{4}-\d{2}-\d{2}$/.test(valueString);
  const date = parseDateValue(valueString) || (
    isDateOnlyValue ? null : new Date(valueString)
  );

  if (!date || Number.isNaN(date.getTime())) return valueString;

  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};