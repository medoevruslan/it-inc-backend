export const generateId = () => {
  return Date.now() + Math.random();
};

export const addDayTo = (date: Date) => {
  const day = 60 * 60 * 24 * 1000;
  return new Date(date.getTime() + day);
};
