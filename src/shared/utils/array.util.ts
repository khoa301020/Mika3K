export function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  let currentIndex = arr.length;
  while (currentIndex > 0) {
    const randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [arr[currentIndex], arr[randomIndex]] = [
      arr[randomIndex],
      arr[currentIndex],
    ];
  }
  return arr;
}

export function randomArray<T>(array: T[], amount = 1): T[] {
  return shuffle(array).slice(0, amount);
}

export function splitToChunks<T>(array: T[], chunkSize: number): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    result.push(array.slice(i, i + chunkSize));
  }
  return result;
}

export function arrayDiff<T extends { id: any }>(arr1: T[], arr2: T[]): T[] {
  return arr1.filter((obj1) => {
    const obj2 = arr2.find((o) => o.id === obj1.id);
    return JSON.stringify(obj1) !== JSON.stringify(obj2);
  });
}

export const sortArray = {
  asc: <T>(arr: T[], field: keyof T) =>
    [...arr].sort((a, b) => (a[field] > b[field] ? 1 : -1)),
  desc: <T>(arr: T[], field: keyof T) =>
    [...arr].sort((a, b) => (a[field] > b[field] ? -1 : 1)),
};

export function getRandomInteger(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min)) + min;
}

export function average(array: number[]): number {
  return array.reduce((a, b) => a + b, 0) / array.length;
}
