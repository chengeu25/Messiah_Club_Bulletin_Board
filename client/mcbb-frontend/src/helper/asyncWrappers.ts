export const someAsync = async (
  array: any[],
  callback: (value: any, index: number, array: any[]) => unknown
) => {
  const results = await Promise.all(array.map(callback));
  return results.some((result) => result);
};

export const filterAsync = async <T>(
  array: T[],
  callback: (value: T, index: number, array: T[]) => Promise<boolean>
): Promise<T[]> => {
  const results = await Promise.all(array.map(callback));
  return array.filter((_, index) => results[index]);
};
