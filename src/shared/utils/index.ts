export const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

export const addDayTo = (date: Date) => {
  const day = 60 * 60 * 24 * 1000;
  return new Date(date.getTime() + day);
};
