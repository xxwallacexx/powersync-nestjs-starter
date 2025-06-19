export const asSet = <T>(value: string | undefined, defaults: T[]) => {
  const values = (value || '').replaceAll(/\s/g, '').split(',').filter(Boolean);
  return new Set(values.length === 0 ? defaults : (values as T[]));
};

export const setUnion = <T>(...sets: Set<T>[]): Set<T> => {
  const union = new Set(sets[0]);
  for (const set of sets.slice(1)) {
    for (const element of set) {
      union.add(element);
    }
  }
  return union;
};

export const setDifference = <T>(setA: Set<T>, ...sets: Set<T>[]): Set<T> => {
  const difference = new Set(setA);
  for (const set of sets) {
    for (const element of set) {
      difference.delete(element);
    }
  }
  return difference;
};

export const setIsSuperset = <T>(set: Set<T>, subset: Set<T>): boolean => {
  for (const element of subset) {
    if (!set.has(element)) {
      return false;
    }
  }
  return true;
};

export const setIsEqual = <T>(setA: Set<T>, setB: Set<T>): boolean => {
  return setA.size === setB.size && setIsSuperset(setA, setB);
};
