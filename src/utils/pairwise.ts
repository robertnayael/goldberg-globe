export function pairwise<T>(items: T[]): [T, T][] {
  return items.reduce<[T, T][]>((pairs, _, i) => {
    const a = items[i];
    const b = i < items.length - 1 ? items[i + 1] : items[0];
    pairs.push([a, b]);
    return pairs;
  }, []);
}
